import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VillasListClient from "./VillasListClient";

export const dynamic = "force-dynamic";

export default async function VillasPage() {
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
        redirect("/dashboard");
    }

    // جلب الفلل المعتمدة التابعة للمدير
    const { data: villas } = await supabase
        .from("villas")
        .select(`
            id,
            name,
            description,
            address,
            image_urls,
            max_guests,
            num_bedrooms,
            num_bathrooms,
            base_price_per_night,
            weekend_price_per_night,
            midweek_price_per_night,
            is_active,
            average_rating,
            villa_code,
            check_in_time,
            check_out_time,
            created_at
        `)
        .eq("manager_id", manager.id)
        .order("created_at", { ascending: false });

    // جلب طلبات إضافة الفلل للمدير (مع معالجة عدم وجود الجدول بأمان)
    let requests: any[] = [];
    try {
        const { data: reqs, error: reqError } = await supabase
            .from("villa_requests")
            .select("*")
            .eq("manager_id", manager.id)
            .order("created_at", { ascending: false });

        if (!reqError && reqs) {
            requests = reqs;
        }
    } catch {
        requests = [];
    }

    return (
        <VillasListClient
            managerName={manager.name || profile?.full_name || ""}
            managerId={manager.id}
            villas={villas || []}
            requests={requests}
        />
    );
}
