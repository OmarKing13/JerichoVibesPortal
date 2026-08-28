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
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-red-200 p-8 my-12 font-tajawal text-center text-red-700">
                تعذر تحميل نص العقد. حدّث الصفحة أو تواصل مع الإدارة.
            </div>
        );
    }

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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ managerId: manager.id }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "حدث خطأ أثناء توقيع العقد");
            }

            // التوجيه للوحة تحكم مالك الفيلا بعد التوقيع
            router.push("/villa-dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "حدث خطأ أثناء توقيع العقد");
            setLoading(false);
        }
    };

    const currentDate = new Date().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-[var(--color-clay)]/15 p-8 my-12">
            {isRenewal && (
                <div className="bg-amber-50 border-r-4 border-amber-500 p-4 rounded-xl shadow-sm mb-8 font-tajawal text-amber-800 text-right" dir="rtl">
                    <p className="font-bold text-lg mb-1">تحديث إجباري للعقد</p>
                    <p className="text-sm">
                        تم تحديث بنود اتفاقية إدراج الفلل. يجب عليك قراءة والموافقة على البنود الجديدة في هذه النسخة لاستعادة إمكانية الوصول إلى لوحة تحكمك والخدمات الخاصة بالفيلا.
                    </p>
                </div>
            )}
            <h1 className="font-amiri text-3xl text-center mb-2">{contractContent.title}</h1>
            <p className="font-tajawal text-sm text-center text-[var(--color-ink)]/55 mb-8">
                رقم النسخة: {contractContent.version}
            </p>
            
            <div className="font-tajawal text-[var(--color-ink)] leading-relaxed space-y-6">
                <p>إنه في يوم {currentDate}، تم الاتفاق بين كل من:</p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>الطرف الأول:</strong> شركة Jericho Vibes</p>
                    <p><strong>الطرف الثاني:</strong> السيد/ة {manager.name}، ويحمل هوية وطنية رقم ({manager.national_id})، ورقم جوال ({manager.phone_number}).</p>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-2">تمهيد:</h3>
                    <p>{contractContent.preamble}</p>
                </div>

                <ul className="list-decimal list-inside space-y-2">
                    {contractContent.clauses.map((clause) => (
                        <li key={clause}>{clause}</li>
                    ))}
                </ul>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer p-4 bg-[var(--color-sand)] rounded-xl border border-[var(--color-clay)]/20">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 w-5 h-5 accent-[var(--color-clay)]"
                    />
                    <span className="font-tajawal text-sm text-[var(--color-ink)]">
                        {contractContent.approvalText}
                    </span>
                </label>
            </div>

            {error && (
                <p className="mt-4 font-tajawal text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {error}
                </p>
            )}

            <button
                onClick={handleSign}
                disabled={loading || !agreed}
                className="w-full mt-6 font-tajawal font-medium text-[var(--color-panel)] bg-[var(--color-clay)] rounded-xl py-4 transition hover:opacity-90 disabled:opacity-50"
            >
                {loading ? "جاري التوقيع وتوليد العقد..." : "توقيع العقد إلكترونياً"}
            </button>
        </div>
    );
}
