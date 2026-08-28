"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navigationItems = [
    { label: "الرئيسية", description: "ملخص حسابك", active: true },
    { label: "ملف الفيلا", description: "بيانات الفيلا وصورها" },
    { label: "الحجوزات", description: "إدارة الحجوزات القادمة" },
    { label: "التقارير", description: "الأداء والإيرادات" },
    { label: "الإشعارات", description: "آخر التنبيهات" },
    { label: "الدعم", description: "تواصل مع الفريق" },
];

interface Props {
    fullName: string;
    manager: {
        id: string;
        name: string;
        status: string;
        created_at: string;
    } | null;
    needsNewContract: boolean;
    deadline: string | null;
}

export default function VillaDashboardClient({ fullName, manager, needsNewContract, deadline }: Props) {
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const router = useRouter();

    const handleDownloadContract = async () => {
        setDownloadLoading(true);
        setDownloadError(null);
        try {
            const res = await fetch("/api/contract-download");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "فشل في تحميل العقد");
            // فتح رابط التحميل المباشر
            window.open(data.url, "_blank");
        } catch (err: unknown) {
            setDownloadError(
                err instanceof Error ? err.message : "فشل في تحميل العقد"
            );
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleLogout = async () => {
        setLogoutLoading(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    const joinDate = manager?.created_at
        ? new Date(manager.created_at).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "";

    return (
        <main className="min-h-screen bg-[var(--color-sand)] p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
                <aside className="bg-[var(--color-palm)] text-[var(--color-panel)] rounded-2xl p-4 mb-6 lg:mb-0 lg:min-h-[calc(100vh-4rem)] lg:sticky lg:top-8 lg:self-start">
                    <div className="px-3 pt-2 pb-5">
                        <p className="font-tajawal text-xs tracking-widest text-[var(--color-gold)] uppercase">Jericho Vibes</p>
                        <h2 className="font-amiri text-2xl mt-1">بوابة المالك</h2>
                    </div>
                    <nav aria-label="التنقل في لوحة المالك" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                        {navigationItems.map((item) => (
                            <button
                                key={item.label}
                                type="button"
                                aria-current={item.active ? "page" : undefined}
                                title={item.description}
                                className={`shrink-0 text-right font-tajawal rounded-xl px-3 py-3 transition lg:w-full ${item.active
                                    ? "bg-[var(--color-gold)] text-[var(--color-ink)]"
                                    : "text-[var(--color-panel)]/80 hover:bg-white/10"
                                    }`}
                            >
                                <span className="block text-sm font-medium">{item.label}</span>
                                <span className="hidden lg:block text-xs opacity-65 mt-0.5">{item.description}</span>
                            </button>
                        ))}
                    </nav>
                    <p className="hidden lg:block font-tajawal text-xs text-[var(--color-panel)]/45 px-3 pt-6">
                        الأقسام الأخرى قيد التجهيز.
                    </p>
                </aside>

                <div className="space-y-6">
                
                {needsNewContract && (
                    <div className="bg-amber-50 border-r-4 border-amber-500 p-4 rounded-xl shadow-sm text-right" dir="rtl">
                        <div className="flex flex-col gap-3">
                            <div>
                                <h3 className="font-amiri text-lg text-amber-800 font-bold mb-1">
                                    تحديث هام للعقد
                                </h3>
                                <p className="font-tajawal text-sm text-amber-700">
                                    تم إصدار نسخة جديدة من عقد إدراج الفلل. يرجى الاطلاع على البنود الجديدة والموافقة عليها لضمان استمرار وصولك للوحة التحكم. 
                                    <br/>
                                    أمامك مهلة حتى تاريخ: <span className="font-bold">{deadline ? new Date(deadline).toLocaleString("ar-EG") : ""}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => router.push("/dashboard/apply/contract")}
                                className="font-tajawal text-sm bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition w-fit"
                            >
                                قراءة وتوقيع العقد الجديد
                            </button>
                        </div>
                    </div>
                )}

                {/* رأس الصفحة */}
                <div className="bg-[var(--color-palm)] text-[var(--color-panel)] rounded-2xl p-8 relative overflow-hidden">
                    <svg
                        className="absolute inset-0 w-full h-full opacity-10"
                        viewBox="0 0 400 200"
                    >
                        <circle cx="350" cy="100" r="120" fill="var(--color-gold)" />
                        <circle cx="50" cy="150" r="80" fill="var(--color-gold)" />
                    </svg>
                    <div className="relative z-10">
                        <p className="font-tajawal text-xs tracking-widest text-[var(--color-gold)] mb-2 uppercase">
                            Jericho Vibes — لوحة مالك الفيلا
                        </p>
                        <h1 className="font-amiri text-3xl mb-1">أهلاً، {fullName}</h1>
                        <p className="font-tajawal text-sm text-[var(--color-panel)]/70">
                            انضممت إلينا {joinDate}
                        </p>
                    </div>
                </div>

                {/* بطاقات الإحصائيات (عناصر نائبة) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[var(--color-panel)] rounded-2xl border border-[var(--color-clay)]/15 p-6 flex flex-col justify-between">
                        <p className="font-tajawal text-sm text-[var(--color-ink)]/60 mb-2">إجمالي المشاهدات</p>
                        <h3 className="font-amiri text-2xl text-[var(--color-ink)] font-bold">٢,٤٥٠</h3>
                        <p className="font-tajawal text-xs text-green-600 mt-2">+12% منذ الشهر الماضي</p>
                    </div>
                    <div className="bg-[var(--color-panel)] rounded-2xl border border-[var(--color-clay)]/15 p-6 flex flex-col justify-between">
                        <p className="font-tajawal text-sm text-[var(--color-ink)]/60 mb-2">الحجوزات القادمة</p>
                        <h3 className="font-amiri text-2xl text-[var(--color-ink)] font-bold">٥</h3>
                        <p className="font-tajawal text-xs text-[var(--color-ink)]/50 mt-2">خلال الـ 30 يوم القادمة</p>
                    </div>
                    <div className="bg-[var(--color-panel)] rounded-2xl border border-[var(--color-clay)]/15 p-6 flex flex-col justify-between">
                        <p className="font-tajawal text-sm text-[var(--color-ink)]/60 mb-2">الإيرادات المتوقعة</p>
                        <h3 className="font-amiri text-2xl text-[var(--color-ink)] font-bold">₪ ٤,٢٠٠</h3>
                        <p className="font-tajawal text-xs text-green-600 mt-2">سيتم تحويلها قريباً</p>
                    </div>
                </div>

                {/* حالة الحساب والعقد */}
                <div className="bg-[var(--color-panel)] rounded-2xl border border-[var(--color-clay)]/15 p-6">
                    <h3 className="font-amiri text-xl mb-4 border-b border-[var(--color-clay)]/10 pb-4">حالة الحساب</h3>
                    
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-tajawal font-bold text-[var(--color-ink)]">الحساب نشط</p>
                                <p className="font-tajawal text-xs text-[var(--color-ink)]/60">يمكنك استقبال الحجوزات الآن</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--color-sand)] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-clay)]/10 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[var(--color-clay)]" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-tajawal font-medium text-[var(--color-ink)] flex items-center gap-2">
                                    عقد الإدراج الإلكتروني
                                    <span className="font-tajawal text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">تم التوقيع</span>
                                </h4>
                                <p className="font-tajawal text-xs text-[var(--color-ink)]/50 mt-1">نسخة محفوظة وموثقة بالبصمة الرقمية</p>
                            </div>
                        </div>

                        <button
                            onClick={handleDownloadContract}
                            disabled={downloadLoading}
                            className="font-tajawal text-sm text-[var(--color-panel)] bg-[var(--color-clay)] rounded-lg px-4 py-2 transition hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shrink-0"
                        >
                            {downloadLoading ? "جاري..." : "تحميل (PDF)"}
                        </button>
                    </div>

                    {downloadError && (
                        <p className="font-tajawal text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                            {downloadError}
                        </p>
                    )}
                </div>

                {/* زر تسجيل الخروج */}
                <button
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="w-full font-tajawal text-sm text-[var(--color-ink)]/60 hover:text-[var(--color-ink)] border border-[var(--color-clay)]/15 rounded-xl py-3 transition hover:bg-[var(--color-ink)]/5 disabled:opacity-50"
                >
                    {logoutLoading ? "جاري الخروج..." : "تسجيل الخروج"}
                </button>
                </div>
            </div>
        </main>
    );
}
