import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // لا يكفي الدور وحده: لا نسمح بالدخول للوحة المالك إلا بمدير فعّال
    // وبعقد موقّع. هذا الاستعلام ينفّذ مع كل تحميل للصفحة.
    if (profile?.role === "villa_owner") {
        const { data: manager } = await supabase
            .from("managers")
            .select("id, status")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (manager?.status === "pending_contract") {
            redirect("/dashboard/apply/contract");
        }

        if (manager?.status === "active") {
            const { data: signedContract } = await supabase
                .from("manager_contracts")
                .select("id")
                .eq("manager_id", manager.id)
                .eq("agreed_to_terms", true)
                .not("signed_at", "is", null)
                .limit(1)
                .maybeSingle();

            if (signedContract) redirect("/villa-dashboard");
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-sand)] px-6">
            <div className="w-full max-w-md bg-[var(--color-panel)] rounded-2xl shadow-sm border border-[var(--color-clay)]/15 p-8 text-center font-tajawal">
                <h1 className="font-amiri text-3xl text-[var(--color-ink)] mb-4">
                    أهلاً بك، {profile?.full_name || user.phone}
                </h1>
                <p className="text-[var(--color-ink)]/60 mb-8">
                    سعداء بوجودك معنا في بوابة Jericho Vibes
                </p>

                {profile?.role === "villa_owner" && (
                    <p className="text-sm text-amber-800 bg-amber-50 rounded-xl p-4 mb-6">
                        حساب الفيلا غير فعّال حالياً أو يحتاج إلى توقيع عقد صالح. تواصل مع الإدارة لإعادة تفعيل الحساب.
                    </p>
                )}

                {profile?.role === "customer" && (
                    <div className="mt-6 pt-6 border-t border-[var(--color-clay)]/15">
                        <p className="text-sm text-[var(--color-ink)]/70 mb-4">
                            هل تملك فيلا وترغب في الانضمام إلينا؟
                        </p>
                        <Link
                            href="/dashboard/apply"
                            className="block w-full font-tajawal font-medium text-[var(--color-panel)] bg-[var(--color-clay)] rounded-xl py-3 transition hover:opacity-90"
                        >
                            تقدم بطلب إدراج الفلل الخاصة بك
                        </Link>
                    </div>
                )}

                <LogoutButton />
            </div>
        </main>
    );
}
