import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { getContractTemplate } from "@/lib/contracts/templates";
import { createElement } from "react";

export async function POST(req: Request) {
    try {
        const { managerId } = await req.json();

        if (!managerId) {
            return NextResponse.json({ error: "معرف الطلب مطلوب" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
        }

        // استخراج IP و UserAgent بشكل صحيح
        const headersList = await headers();
        const ipAddress =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            "unknown";
        const userAgent = req.headers.get("user-agent") || "Unknown";

        // التأكد من أن الطلب يخص المستخدم (يمكن أن يكون معلق أو نشط ليتمكن من تجديد العقد)
        const { data: manager, error: managerError } = await supabase
            .from("managers")
            .select("*")
            .eq("id", managerId)
            .eq("profile_id", user.id)
            .in("status", ["pending_contract", "active"])
            .single();

        if (managerError || !manager) {
            return NextResponse.json({ error: "الطلب غير موجود أو تمت معالجته بالفعل" }, { status: 404 });
        }

        // جلب نسخة العقد الفعالة
        const { data: template, error: templateError } = await supabase
            .from("contract_templates")
            .select("id, version")
            .eq("is_active", true)
            .single();

        if (templateError || !template) {
            return NextResponse.json({ error: "لم يتم العثور على قالب العقد الفعال" }, { status: 500 });
        }

        const ContractTemplate = getContractTemplate(template.version);
        if (!ContractTemplate) {
            return NextResponse.json(
                { error: `نسخة العقد ${template.version} غير مدعومة في التطبيق` },
                { status: 500 }
            );
        }

        const currentDate = new Date().toLocaleDateString('ar-EG', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // توليد الـ PDF
        const ReactPdf = await import("@react-pdf/renderer");
        
        const contractDocument = createElement(ContractTemplate, {
                managerName: manager.name,
                nationalId: manager.national_id,
                phoneNumber: manager.phone_number,
                ipAddress,
                userAgent,
                date: currentDate,
            }) as unknown as Parameters<typeof ReactPdf.renderToStream>[0];
        const stream = await ReactPdf.renderToStream(contractDocument);

        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }
        const pdfBuffer = Buffer.concat(chunks);

        // حساب البصمة Hash
        const crypto = await import("crypto");
        const contractHash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

        // رفع الملف لـ Supabase Storage
        // البصمة تجعل اسم الملف فريداً وقابلاً للتدقيق من دون الاعتماد على وقت الخادم.
        const fileName = `${managerId}-${contractHash}.pdf`;
        const { error: uploadError } = await supabase.storage
            .from("contracts")
            .upload(fileName, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: false
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return NextResponse.json({ error: "فشل في رفع العقد، الرجاء التأكد من إعدادات سلة Storage" }, { status: 500 });
        }

        const pdfStorageUrl = `contracts/${fileName}`; // المسار

        // تسجيل العقد
        const { error: contractError } = await supabase
            .from("manager_contracts")
            .insert({
                manager_id: manager.id,
                template_id: template.id,
                ip_address: ipAddress,
                user_agent: userAgent,
                pdf_storage_url: pdfStorageUrl,
                contract_hash: contractHash,
                agreed_to_terms: true
            });

        if (contractError) {
            console.error("Contract insert error:", contractError);
            return NextResponse.json({ error: "فشل في تسجيل العقد" }, { status: 500 });
        }

        // تحديث حالة المدير
        await supabase
            .from("managers")
            .update({ status: "active" })
            .eq("id", manager.id);

        // تحديث حالة المستخدم إلى مالك فيلا 
        await supabase
            .from("profiles")
            .update({ role: "villa_owner" })
            .eq("id", user.id);

        return NextResponse.json({ success: true, pdfStorageUrl });
    } catch (error: unknown) {
        console.error("Sign contract error:", error);
        const details = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: "حدث خطأ غير متوقع", details }, { status: 500 });
    }
}
