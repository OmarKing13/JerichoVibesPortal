"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ApplyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        phone_number: "",
        alt_phone_number: "",
        payment_preference: "cash",
        national_id: "",
    });

    const [existingId, setExistingId] = useState<string | null>(null);

    // جلب البيانات السابقة إن وجدت
    useEffect(() => {
        const fetchDraft = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("managers")
                .select("*")
                .eq("profile_id", user.id)
                .eq("status", "pending_contract")
                .maybeSingle();

            if (data) {
                setExistingId(data.id);
                setFormData({
                    name: data.name || "",
                    phone_number: data.phone_number || "",
                    alt_phone_number: data.alt_phone_number || "",
                    payment_preference: data.payment_preference || "cash",
                    national_id: data.national_id || "",
                });
            }
        };
        fetchDraft();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            setError("يجب تسجيل الدخول أولاً");
            return;
        }

        let dbError;
        if (existingId) {
            // تحديث الطلب المعلق
            const { error } = await supabase
                .from("managers")
                .update({
                    name: formData.name,
                    phone_number: formData.phone_number,
                    alt_phone_number: formData.alt_phone_number || null,
                    payment_preference: formData.payment_preference,
                    national_id: formData.national_id,
                })
                .eq("id", existingId);
            dbError = error;
        } else {
            // إنشاء طلب جديد
            const { error } = await supabase
                .from("managers")
                .insert({
                    profile_id: user.id,
                    name: formData.name,
                    phone_number: formData.phone_number,
                    alt_phone_number: formData.alt_phone_number || null,
                    payment_preference: formData.payment_preference,
                    national_id: formData.national_id,
                    status: "pending_contract",
                });
            dbError = error;
        }

        if (dbError) {
            setLoading(false);
            console.error(dbError);
            setError("حدث خطأ أثناء حفظ البيانات، تأكد من صحة الحقول.");
            return;
        }

        setLoading(false);
        router.push("/dashboard/apply/contract"); // التوجيه لصفحة العقد
    };

    return (
        <main className="min-h-screen bg-[var(--color-sand)] py-12 px-6">
            <div className="max-w-2xl mx-auto bg-[var(--color-panel)] rounded-2xl shadow-sm border border-[var(--color-clay)]/15 p-8">
                <h1 className="font-amiri text-3xl text-[var(--color-ink)] mb-2">
                    إدراج الفلل الخاصة بك (الخطوة 1 من 2)
                </h1>
                <p className="font-tajawal text-sm text-[var(--color-ink)]/60 mb-8">
                    يرجى تعبئة البيانات التالية بدقة، للانتقال لخطوة مراجعة وتوقيع العقد.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-tajawal text-sm mb-2 text-[var(--color-ink)]">
                                الاسم الرباعي
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full font-tajawal text-sm border border-[var(--color-ink)]/15 rounded-xl px-4 py-3 text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/40"
                            />
                        </div>

                        <div>
                            <label className="block font-tajawal text-sm mb-2 text-[var(--color-ink)]">
                                رقم الهوية الوطنية
                            </label>
                            <input
                                type="text"
                                name="national_id"
                                required
                                value={formData.national_id}
                                onChange={handleChange}
                                className="w-full font-tajawal text-sm border border-[var(--color-ink)]/15 rounded-xl px-4 py-3 text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/40"
                            />
                        </div>

                        <div>
                            <label className="block font-tajawal text-sm mb-2 text-[var(--color-ink)]">
                                رقم الجوال الأساسي
                            </label>
                            <input
                                type="tel"
                                name="phone_number"
                                required
                                dir="ltr"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="w-full text-left font-tajawal text-sm border border-[var(--color-ink)]/15 rounded-xl px-4 py-3 text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/40"
                            />
                        </div>

                        <div>
                            <label className="block font-tajawal text-sm mb-2 text-[var(--color-ink)]">
                                رقم جوال بديل (اختياري)
                            </label>
                            <input
                                type="tel"
                                name="alt_phone_number"
                                dir="ltr"
                                value={formData.alt_phone_number}
                                onChange={handleChange}
                                className="w-full text-left font-tajawal text-sm border border-[var(--color-ink)]/15 rounded-xl px-4 py-3 text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/40"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block font-tajawal text-sm mb-2 text-[var(--color-ink)]">
                                طريقة الدفع المفضلة
                            </label>
                            <select
                                name="payment_preference"
                                value={formData.payment_preference}
                                onChange={handleChange}
                                className="w-full font-tajawal text-sm border border-[var(--color-ink)]/15 rounded-xl px-4 py-3 text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/40 bg-white"
                            >
                                <option value="cash">كاش</option>
                                <option value="bank_transfer">تحويل بنكي</option>
                                <option value="wallet">محفظة إلكترونية</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <p className="font-tajawal text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full font-tajawal font-medium text-[var(--color-panel)] bg-[var(--color-clay)] rounded-xl py-4 transition hover:opacity-90 disabled:opacity-50 mt-4"
                    >
                        {loading ? "جاري الإرسال..." : "التالي"}
                    </button>
                </form>
            </div>
        </main>
    );
}
