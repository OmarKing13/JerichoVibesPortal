"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getContractContent, type ContractContent } from "@/lib/contracts/content";

interface Manager {
    id: string;
    name: string;
    national_id: string;
    phone_number: string;
}

export default function ContractClient({
    manager,
    content,
    templateVersion,
    isRenewal = false,
}: {
    manager: Manager;
    content?: ContractContent;
    templateVersion?: string;
    isRenewal?: boolean;
}) {
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const contractContent = content ?? getContractContent(templateVersion ?? "");

    if (!contractContent) {
        return (
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-red-200 p-8 my-12 font-tajawal text-center text-red-700">
                تعذر تحميل نص العقد. حدّث الصفحة أو تواصل مع الإدارة.
            </div>
        );
    }

    const { contract, version, approvalText } = contractContent;

    const handleSign = async () => {
        if (!agreed) {
            setError("يجب الموافقة على العقد أولاً");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/sign-contract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ managerId: manager.id }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "حدث خطأ أثناء توقيع العقد");
            }

            router.push("/villa-dashboard");
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : "حدث خطأ أثناء توقيع العقد"
            );
            setLoading(false);
        }
    };

    const currentDate = new Date().toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="min-h-screen bg-[#F5F7F8] py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl border border-[#E8ECE9] p-6 sm:p-8">

                    {/* تنبيه التجديد */}
                    {isRenewal && (
                        <div className="bg-[#FFF8E1] border border-[#FFD54F]/40 rounded-2xl p-4 mb-8">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#FFB300]/15 flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-4 h-4 text-[#F57F17]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                        <line x1="12" y1="9" x2="12" y2="13" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-tajawal font-bold text-sm text-[#E65100] mb-1">تحديث إجباري للعقد</p>
                                    <p className="font-tajawal text-xs text-[#BF360C]/80 leading-relaxed">
                                        تم تحديث بنود اتفاقية إدراج الفلل. يجب عليك قراءة والموافقة على البنود الجديدة لاستعادة الوصول إلى لوحة التحكم.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* عنوان العقد */}
                    <div className="text-center mb-8">
                        <div className="w-10 h-0.5 bg-[#00ADB5] mx-auto mb-3" />
                        <h1 className="font-amiri text-2xl sm:text-3xl text-[#212121]">{contract.title}</h1>
                        <p className="font-tajawal text-xs text-[#999999] mt-2">نسخة {version}</p>
                    </div>

                    {/* الأطراف */}
                    <div className="font-tajawal text-sm text-[#212121] leading-relaxed space-y-6">
                        <p>إنه في يوم {currentDate}، تم الاتفاق بين كل من:</p>

                        <div className="bg-[#F5F7F8] rounded-xl p-4 space-y-1.5">
                            <p>
                                <span className="font-bold text-[#006666]">الطرف الأول: </span>
                                <span>السيد عمر داود حسين صالح, يحمل هوية وطنية رقم (406593095), ورقم جوال (0595153443).</span>
                            </p>
                            <p>
                                <span className="font-bold text-[#006666]">الطرف الثاني: </span>
                                <span>
                                    السيد/ة {manager.name}، يحمل/ة هوية وطنية رقم ({manager.national_id})،
                                    ورقم جوال ({manager.phone_number}).
                                </span>
                            </p>
                        </div>

                        {/* التمهيد */}
                        {contract.preamble && (
                            <div>
                                <h3 className="font-bold text-base mb-2 text-[#006666]">تمهيد:</h3>
                                <p className="text-[#555555] leading-[1.9]">{contract.preamble}</p>
                            </div>
                        )}

                        {/* الأقسام والبنود */}
                        {contract.sections.map((section, si) => (
                            <div key={si} className="space-y-4">
                                {/* عنوان القسم */}
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1 h-6 rounded-full bg-[#00ADB5] shrink-0" />
                                    <div>
                                        <p className="font-tajawal text-xs font-bold text-[#006666]">
                                            المادة {toArabicOrdinal(si + 1)}
                                        </p>
                                        <p className="font-amiri text-base font-bold text-[#212121]">
                                            {section.title}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-r-2 border-[#E0F7FA] pr-5 space-y-4">
                                    {section.clauses.map((clause, ci) => (
                                        <div key={ci}>
                                            {/* نص البند */}
                                            <p className="font-bold text-sm sm:text-[15px] text-[#212121] leading-[1.8]">
                                                {clause.text}
                                            </p>

                                            {/* شرح البند */}
                                            {clause.description && (
                                                <p className="text-xs text-[#666666] leading-relaxed mt-1.5 pl-4 border-r-2 border-[#E0F7FA]">
                                                    {clause.description}
                                                </p>
                                            )}

                                            {/* بنود فرعية */}
                                            {clause.subClauses && clause.subClauses.length > 0 && (
                                                <div className="mt-2 pr-5 space-y-2">
                                                    {clause.subClauses.map((sub, subi) => (
                                                        <div key={subi}>
                                                            <p className="font-bold text-xs sm:text-sm text-[#333333] leading-[1.7]">
                                                                {sub.text}
                                                            </p>
                                                            {sub.description && (
                                                                <p className="text-xs text-[#999999] leading-relaxed mt-1 pr-4">
                                                                    {sub.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* صندوق الموافقة */}
                    <div className="mt-10 pt-6 border-t border-[#E8ECE9]">
                        <label className="flex items-start gap-3 cursor-pointer p-4 bg-[#F5F7F8] rounded-xl border border-[#E8ECE9] transition-colors hover:border-[#00ADB5]/30">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 w-5 h-5 accent-[#00ADB5] rounded"
                            />
                            <span className="font-tajawal text-sm text-[#555555] leading-relaxed">
                                {approvalText}
                            </span>
                        </label>
                    </div>

                    {/* خطأ */}
                    {error && (
                        <p className="mt-4 font-tajawal text-sm text-[#D32F2F] bg-[#FFEBEE] p-3 rounded-xl">
                            {error}
                        </p>
                    )}

                    {/* زر التوقيع */}
                    <button
                        onClick={handleSign}
                        disabled={loading || !agreed}
                        className="w-full mt-6 font-tajawal font-medium text-white bg-gradient-to-l from-[#00ADB5] to-[#006666] rounded-xl py-4 transition-all hover:shadow-lg hover:shadow-[#00ADB5]/20 disabled:opacity-50 disabled:hover:shadow-none"
                    >
                        {loading ? "جاري التوقيع وتوليد العقد..." : "توقيع العقد إلكترونياً"}
                    </button>
                </div>

                {/* تذييل */}
                <p className="font-tajawal text-[10px] text-[#BBBBBB] text-center mt-4">
                    Jericho Vibes — بوابة أصحاب الفلل
                </p>
            </div>
        </div>
    );
}

/* ═══════ مساعدات ═══════ */

const ARABIC_ORDINALS = [
    "الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة",
    "السادسة", "السابعة", "الثامنة", "التاسعة", "العاشرة",
    "الحادية عشرة", "الثانية عشرة", "الثالثة عشرة", "الرابعة عشرة", "الخامسة عشرة",
    "السادسة عشرة", "السابعة عشرة", "الثامنة عشرة", "التاسعة عشرة", "العشرين",
];

function toArabicOrdinal(n: number): string {
    return ARABIC_ORDINALS[n - 1] ?? String(n);
}