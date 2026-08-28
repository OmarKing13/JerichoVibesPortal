"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh(); // إعادة تحميل الصفحة لضمان مسح البيانات
        router.push("/login");
    };

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full mt-4 font-tajawal text-sm text-[var(--color-ink)]/70 hover:text-[var(--color-ink)] bg-transparent border border-[var(--color-clay)]/20 hover:bg-[var(--color-ink)]/5 rounded-xl py-3 transition disabled:opacity-50"
        >
            {loading ? "جاري الخروج..." : "تسجيل الخروج"}
        </button>
    );
}
