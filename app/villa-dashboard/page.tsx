import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VillaDashboardClient from "./VillaDashboardClient";

export const dynamic = "force-dynamic";

export default async function VillaDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

    // الدور وحده لا يمنح الوصول: يجب أن يكون المدير نشطاً وأن يوجد عقد موقع.
    if (profile?.role !== "villa_owner") {
        redirect("/dashboard");
    }

    const { data: manager, error: managerError } = await supabase
        .from("managers")
        .select("id, name, status, created_at")
        .eq("profile_id", user.id)
        .eq("status", "active")
        .maybeSingle();

    if (managerError || !manager) {
        redirect("/dashboard");
    }

    const { data: activeTemplate, error: templateError } = await supabase
        .from("contract_templates")
        .select("id, created_at")
        .eq("is_active", true)
        .maybeSingle();

    if (templateError || !activeTemplate) {
        redirect("/dashboard");
    }

    const { data: signedActiveContract } = await supabase
        .from("manager_contracts")
        .select("id")
        .eq("manager_id", manager.id)
        .eq("template_id", activeTemplate.id)
        .eq("agreed_to_terms", true)
        .not("signed_at", "is", null)
        .limit(1)
        .maybeSingle();

    let needsNewContract = false;
    let deadline = null;

    if (!signedActiveContract) {
        // لم يوقع العقد الفعال الجديد. نحسب المهلة.
        const templateDate = new Date(activeTemplate.created_at).getTime();
        const now = new Date().getTime();

        // 5 دقائق للتجربة (5 * 60 * 1000 = 300000). سيتم تغييرها لاحقاً لـ 30 يوماً.
        // const GRACE_PERIOD_MS = 5 * 60 * 1000; 
        const GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

        if (now - templateDate > GRACE_PERIOD_MS) {
            // انتهت المهلة، توجيه إجباري للتوقيع
            redirect("/dashboard/apply/contract");
        } else {
            // ضمن المهلة، نعرض له إشعاراً
            needsNewContract = true;
            deadline = new Date(templateDate + GRACE_PERIOD_MS).toISOString();
        }
    }

    return (
        <VillaDashboardClient
            fullName={profile?.full_name || user.phone || ""}
            manager={manager}
            needsNewContract={needsNewContract}
            deadline={deadline}
        />
    );
}
