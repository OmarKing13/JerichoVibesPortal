"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function VerifyForm() {
    const params = useSearchParams();
    const value = params.get("value") ?? "";
    const [step, setStep] = useState<"code" | "name">("code");
    const [code, setCode] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();
        const { data, error } = await supabase.auth.verifyOtp({
            phone: value,
            token: code,
            type: "sms",
        });

        if (error || !data.user) {
            setLoading(false);
            setError("الرمز غير صحيح أو منتهي الصلاحية");
            return;
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", data.user.id)
            .maybeSingle();

        setLoading(false);

        if (profile?.full_name) {
            router.push("/dashboard");
        } else {
            setStep("name");
        }
    }

    async function handleNameSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            setError("انتهت الجلسة، حاول تسجل الدخول مرة ثانية");
            return;
        }

        const { error } = await supabase.from("profiles").upsert({
            id: user.id,
            full_name: fullName,
            phone_number: value,
            role: "customer",
        });

        setLoading(false);

        if (error) {
            setError("صار في خطأ بحفظ الاسم، حاول مرة ثانية");
            return;
        }

        router.push("/dashboard");
    }

    if (step === "name") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[var(--color-sand)] px-6">
                <div className="w-full max-w-sm bg-[var(--color-panel)] rounded-2xl shadow-sm border border-[var(--color-clay)]/15 p-8">
                    <h1 className="font-amiri text-2xl text-[var(--color-ink)] mb-2">آخر خطوة</h1>
                    <p className="font-tajawal text-sm text-[var(--color-ink)]/60 mb-6">شو اسمك الكامل؟</p>
                    <form onSubmit={handleNameSubmit} className="space-y-4">
                        <input
                            type="text"
                            required
                            placeholder="الاسم الكامل"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full font-tajawal text-sm border border-[var(--color-ink)]/15 rounded-xl px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-ink)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/40"
                        />
                        {error && <p className="font-tajawal text-xs text-red-600">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full font-tajawal font-medium text-[var(--color-panel)] bg-[var(--color-clay)] rounded-xl py-3 transition hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? "جاري الحفظ..." : "إنشاء الحساب"}
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[var(--color-sand)] px-6">
            <div className="w-full max-w-sm bg-[var(--color-panel)] rounded-2xl shadow-sm border border-[var(--color-clay)]/15 p-8">
                <h1 className="font-amiri text-2xl text-[var(--color-ink)] mb-2">رمز التحقق</h1>
                <p className="font-tajawal text-sm text-[var(--color-ink)]/60 mb-6">أدخل الرمز اللي وصلك على {value}</p>
                <form onSubmit={handleVerify} className="space-y-4">
                    <input
                        type="text"
                        inputMode="numeric"
                        required
                        placeholder="123456"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        dir="ltr"
                        className="w-full font-tajawal text-center tracking-[0.5em] text-lg border border-[var(--color-ink)]/15 rounded-xl px-4 py-3 text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/40"
                    />
                    {error && <p className="font-tajawal text-xs text-red-600 text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full font-tajawal font-medium text-[var(--color-panel)] bg-[var(--color-clay)] rounded-xl py-3 transition hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? "جاري التحقق..." : "تأكيد"}
                    </button>
                </form>
            </div>
        </main>
    );
}

export default function VerifyPage() {
    return (
        <Suspense>
            <VerifyForm />
        </Suspense>
    );
}