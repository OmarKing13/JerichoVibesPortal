import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
        }

        // جلب آخر عقد موقع للمدير
        const { data: manager, error: managerError } = await supabase
            .from("managers")
            .select("id")
            .eq("profile_id", user.id)
            .eq("status", "active")
            .maybeSingle();

        if (managerError) throw managerError;
        if (!manager) {
            return NextResponse.json({ error: "لا يوجد عقد موقع" }, { status: 404 });
        }

        const { data: activeTemplate, error: templateError } = await supabase
            .from("contract_templates")
            .select("id")
            .eq("is_active", true)
            .maybeSingle();

        if (templateError) throw templateError;
        if (!activeTemplate) {
            return NextResponse.json({ error: "لا يوجد قالب عقد فعّال" }, { status: 404 });
        }

        const { data: contract, error: contractError } = await supabase
            .from("manager_contracts")
            .select("pdf_storage_url")
            .eq("manager_id", manager.id)
            .eq("template_id", activeTemplate.id)
            .eq("agreed_to_terms", true)
            .not("signed_at", "is", null)
            .order("signed_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (contractError) throw contractError;
        if (!contract?.pdf_storage_url) {
            return NextResponse.json({ error: "ملف العقد غير موجود" }, { status: 404 });
        }

        // يقبل قيماً قديمة مثل contracts/file.pdf أو مسار الملف فقط.
        const filePath = contract.pdf_storage_url
            .replace(/^contracts\//, "")
            .replace(/^\/+/, "");

        // التحقق من ملكية العقد تم أعلاه؛ نستخدم مفتاح الخادم إن كان متاحاً
        // حتى لا تمنع سياسة Storage الخاصة رابط التحميل للمستخدم الصحيح.
        const storageClient = createAdminClient() ?? supabase;
        const { data: signedUrl, error } = await storageClient.storage
            .from("contracts")
            .createSignedUrl(filePath, 60 * 60);

        if (error || !signedUrl) {
            console.error("Contract signed URL error:", error);
            return NextResponse.json(
                {
                    error: "تعذر تجهيز ملف العقد للتنزيل. راجع إعدادات Storage أو مفتاح الخدمة على الخادم.",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({ url: signedUrl.signedUrl });
    } catch (error) {
        console.error("Contract download error:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء تجهيز العقد للتنزيل." },
            { status: 500 }
        );
    }
}
