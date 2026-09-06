"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface AmenityItem {
    id: string;
    name: string;
    icon_name: string | null;
}

export interface CityItem {
    id: string;
    name: string;
}

export interface CurrencyItem {
    id: string;
    name: string;
    symbol: string;
    code: string;
    is_default: boolean | null;
}

interface Props {
    managerId: string;
    defaultPhone: string;
    availableAmenities: AmenityItem[];
    availableCities: CityItem[];
    availableCurrencies: CurrencyItem[];
}

const DAYS_OF_WEEK = [
    { key: "saturday", name: "السبت", defaultType: "weekend" },
    { key: "sunday", name: "الأحد", defaultType: "start_of_week" },
    { key: "monday", name: "الإثنين", defaultType: "midweek" },
    { key: "tuesday", name: "الثلاثاء", defaultType: "midweek" },
    { key: "wednesday", name: "الأربعاء", defaultType: "midweek" },
    { key: "thursday", name: "الخميس", defaultType: "weekend" },
    { key: "friday", name: "الجمعة", defaultType: "weekend" },
];

const getAmenityIcon = (iconName: string | null, name: string) => {
    const text = ((iconName || "") + " " + name).toLowerCase();
    if (text.includes("pool") || text.includes("مسبح")) return "🏊‍♂️";
    if (text.includes("heat") || text.includes("مدفأ")) return "♨️";
    if (text.includes("jacuzzi") || text.includes("جاكوزي")) return "🛁";
    if (text.includes("wifi") || text.includes("انترنت") || text.includes("إنترنت") || text.includes("واي فاي")) return "📶";
    if (text.includes("ac") || text.includes("air") || text.includes("تكييف")) return "❄️";
    if (text.includes("bbq") || text.includes("شواء") || text.includes("باربكيو")) return "🍖";
    if (text.includes("kitchen") || text.includes("مطبخ")) return "🍳";
    if (text.includes("garden") || text.includes("حديقة") || text.includes("جلسات")) return "🌿";
    if (text.includes("kids") || text.includes("أطفال") || text.includes("العاب") || text.includes("ألعاب")) return "🛝";
    if (text.includes("billiards") || text.includes("بلياردو") || text.includes("تنس")) return "🎱";
    if (text.includes("parking") || text.includes("موقف") || text.includes("كراج")) return "🚗";
    if (text.includes("tv") || text.includes("شاشة") || text.includes("تلفزيون")) return "📺";
    if (text.includes("privacy") || text.includes("خصوصية") || text.includes("سور")) return "🏡";
    if (text.includes("generator") || text.includes("مولد") || text.includes("كهرباء")) return "⚡";
    if (text.includes("football") || text.includes("ملعب")) return "⚽";
    if (text.includes("view") || text.includes("إطلالة")) return "🌄";
    return "✨";
};

export default function AddVillaRequestClient({
    managerId,
    defaultPhone,
    availableAmenities,
    availableCities,
    availableCurrencies,
}: Props) {
    const router = useRouter();

    // Default City (Jericho or first)
    const initialCity = availableCities.find((c) => c.name.includes("أريحا") || c.name.toLowerCase().includes("jericho")) || availableCities[0];
    const [selectedCityId, setSelectedCityId] = useState<string>(initialCity?.id || "");
    const [cityName, setCityName] = useState<string>(initialCity?.name || "أريحا");

    // Default Currency (is_default, or ILS, or first)
    const initialCurrency = availableCurrencies.find((c) => c.is_default || c.code === "ILS" || c.name.includes("شيكل")) || availableCurrencies[0];
    const [selectedCurrencyId, setSelectedCurrencyId] = useState<string>(initialCurrency?.id || "");
    const [currencySymbol, setCurrencySymbol] = useState<string>(initialCurrency?.symbol || "₪");
    const [currencyCode, setCurrencyCode] = useState<string>(initialCurrency?.code || "ILS");

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [googleMapsUrl, setGoogleMapsUrl] = useState("");

    // Specs
    const [maxGuests, setMaxGuests] = useState(10);
    const [numBedrooms, setNumBedrooms] = useState(3);
    const [numBathrooms, setNumBathrooms] = useState(2);

    // Times & Rules
    const [checkInTime, setCheckInTime] = useState("02:00 م");
    const [checkOutTime, setCheckOutTime] = useState("11:00 ص");
    const [houseRules, setHouseRules] = useState(
        "• الحفاظ على نظافة المكان ومرافقه.\n• الهدوء وعدم استخدام مكبرات الصوت بعد الساعة 11:00 ليلاً.\n• تسليم الفيلا بنفس الحالة التي تم استلامها عليها."
    );

    // Contact
    const [displayPhone, setDisplayPhone] = useState(defaultPhone);
    const [ownerPhone, setOwnerPhone] = useState(defaultPhone);

    // Pricing
    const [startOfWeekPrice, setStartOfWeekPrice] = useState("");
    const [midweekPrice, setMidweekPrice] = useState("");
    const [weekendPrice, setWeekendPrice] = useState("");

    // Day Classifications
    const [dayClassifications, setDayClassifications] = useState<Record<string, string>>({
        saturday: "weekend",
        sunday: "start_of_week",
        monday: "midweek",
        tuesday: "midweek",
        wednesday: "midweek",
        thursday: "weekend",
        friday: "weekend",
    });

    // Amenities
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [customAmenityInput, setCustomAmenityInput] = useState("");

    // UI & Submission state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [geoLoading, setGeoLoading] = useState(false);

    // Helper: Detect geolocation
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("خاصية تحديد الموقع غير مدعومة في متصفحك");
            return;
        }
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLatitude(pos.coords.latitude.toFixed(6));
                setLongitude(pos.coords.longitude.toFixed(6));
                setGeoLoading(false);
            },
            (err) => {
                alert("تعذر الحصول على الموقع الجغرافي: " + err.message);
                setGeoLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    // Helper: Parse Google Maps URL if pasted
    const handleParseMapsUrl = (url: string) => {
        setGoogleMapsUrl(url);
        const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) {
            setLatitude(match[1]);
            setLongitude(match[2]);
        }
    };

    // Toggle Amenity
    const toggleAmenity = (itemLabel: string) => {
        if (selectedAmenities.includes(itemLabel)) {
            setSelectedAmenities(selectedAmenities.filter((a) => a !== itemLabel));
        } else {
            setSelectedAmenities([...selectedAmenities, itemLabel]);
        }
    };

    // Add Custom Amenity
    const handleAddCustomAmenity = () => {
        const trimmed = customAmenityInput.trim();
        if (trimmed && !selectedAmenities.includes(trimmed)) {
            setSelectedAmenities([...selectedAmenities, trimmed]);
            setCustomAmenityInput("");
        }
    };

    // Update Day Classification
    const handleSetDayType = (dayKey: string, type: string) => {
        setDayClassifications((prev) => ({
            ...prev,
            [dayKey]: type,
        }));
    };

    // Submit Request
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError("يرجى إدخال اسم الفيلا");
            return;
        }
        if (!description.trim()) {
            setError("يرجى إدخال وصف الفيلا");
            return;
        }
        if (!address.trim()) {
            setError("يرجى إدخال العنوان");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/villa-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description,
                    address,
                    city: cityName,
                    city_id: selectedCityId || null,
                    latitude,
                    longitude,
                    max_guests: maxGuests,
                    num_bedrooms: numBedrooms,
                    num_bathrooms: numBathrooms,
                    display_contact_number: displayPhone,
                    owner_phone_number: ownerPhone,
                    currency: currencyCode,
                    currency_id: selectedCurrencyId || null,
                    currency_symbol: currencySymbol,
                    start_of_week_price: startOfWeekPrice,
                    midweek_price_per_night: midweekPrice,
                    weekend_price_per_night: weekendPrice,
                    day_classifications: dayClassifications,
                    amenities: selectedAmenities,
                    check_in_time: checkInTime,
                    check_out_time: checkOutTime,
                    house_rules: houseRules,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "فشل إرسال الطلب");
            }

            // النجاح: الانتقال لصفحة الفلل مع فتح تبويب الطلبات
            router.push("/villa-dashboard/villas");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* ═══ الهيدر ═══ */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.push("/villa-dashboard/villas")}
                            className="w-9 h-9 rounded-xl border border-gray-200 hover:border-[#00ADB5] hover:bg-[#E0F7FA]/30 flex items-center justify-center text-gray-600 transition-colors"
                        >
                            <svg className="w-5 h-5 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="font-tajawal text-base sm:text-lg font-bold text-gray-900">
                                تقديم طلب إضافة فيلا جديدة
                            </h1>
                            <p className="font-tajawal text-xs text-gray-500">
                                تعبئة البيانات للمعاينة والاعتماد من قبل الإدارة
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* ═══ النموذج ═══ */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* رسالة الخطأ */}
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-800 font-tajawal text-xs sm:text-sm">
                            <span className="text-lg">⚠️</span>
                            <div>
                                <p className="font-bold mb-0.5">تنبيه:</p>
                                <p className="leading-relaxed">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* تنبيه إجراءات المعاينة */}
                    <div className="bg-[#E0F7FA]/60 border border-[#00ADB5]/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-[#00ADB5]/20 text-[#006666] flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                        </div>
                        <div className="font-tajawal text-xs text-gray-700 leading-relaxed">
                            <p className="font-bold text-[#006666] text-sm mb-1">
                                معاينة واعتماد الفيلا
                            </p>
                            <p>
                                سيتم إرسال هذا الطلب إلى لوحة تحكم الإدارة لمراجعته وإجراء المعاينة الميدانية للفيلا والتأكد من مطابقة الخدمات والمواصفات وجودتها قبل نشرها رسمياً.
                            </p>
                        </div>
                    </div>

                    {/* ═══ 1. المعلومات الأساسية ═══ */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <span className="w-2 h-5 bg-[#00ADB5] rounded-full"></span>
                            <h2 className="font-tajawal text-sm sm:text-base font-bold text-gray-900">
                                1. المعلومات الأساسية
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-tajawal">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    اسم الفيلا <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="مثال: فيلا قصر الواحة الملكي"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#00ADB5] focus:ring-2 focus:ring-[#00ADB5]/20 outline-none text-sm transition-all"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    وصف الفيلا <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="اكتب وصفاً جذاباً للفيلا، مساحتها، أجوائها، وتميزها..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#00ADB5] focus:ring-2 focus:ring-[#00ADB5]/20 outline-none text-sm transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    المدينة <span className="text-rose-500">*</span>
                                </label>
                                {availableCities.length > 0 ? (
                                    <select
                                        value={selectedCityId}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            setSelectedCityId(id);
                                            const found = availableCities.find((c) => c.id === id);
                                            if (found) setCityName(found.name);
                                        }}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#00ADB5] focus:ring-2 focus:ring-[#00ADB5]/20 outline-none text-sm transition-all bg-white"
                                    >
                                        {availableCities.map((city) => (
                                            <option key={city.id} value={city.id}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={cityName}
                                        onChange={(e) => setCityName(e.target.value)}
                                        placeholder="أريحا"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#00ADB5] focus:ring-2 focus:ring-[#00ADB5]/20 outline-none text-sm bg-gray-50/50"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    العنوان التفصيلي <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="مثال: أريحا - شارع القدس - قرب منتجع كذا"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#00ADB5] focus:ring-2 focus:ring-[#00ADB5]/20 outline-none text-sm transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    رقم التواصل المعروض للزبائن
                                </label>
                                <input
                                    type="tel"
                                    value={displayPhone}
                                    onChange={(e) => setDisplayPhone(e.target.value)}
                                    placeholder="059xxxxxxx"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#00ADB5] focus:ring-2 focus:ring-[#00ADB5]/20 outline-none text-sm"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    رقم هاتف المالك المباشر (للإدارة)
                                </label>
                                <input
                                    type="tel"
                                    value={ownerPhone}
                                    onChange={(e) => setOwnerPhone(e.target.value)}
                                    placeholder="059xxxxxxx"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#00ADB5] focus:ring-2 focus:ring-[#00ADB5]/20 outline-none text-sm"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ═══ 2. الموقع الجغرافي ═══ */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm space-y-4 font-tajawal">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-5 bg-[#00ADB5] rounded-full"></span>
                                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                                    2. الموقع على الخريطة
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={handleGetCurrentLocation}
                                disabled={geoLoading}
                                className="text-xs font-bold text-[#00ADB5] hover:text-[#006666] flex items-center gap-1.5 bg-[#E0F7FA] px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                <span>{geoLoading ? "جاري التحديد..." : "موقعي الحالي"}</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    رابط خرائط جوجل (Google Maps URL)
                                </label>
                                <input
                                    type="url"
                                    value={googleMapsUrl}
                                    onChange={(e) => handleParseMapsUrl(e.target.value)}
                                    placeholder="الصق رابط الموقع من خرائط جوجل لاستخراج الإحداثيات تلقائياً"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#00ADB5] outline-none text-xs"
                                    dir="ltr"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">خط العرض (Latitude)</label>
                                    <input
                                        type="text"
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        placeholder="31.861234"
                                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">خط الطول (Longitude)</label>
                                    <input
                                        type="text"
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        placeholder="35.451234"
                                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ 3. السعة والمواصفات ═══ */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm space-y-4 font-tajawal">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <span className="w-2 h-5 bg-[#00ADB5] rounded-full"></span>
                            <h2 className="text-sm sm:text-base font-bold text-gray-900">
                                3. السعة والمواصفات
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* عدد الضيوف */}
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center text-center">
                                <span className="text-2xl mb-1">👥</span>
                                <label className="text-xs font-bold text-gray-700 mb-2">أقصى عدد للضيوف</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setMaxGuests(Math.max(1, maxGuests - 1))}
                                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="font-bold text-lg text-gray-900 w-8">{maxGuests}</span>
                                    <button
                                        type="button"
                                        onClick={() => setMaxGuests(maxGuests + 1)}
                                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* غرف النوم */}
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center text-center">
                                <span className="text-2xl mb-1">🛏️</span>
                                <label className="text-xs font-bold text-gray-700 mb-2">عدد غرف النوم</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setNumBedrooms(Math.max(1, numBedrooms - 1))}
                                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="font-bold text-lg text-gray-900 w-8">{numBedrooms}</span>
                                    <button
                                        type="button"
                                        onClick={() => setNumBedrooms(numBedrooms + 1)}
                                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* الحمامات */}
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center text-center">
                                <span className="text-2xl mb-1">🚿</span>
                                <label className="text-xs font-bold text-gray-700 mb-2">عدد الحمامات</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setNumBathrooms(Math.max(1, numBathrooms - 1))}
                                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="font-bold text-lg text-gray-900 w-8">{numBathrooms}</span>
                                    <button
                                        type="button"
                                        onClick={() => setNumBathrooms(numBathrooms + 1)}
                                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ 4. الأسعار وتصنيف أيام الأسبوع ═══ */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm space-y-5 font-tajawal">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-5 bg-[#00ADB5] rounded-full"></span>
                                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                                    4. الأسعار وتصنيف الأيام
                                </h2>
                            </div>

                            {/* قائمة العملات من جدول currencies */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">العملة:</span>
                                {availableCurrencies.length > 0 ? (
                                    <select
                                        value={selectedCurrencyId}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            setSelectedCurrencyId(id);
                                            const found = availableCurrencies.find((c) => c.id === id);
                                            if (found) {
                                                setCurrencySymbol(found.symbol);
                                                setCurrencyCode(found.code);
                                            }
                                        }}
                                        className="text-xs font-bold bg-[#E0F7FA] text-[#006666] px-3 py-1.5 rounded-lg border border-[#00ADB5]/30 outline-none cursor-pointer"
                                    >
                                        {availableCurrencies.map((curr) => (
                                            <option key={curr.id} value={curr.id}>
                                                {curr.name} ({curr.symbol})
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="text-xs font-bold bg-[#E0F7FA] text-[#006666] px-2.5 py-1 rounded-lg">
                                        {currencySymbol} ({currencyCode})
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* إدخال الأسعار الثلاثية */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                                <label className="block text-xs font-bold text-emerald-900 mb-1">
                                    سعر بداية الأسبوع
                                </label>
                                <p className="text-[11px] text-emerald-700/80 mb-2">أيام بداية الأسبوع (كالسبت/الأحد)</p>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={startOfWeekPrice}
                                        onChange={(e) => setStartOfWeekPrice(e.target.value)}
                                        placeholder="مثال: 1200"
                                        className="w-full px-3 py-2 rounded-lg border border-emerald-300 focus:border-emerald-600 outline-none text-sm font-bold bg-white"
                                    />
                                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">{currencySymbol}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                                <label className="block text-xs font-bold text-blue-900 mb-1">
                                    سعر وسط الأسبوع
                                </label>
                                <p className="text-[11px] text-blue-700/80 mb-2">أيام العمل العادية (الإثنين - الأربعاء)</p>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={midweekPrice}
                                        onChange={(e) => setMidweekPrice(e.target.value)}
                                        placeholder="مثال: 1000"
                                        className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:border-blue-600 outline-none text-sm font-bold bg-white"
                                    />
                                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">{currencySymbol}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
                                <label className="block text-xs font-bold text-amber-900 mb-1">
                                    سعر نهاية الأسبوع (الويكند)
                                </label>
                                <p className="text-[11px] text-amber-700/80 mb-2">عطلة نهاية الأسبوع (الخميس والجمعة)</p>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={weekendPrice}
                                        onChange={(e) => setWeekendPrice(e.target.value)}
                                        placeholder="مثال: 1500"
                                        className="w-full px-3 py-2 rounded-lg border border-amber-300 focus:border-amber-600 outline-none text-sm font-bold bg-white"
                                    />
                                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">{currencySymbol}</span>
                                </div>
                            </div>
                        </div>

                        {/* جدول تصنيف الأيام التفاعلي */}
                        <div className="pt-3">
                            <div className="mb-3">
                                <h3 className="text-xs font-bold text-gray-900">
                                    جدول تصنيف كل يوم من أيام الأسبوع:
                                </h3>
                                <p className="text-[11px] text-gray-500">
                                    حدد لكل يوم تصنيفه المعتمد في فيلتك لتطبيق السعر المناسب تلقائياً
                                </p>
                            </div>

                            <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                                {DAYS_OF_WEEK.map((day) => {
                                    const currentType = dayClassifications[day.key] || day.defaultType;
                                    return (
                                        <div
                                            key={day.key}
                                            className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-gray-50/60 transition-colors"
                                        >
                                            <span className="font-bold text-xs sm:text-sm text-gray-900 w-24">
                                                يوم {day.name}
                                            </span>

                                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetDayType(day.key, "start_of_week")}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                        currentType === "start_of_week"
                                                            ? "bg-emerald-600 text-white shadow-sm"
                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    بداية أسبوع
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleSetDayType(day.key, "midweek")}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                        currentType === "midweek"
                                                            ? "bg-blue-600 text-white shadow-sm"
                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    وسط أسبوع
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleSetDayType(day.key, "weekend")}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                        currentType === "weekend"
                                                            ? "bg-amber-600 text-white shadow-sm"
                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    نهاية أسبوع
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ═══ 5. المرافق والخدمات من جدول amenities_lookup ═══ */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm space-y-4 font-tajawal">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-5 bg-[#00ADB5] rounded-full"></span>
                                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                                    5. المرافق والخدمات المتوفرة
                                </h2>
                            </div>
                            <span className="text-xs text-[#00ADB5] font-bold">
                                {selectedAmenities.length} محددة
                            </span>
                        </div>

                        {availableAmenities && availableAmenities.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {availableAmenities.map((item) => {
                                    const isSelected = selectedAmenities.includes(item.name);
                                    const icon = getAmenityIcon(item.icon_name, item.name);
                                    return (
                                        <button
                                            type="button"
                                            key={item.id}
                                            onClick={() => toggleAmenity(item.name)}
                                            className={`p-3 rounded-xl border text-right flex items-center gap-2.5 transition-all ${
                                                isSelected
                                                    ? "border-[#00ADB5] bg-[#E0F7FA]/40 text-[#006666] font-bold shadow-xs ring-1 ring-[#00ADB5]/30"
                                                    : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                                            }`}
                                        >
                                            <span className="text-xl">{icon}</span>
                                            <span className="text-xs leading-snug">{item.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
                                لم يتم العثور على مرافق مسجلة في النظام حالياً، يمكنك إضافتها يدوياً في الحقل أدناه:
                            </p>
                        )}

                        {/* إضافة مرفق مخصص */}
                        <div className="pt-2 flex items-center gap-2">
                            <input
                                type="text"
                                value={customAmenityInput}
                                onChange={(e) => setCustomAmenityInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomAmenity())}
                                placeholder="إضافة مرفق أو خدمة أخرى..."
                                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#00ADB5] outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleAddCustomAmenity}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                            >
                                + إضافة
                            </button>
                        </div>
                    </div>

                    {/* ═══ 6. أوقات الدخول والخروج وقواعد الإقامة ═══ */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm space-y-4 font-tajawal">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <span className="w-2 h-5 bg-[#00ADB5] rounded-full"></span>
                            <h2 className="text-sm sm:text-base font-bold text-gray-900">
                                6. أوقات الدخول والخروج وقواعد الإقامة
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    وقت الدخول (Check-in)
                                </label>
                                <input
                                    type="text"
                                    value={checkInTime}
                                    onChange={(e) => setCheckInTime(e.target.value)}
                                    placeholder="مثال: 02:00 م"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#00ADB5] outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    وقت الخروج (Check-out)
                                </label>
                                <input
                                    type="text"
                                    value={checkOutTime}
                                    onChange={(e) => setCheckOutTime(e.target.value)}
                                    placeholder="مثال: 11:00 ص"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#00ADB5] outline-none text-sm"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    قواعد وتعليمات الإقامة
                                </label>
                                <textarea
                                    rows={3}
                                    value={houseRules}
                                    onChange={(e) => setHouseRules(e.target.value)}
                                    placeholder="شروط التأمين، سياسة الحيوانات الأليفة، المحافظة على الهدوء..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#00ADB5] outline-none text-xs leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ═══ زر الإرسال ═══ */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#00ADB5] hover:bg-[#009688] disabled:bg-gray-400 text-white font-tajawal font-bold text-base py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>جاري إرسال الطلب وحفظ البيانات...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>إرسال طلب إدراج الفيلا للمعاينة والاعتماد</span>
                                </>
                            )}
                        </button>
                        <p className="text-center font-tajawal text-[11px] text-gray-400 mt-2">
                            بإرسال الطلب، فإنك تؤكد صحة البيانات ودقة الأسعار والمواصفات المدخلة.
                        </p>
                    </div>

                </form>
            </main>
        </div>
    );
}
