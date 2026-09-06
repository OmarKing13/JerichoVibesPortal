"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Villa {
    id: string;
    name: string;
    description: string;
    address: string;
    image_urls: string[];
    max_guests: number;
    num_bedrooms: number;
    num_bathrooms: number;
    base_price_per_night: number | null;
    weekend_price_per_night: number | null;
    midweek_price_per_night: number | null;
    is_active: boolean;
    average_rating: number | null;
    villa_code: string | null;
    check_in_time: string | null;
    check_out_time: string | null;
    created_at: string;
}

interface VillaRequest {
    id: string;
    name: string;
    description: string;
    address: string;
    city: string;
    image_urls?: string[];
    max_guests: number;
    num_bedrooms: number;
    num_bathrooms: number;
    start_of_week_price: number | null;
    midweek_price_per_night: number | null;
    weekend_price_per_night: number | null;
    currency: string;
    status: string; // pending | under_review | inspection | approved | rejected
    admin_notes: string | null;
    rejection_reason: string | null;
    created_at: string;
    amenities?: string[];
}

interface Props {
    managerName: string;
    managerId: string;
    villas: Villa[];
    requests: VillaRequest[];
}

export default function VillasListClient({
    managerName,
    managerId,
    villas,
    requests,
}: Props) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"villas" | "requests">("villas");

    const pendingRequestsCount = requests.filter(
        (r) => r.status === "pending" || r.status === "under_review" || r.status === "inspection"
    ).length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return {
                    label: "قيد المراجعة",
                    bg: "bg-amber-50 text-amber-700 border-amber-200",
                    dot: "bg-amber-500",
                };
            case "under_review":
                return {
                    label: "جاري التدقيق",
                    bg: "bg-blue-50 text-blue-700 border-blue-200",
                    dot: "bg-blue-500",
                };
            case "inspection":
                return {
                    label: "بانتظار المعاينة الميدانية",
                    bg: "bg-purple-50 text-purple-700 border-purple-200",
                    dot: "bg-purple-500",
                };
            case "approved":
                return {
                    label: "معتمدة ونشطة",
                    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    dot: "bg-emerald-500",
                };
            case "rejected":
                return {
                    label: "مرفوضة / بحاجة لتعديل",
                    bg: "bg-rose-50 text-rose-700 border-rose-200",
                    dot: "bg-rose-500",
                };
            default:
                return {
                    label: status,
                    bg: "bg-gray-50 text-gray-700 border-gray-200",
                    dot: "bg-gray-400",
                };
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-16">
            {/* ═══ الهيدر ═══ */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/villa-dashboard")}
                            className="w-9 h-9 rounded-xl border border-gray-200 hover:border-[#00ADB5] hover:bg-[#E0F7FA]/30 flex items-center justify-center text-gray-600 transition-colors"
                            title="العودة للوحة التحكم"
                        >
                            <svg className="w-5 h-5 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="font-tajawal text-base sm:text-lg font-bold text-gray-900 leading-tight">
                                إدارة ملفات الفلل
                            </h1>
                            <p className="font-tajawal text-xs text-gray-500">
                                {managerName}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push("/villa-dashboard/villas/new")}
                        className="inline-flex items-center gap-2 bg-[#00ADB5] hover:bg-[#009688] text-white font-tajawal text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>إضافة فيلا جديدة</span>
                    </button>
                </div>
            </header>

            {/* ═══ المحتوى ═══ */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

                {/* ── بطاقة إحصاءات سريعة ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 flex items-center gap-3.5 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-tajawal text-xs text-gray-500">الفلل المعتمدة</p>
                            <p className="font-tajawal text-xl font-bold text-gray-900 mt-0.5">{villas.length}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 flex items-center gap-3.5 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-tajawal text-xs text-gray-500">طلبات قيد المتابعة</p>
                            <p className="font-tajawal text-xl font-bold text-amber-600 mt-0.5">{pendingRequestsCount}</p>
                        </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#00ADB5]/10 to-[#006666]/10 border border-[#00ADB5]/20 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
                        <div>
                            <p className="font-tajawal text-xs text-[#006666] font-medium">تريد تسجيل فيلا إضافية؟</p>
                            <p className="font-tajawal text-[11px] text-gray-600 mt-0.5">يمكنك إضافة أكثر من فيلا في حسابك</p>
                        </div>
                        <button
                            onClick={() => router.push("/villa-dashboard/villas/new")}
                            className="shrink-0 bg-[#006666] text-white text-xs font-tajawal font-bold px-3 py-1.5 rounded-lg hover:bg-[#004d40] transition-colors"
                        >
                            تقديم طلب
                        </button>
                    </div>
                </div>

                {/* ── ألسنة التبديل (Tabs) ── */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("villas")}
                        className={`pb-3 px-4 font-tajawal text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                            activeTab === "villas"
                                ? "border-[#00ADB5] text-[#00ADB5]"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        <span>فللي المسجلة</span>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            {villas.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`pb-3 px-4 font-tajawal text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                            activeTab === "requests"
                                ? "border-[#00ADB5] text-[#00ADB5]"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                        }`}
                    >
                        <span>طلبات الإضافة والمعاينة</span>
                        {requests.length > 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                pendingRequestsCount > 0 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"
                            }`}>
                                {requests.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* ══════════ تبويب الفلل المعتمدة ══════════ */}
                {activeTab === "villas" && (
                    <div className="space-y-4">
                        {villas.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center max-w-lg mx-auto">
                                <div className="w-16 h-16 bg-[#E0F7FA] text-[#00ADB5] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                        <polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                </div>
                                <h3 className="font-tajawal font-bold text-lg text-gray-900 mb-2">
                                    لا توجد فلل معتمدة بعد
                                </h3>
                                <p className="font-tajawal text-xs text-gray-500 leading-relaxed mb-6">
                                    لم يتم ربط أي فيلا نشطة بحسابك حالياً. يمكنك تقديم طلب إضافة فيلا جديدة ليقوم فريق العمل بمعاينتها واعتمادها على المنصة.
                                </p>
                                <button
                                    onClick={() => router.push("/villa-dashboard/villas/new")}
                                    className="bg-[#00ADB5] hover:bg-[#009688] text-white font-tajawal text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                                >
                                    تقديم أول طلب فيلا
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {villas.map((villa) => {
                                    const mainImage = villa.image_urls && villa.image_urls.length > 0 ? villa.image_urls[0] : null;
                                    return (
                                        <div
                                            key={villa.id}
                                            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                                        >
                                            {/* صورة الفيلا */}
                                            <div className="relative h-48 sm:h-52 bg-gray-100 overflow-hidden">
                                                {mainImage ? (
                                                    <img
                                                        src={mainImage}
                                                        alt={villa.name}
                                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                                        <svg className="w-12 h-12 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                                            <polyline points="21 15 16 10 5 21" />
                                                        </svg>
                                                        <span className="font-tajawal text-xs">لا توجد صور مرفوعة</span>
                                                    </div>
                                                )}

                                                {/* شارات الحالة وكود الفيلا */}
                                                <div className="absolute top-3 right-3 flex items-center gap-2">
                                                    <span className={`font-tajawal text-xs px-2.5 py-1 rounded-full font-bold shadow-sm backdrop-blur-md ${
                                                        villa.is_active
                                                            ? "bg-emerald-500/90 text-white"
                                                            : "bg-gray-700/80 text-white"
                                                    }`}>
                                                        {villa.is_active ? "نشطة ومتاحة" : "معطلة مؤقتاً"}
                                                    </span>
                                                </div>

                                                {villa.villa_code && (
                                                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-mono font-medium">
                                                        #{villa.villa_code}
                                                    </div>
                                                )}

                                                {villa.image_urls && villa.image_urls.length > 1 && (
                                                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-tajawal px-2 py-0.5 rounded-md flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                        </svg>
                                                        <span>{villa.image_urls.length} صور</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* تفاصيل الفيلا */}
                                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                                <div>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="font-tajawal text-base sm:text-lg font-bold text-gray-900 leading-snug">
                                                            {villa.name}
                                                        </h3>
                                                        {villa.average_rating ? (
                                                            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">
                                                                <span>★</span>
                                                                <span>{villa.average_rating}</span>
                                                            </div>
                                                        ) : null}
                                                    </div>

                                                    <p className="font-tajawal text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                            <circle cx="12" cy="10" r="3" />
                                                        </svg>
                                                        <span className="truncate">{villa.address}</span>
                                                    </p>
                                                </div>

                                                {/* المواصفات */}
                                                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-[#F8FAFC] rounded-xl border border-gray-100 text-center font-tajawal">
                                                    <div>
                                                        <p className="text-[10px] text-gray-500">الضيوف</p>
                                                        <p className="text-xs font-bold text-gray-800">{villa.max_guests} أشخاص</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-500">غرف النوم</p>
                                                        <p className="text-xs font-bold text-gray-800">{villa.num_bedrooms} غرف</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-500">الحمامات</p>
                                                        <p className="text-xs font-bold text-gray-800">{villa.num_bathrooms} حمام</p>
                                                    </div>
                                                </div>

                                                {/* الأسعار وأوقات الدخول */}
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs font-tajawal">
                                                    <div>
                                                        <span className="text-gray-500 text-[11px]">سعر الليلة: </span>
                                                        <span className="font-bold text-[#006666] text-sm">
                                                            {villa.midweek_price_per_night || villa.base_price_per_night || "—"} ₪
                                                        </span>
                                                        {villa.weekend_price_per_night && (
                                                            <span className="text-[10px] text-gray-400 mr-1">
                                                                (الويكند: {villa.weekend_price_per_night} ₪)
                                                            </span>
                                                        )}
                                                    </div>

                                                    {(villa.check_in_time || villa.check_out_time) && (
                                                        <div className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                                            دخول {villa.check_in_time || "—"} / خروج {villa.check_out_time || "—"}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════ تبويب طلبات الإضافة ══════════ */}
                {activeTab === "requests" && (
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center max-w-lg mx-auto">
                                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="12" y1="18" x2="12" y2="12" />
                                        <line x1="9" y1="15" x2="15" y2="15" />
                                    </svg>
                                </div>
                                <h3 className="font-tajawal font-bold text-lg text-gray-900 mb-2">
                                    لا توجد طلبات جارية
                                </h3>
                                <p className="font-tajawal text-xs text-gray-500 leading-relaxed mb-6">
                                    عندما تقدم طلباً جديداً لإضافة فيلا، ستتمكن من متابعة مراحله (قيد المراجعة، المعاينة الميدانية، والاعتماد) هنا.
                                </p>
                                <button
                                    onClick={() => router.push("/villa-dashboard/villas/new")}
                                    className="bg-[#00ADB5] hover:bg-[#009688] text-white font-tajawal text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                                >
                                    تقديم طلب جديد الآن
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((req) => {
                                    const badge = getStatusBadge(req.status);
                                    const reqDate = new Date(req.created_at).toLocaleDateString("ar-EG", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    });

                                    return (
                                        <div
                                            key={req.id}
                                            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-tajawal text-base font-bold text-gray-900">
                                                            {req.name}
                                                        </h3>
                                                        <span className={`font-tajawal text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${badge.bg}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                                                            {badge.label}
                                                        </span>
                                                    </div>
                                                    <p className="font-tajawal text-xs text-gray-500 mt-1">
                                                        {req.city} — {req.address} • تاريخ التقديم: {reqDate}
                                                    </p>
                                                </div>

                                                <div className="text-left sm:text-right font-tajawal text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                                    <span>الأسعار المقترحة: </span>
                                                    <span className="font-bold text-[#006666]">
                                                        {req.midweek_price_per_night || req.start_of_week_price || "—"} {req.currency || "₪"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* مواصفات وسعة */}
                                            <div className="flex flex-wrap items-center gap-3 text-xs font-tajawal text-gray-600">
                                                <span className="bg-gray-100 px-2.5 py-1 rounded-lg">
                                                    👥 {req.max_guests} ضيوف
                                                </span>
                                                <span className="bg-gray-100 px-2.5 py-1 rounded-lg">
                                                    🛏️ {req.num_bedrooms} غرف نوم
                                                </span>
                                                <span className="bg-gray-100 px-2.5 py-1 rounded-lg">
                                                    🚿 {req.num_bathrooms} حمامات
                                                </span>
                                                {req.amenities && req.amenities.length > 0 && (
                                                    <span className="bg-[#E0F7FA] text-[#006666] px-2.5 py-1 rounded-lg">
                                                        ✨ {req.amenities.length} مرافق مسجلة
                                                    </span>
                                                )}
                                                {req.image_urls && req.image_urls.length > 0 && (
                                                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg">
                                                        📷 {req.image_urls.length} صور
                                                    </span>
                                                )}
                                            </div>

                                            {/* ملاحظات الإدارة إن وجدت */}
                                            {req.admin_notes && (
                                                <div className="bg-blue-50 border border-blue-200/60 rounded-xl p-3 text-xs font-tajawal text-blue-900">
                                                    <strong className="font-bold block mb-0.5">ملاحظات فريق المعاينة:</strong>
                                                    <p>{req.admin_notes}</p>
                                                </div>
                                            )}

                                            {/* سبب الرفض إن وجد */}
                                            {req.rejection_reason && (
                                                <div className="bg-rose-50 border border-rose-200/60 rounded-xl p-3 text-xs font-tajawal text-rose-900">
                                                    <strong className="font-bold block mb-0.5">سبب عدم الاعتماد:</strong>
                                                    <p>{req.rejection_reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
