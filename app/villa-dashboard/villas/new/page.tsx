import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddVillaRequestClient from "./AddVillaRequestClient";

export const dynamic = "force-dynamic";

export default async function NewVillaRequestPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, phone_number")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "villa_owner") {
        redirect("/dashboard");
    }

    const { data: manager, error: managerError } = await supabase
        .from("managers")
        .select("id, name, status, created_at, phone_number")
        .eq("profile_id", user.id)
        .eq("status", "active")
        .maybeSingle();

    if (managerError || !manager) {
        redirect("/villa-dashboard");
    }

    // جلب المرافق من جدول amenities_lookup
    const { data: amenitiesList } = await supabase
        .from("amenities_lookup")
        .select("id, name, icon_name")
        .order("name", { ascending: true });

    // جلب المدن من جدول cities
    const { data: cities } = await supabase
        .from("cities")
        .select("id, name")
        .order("name", { ascending: true });

    // جلب العملات من جدول currencies
    const { data: currencies } = await supabase
        .from("currencies")
        .select("id, name, symbol, code, is_default")
        .order("created_at", { ascending: true });

    return (
        <AddVillaRequestClient
            managerId={manager.id}
            defaultPhone={manager.phone_number || profile?.phone_number || user.phone || ""}
            availableAmenities={amenitiesList || []}
            availableCities={cities || []}
            availableCurrencies={currencies || []}
        />
    );
}
