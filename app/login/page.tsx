"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toEnglishDigits, formatPalestinianPhone } from "@/lib/utils";

type Method = "email" | "phone";

export default function LoginPage() {
    const [method, setMethod] = useState<Method>("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    // إعادة توجيه المستخدم المسجل مسبقاً
    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();
                if (profile?.role === "villa_owner") router.replace("/villa-dashboard");
                else router.replace("/dashboard");
            } else {
                setChecking(false);
            }
        };
        checkSession();
    }, [router]);

    if (checking) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[var(--color-sand)]">
                <p className="font-tajawal text-[var(--color-ink)]/50 text-sm">جاري التحقق...</p>
            </main>
        );
    }


    function handlePhoneChange(raw: string) {
        const digits = toEnglishDigits(raw).replace(/\D/g, "").slice(0, 10);
        setPhone(digits);
    }

    async function handleEmailSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        setLoading(false);

        if (error) {
            setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
            return;
        }

        router.push("/dashboard");
    }

    async function handlePhoneSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (phone.length !== 10) {
            setError("لازم يكون الرقم ١٠ خانات (مثال: 0599123456)");
            return;
        }

        setLoading(true);
        const fullPhone = formatPalestinianPhone(phone);
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });

        setLoading(false);

        if (error) {
            setError("صار في خطأ، حاول مرة ثانية");
            return;
        }

        router.push(`/login/verify?method=phone&value=${encodeURIComponent(fullPhone)}`);
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[var(--color-sand)] px-6">
            <div className="w-full max-w-sm bg-[var(--color-panel)] rounded-2xl shadow-sm border border-[var(--color-clay)]/15 p-8">
                <h1 className="font-amiri text-2xl text-[var(--color-ink)] mb-2">تسجيل الدخول</h1>
                <p className="font-tajawal text-sm text-[var(--color-ink)]/60 mb-6">اختر طريقة الدخول</p>

                <div className="flex gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => setMethod("email")}
                        className={`flex-1 py-2 rounded-lg font-tajawal text-sm transition ${method === "email"
                                ? "bg-[var(--color-clay)] text-[var(--color-panel)]"
                                : "bg-[var(--color-ink)]/5 text-[var(--color-ink)]/70"
                            }`}
                    >
                        البريد الإلكتروني
                    </button>
                    <button
                        type="button"
                        onClick={() => setMethod("phone")}
                        className={`flex-1 py-2 rounded-lg font-tajawal text-sm transition ${method === "phone"
                                ? "bg-[var(--color-clay)] text-[var(--color-panel)]"
                                : "bg-[var(--color-ink)]/5 text-[var(--color-ink)]/70"
                            }`}
                    >
                        رقم الهاتف
                    </button>
                </div>

                {method === "email" ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <input
                            type="email"
                            required
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            dir="ltr"
                            className="w-full font-tajawal text-sm border border-[var(--color-ink)]/15 rounded-xl px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-ink)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/40"
                        />
                        <input
                            type="password"
                            required
                            placeholder="كلمة المرور"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            dir="ltr"
                            className="w-full font-tajawal text-sm border border-[var(--color-ink)]/15 rounded-xl px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-ink)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/40"
                        />
                        {error && <p className="font-tajawal text-xs text-red-600">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full font-tajawal font-medium text-[var(--color-panel)] bg-[var(--color-clay)] rounded-xl py-3 transition hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? "جاري الدخول..." : "دخول"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                        <div className="flex items-center border border-[var(--color-ink)]/15 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[var(--color-clay)]/40">
                            <span className="font-tajawal text-sm text-[var(--color-ink)]/60 px-3 border-l border-[var(--color-ink)]/15 bg-[var(--color-ink)]/5">
                                972+
                            </span>
                            <input
                                type="tel"
                                required
                                inputMode="numeric"
                                placeholder="0599123456"
                                value={phone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                dir="ltr"
                                className="flex-1 font-tajawal text-sm px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-ink)]/30 focus:outline-none"
                            />
                        </div>
                        {error && <p className="font-tajawal text-xs text-red-600">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full font-tajawal font-medium text-[var(--color-panel)] bg-[var(--color-clay)] rounded-xl py-3 transition hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}