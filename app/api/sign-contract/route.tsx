import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { getContractTemplate } from "@/lib/contracts/templates";
import { getContractContent } from "@/lib/contracts/content";
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

        const headersList = await headers();
        const ipAddress =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            "unknown";
        const userAgent = req.headers.get("user-agent") || "Unknown";

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
                { error: `نسخة العقد ${template.version} غير مدعومة` },
                { status: 500 }
            );
        }

        // ← جلب المحتوى المنظّم
        const contractContent = getContractContent(template.version);
        if (!contractContent) {
            return NextResponse.json(
                { error: `محتوى العقد ${template.version} غير موجود` },
                { status: 500 }
            );
        }

        const currentDate = new Date().toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        const ReactPdf = await import("@react-pdf/renderer");

        const contractDocument = createElement(ContractTemplate, {
            contractData: contractContent.contract,  // ← الهيكل الجديد
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

        const crypto = await import("crypto");
        const contractHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

        const fileName = `${managerId}-${contractHash}.pdf`;
        const { error: uploadError } = await supabase.storage
            .from("contracts")
            .upload(fileName, pdfBuffer, {
                contentType: "application/pdf",
                upsert: false,
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return NextResponse.json(
                { error: "فشل في رفع العقد" },
                { status: 500 }
            );
        }

        const pdfStorageUrl = `contracts/${fileName}`;

        const { error: contractError } = await supabase
            .from("manager_contracts")
            .insert({
                manager_id: manager.id,
                template_id: template.id,
                ip_address: ipAddress,
                user_agent: userAgent,
                pdf_storage_url: pdfStorageUrl,
                contract_hash: contractHash,
                agreed_to_terms: true,
            });

        if (contractError) {
            console.error("Contract insert error:", contractError);
            return NextResponse.json({ error: "فشل في تسجيل العقد" }, { status: 500 });
        }

        await supabase
            .from("managers")
            .update({ status: "active" })
            .eq("id", manager.id);

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