"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const sections = [
    {
        label: "ملف الفيلا",
        desc: "بيانات الفيلا وصورها",
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    {
        label: "الحجوزات",
        desc: "إدارة الحجوزات القادمة",
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
    },
    {
        label: "التقارير",
        desc: "الأداء والإيرادات",
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
        ),
    },
    {
        label: "الإشعارات",
        desc: "آخر التنبيهات",
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
        ),
    },
    {
        label: "الدعم",
        desc: "تواصل مع الفريق",
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
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

export default function VillaDashboardClient({
    fullName,
    manager,
    needsNewContract,
    deadline,
}: Props) {
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
        <div className="min-h-screen bg-[#F5F7F8]">

            {/* ═══ شريط علوي ═══ */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-[#E8ECE9]">
                <div className="max-w-3xl mx-auto flex items-center justify-between px-5 h-14">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#00ADB5] flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </div>
                        <span className="font-tajawal text-xs font-medium tracking-widest text-[#006666]">
                            JERICHO VIBES
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="font-tajawal text-xs text-[#666666] hover:text-[#212121] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        {logoutLoading ? "جاري..." : "خروج"}
                    </button>
                </div>
            </header>

            {/* ═══ محتوى رئيسي ═══ */}
            <div className="max-w-3xl mx-auto px-5 py-6 space-y-5">

                {/* ── تنبيه العقد الجديد ── */}
                {needsNewContract && (
                    <div className="bg-[#FFF8E1] border border-[#FFD54F]/40 rounded-2xl p-5">
                        <div className="flex items-start gap-3.5">
                            <div className="w-9 h-9 rounded-xl bg-[#FFB300]/15 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4.5 h-4.5 text-[#F57F17]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-tajawal font-bold text-sm text-[#E65100] mb-1">
                                    تحديث هام للعقد
                                </h3>
                                <p className="font-tajawal text-xs text-[#BF360C]/80 leading-relaxed mb-3">
                                    تم إصدار نسخة جديدة من عقد الإدراج. يرجى الاطلاع على البنود
                                    والموافقة عليها لضمان استمرار وصولك للوحة التحكم.
                                    {deadline && (
                                        <>
                                            {" "}المهلة:{" "}
                                            <span className="font-bold text-[#E65100]">
                                                {new Date(deadline).toLocaleDateString("ar-EG", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </>
                                    )}
                                </p>
                                <button
                                    onClick={() => router.push("/dashboard/apply/contract")}
                                    className="font-tajawal text-xs font-medium bg-[#F57F17] text-white px-5 py-2 rounded-xl hover:bg-[#E65100] transition-colors"
                                >
                                    قراءة وتوقيع العقد الجديد
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── بطاقة الترحيب ── */}
                <div className="bg-gradient-to-l from-[#00ADB5] to-[#006666] rounded-2xl p-6 text-white">
                    <p className="font-tajawal text-xs text-white/60 mb-1">مرحباً بك</p>
                    <h1 className="font-amiri text-2xl mb-1">{fullName}</h1>
                    {joinDate && (
                        <p className="font-tajawal text-xs text-white/50">
                            عضو منذ {joinDate}
                        </p>
                    )}
                </div>

                {/* ── حالة العقد ── */}
                <div className="bg-white rounded-2xl border border-[#E8ECE9] p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#E0F7FA] flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#00ADB5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-tajawal text-sm font-bold text-[#212121]">
                                        عقد الإدراج
                                    </p>
                                    <span className="font-tajawal text-[10px] bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full font-medium">
                                        مُوقَّع
                                    </span>
                                </div>
                                <p className="font-tajawal text-[11px] text-[#666666] mt-0.5">
                                    نسخة موثقة بالبصمة الرقمية
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleDownloadContract}
                            disabled={downloadLoading}
                            className="font-tajawal text-xs font-medium text-white bg-[#00ADB5] px-4 py-2.5 rounded-xl hover:bg-[#006666] transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            {downloadLoading ? "جاري..." : "PDF"}
                        </button>
                    </div>

                    {downloadError && (
                        <p className="font-tajawal text-xs text-[#D32F2F] bg-[#FFEBEE] mt-3 p-3 rounded-xl">
                            {downloadError}
                        </p>
                    )}
                </div>

                {/* ── شبكة الأقسام ── */}
                <div>
                    <h2 className="font-tajawal text-xs font-medium text-[#666666] mb-3 px-1">
                        الأقسام
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {sections.map((item) => (
                            <div
                                key={item.label}
                                className="bg-white rounded-2xl border border-[#E8ECE9] p-5 flex flex-col items-center text-center gap-3 cursor-default group"
                            >
                                <div className="w-11 h-11 rounded-2xl bg-[#F5F7F8] group-hover:bg-[#E0F7FA] flex items-center justify-center text-[#999999] group-hover:text-[#00ADB5] transition-colors">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="font-tajawal text-sm font-medium text-[#212121]">
                                        {item.label}
                                    </p>
                                    <p className="font-tajawal text-[10px] text-[#00ADB5] font-medium mt-1 tracking-wide">
                                        قريباً
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── تذييل ── */}
                <p className="font-tajawal text-[10px] text-[#BBBBBB] text-center pt-4 pb-2">
                    Jericho Vibes — بوابة أصحاب الفلل
                </p>
            </div>
        </div>
    );
}