import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ContractClient from "./ContractClient";
import { getContractContent } from "@/lib/contracts/content";

export default async function ContractPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // جلب بيانات المدير الذي لم يوقع العقد بعد
    const { data: manager } = await supabase
        .from("managers")
        .select("*")
        .eq("profile_id", user.id)
        .in("status", ["pending_contract", "active"])
        .maybeSingle();

    if (!manager) {
        // إذا لم يكن لديه طلب معلق، نعيده للداشبورد أو صفحة التقديم
        redirect("/dashboard");
    }

    const { data: template } = await supabase
        .from("contract_templates")
        .select("version")
        .eq("is_active", true)
        .maybeSingle();

    if (!template?.version) {
        redirect("/dashboard");
    }

    const contractContent = getContractContent(template.version);
    if (!contractContent) {
        redirect("/dashboard");
    }

    const isRenewal = manager.status === "active";

    return (
        <main className="min-h-screen bg-[var(--color-sand)] py-6 px-4">
            <ContractClient manager={manager} content={contractContent} isRenewal={isRenewal} />
        </main>
    );
}
