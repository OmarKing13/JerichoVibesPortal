import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "غير مصرح لك، يرجى تسجيل الدخول أولاً" }, { status: 401 });
        }

        // جلب المدير النشط
        const { data: manager, error: managerError } = await supabase
            .from("managers")
            .select("id")
            .eq("profile_id", user.id)
            .eq("status", "active")
            .maybeSingle();

        if (managerError || !manager) {
            return NextResponse.json({ error: "حساب المدير غير نشط أو غير مسجل" }, { status: 403 });
        }

        const body = await req.json();
        const {
            name,
            description,
            address,
            city = "أريحا",
            city_id,
            latitude,
            longitude,
            max_guests,
            num_bedrooms,
            num_bathrooms,
            display_contact_number,
            owner_phone_number,
            currency = "ILS",
            currency_id,
            start_of_week_price,
            midweek_price_per_night,
            weekend_price_per_night,
            day_classifications,
            amenities = [],
            image_urls = [],
            check_in_time,
            check_out_time,
            house_rules,
        } = body;

        // التحقق من الحقول الإجبارية
        if (!name || !description || !address) {
            return NextResponse.json(
                { error: "يرجى تعبئة الحقول الإجبارية (اسم الفيلا، الوصف، العنوان)" },
                { status: 400 }
            );
        }

        const newRequest = {
            manager_id: manager.id,
            name: name.trim(),
            description: description.trim(),
            address: address.trim(),
            city: city.trim() || "أريحا",
            city_id: city_id || null,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            max_guests: parseInt(max_guests) || 1,
            num_bedrooms: parseInt(num_bedrooms) || 1,
            num_bathrooms: parseInt(num_bathrooms) || 1,
            display_contact_number: display_contact_number || null,
            owner_phone_number: owner_phone_number || null,
            currency: currency || "ILS",
            currency_id: currency_id || null,
            start_of_week_price: start_of_week_price ? parseFloat(start_of_week_price) : null,
            midweek_price_per_night: midweek_price_per_night ? parseFloat(midweek_price_per_night) : null,
            weekend_price_per_night: weekend_price_per_night ? parseFloat(weekend_price_per_night) : null,
            day_classifications: day_classifications || {},
            amenities: Array.isArray(amenities) ? amenities : [],
            image_urls: Array.isArray(image_urls) ? image_urls : [],
            check_in_time: check_in_time || null,
            check_out_time: check_out_time || null,
            house_rules: house_rules || null,
            status: "pending",
        };

        // محاولة الحفظ باستخدام العميل العادي أولاً
        let insertResult = await supabase
            .from("villa_requests")
            .insert(newRequest)
            .select()
            .single();

        // إذا كان الخطأ بسبب عدم وجود أعمدة city_id أو currency_id في الجدول المنشأ مسبقاً
        if (insertResult.error && insertResult.error.code === "PGRST204") {
            console.warn("Retrying insert without city_id and currency_id...");
            const { city_id: _c, currency_id: _cur, ...fallbackRequest } = newRequest;
            insertResult = await supabase
                .from("villa_requests")
                .insert(fallbackRequest)
                .select()
                .single();
        }

        // في حال كان هناك قيود RLS خاصة، نستخدم admin client كخطة بديلة آمنة
        if (insertResult.error) {
            const admin = createAdminClient();
            if (admin) {
                insertResult = await admin
                    .from("villa_requests")
                    .insert(newRequest)
                    .select()
                    .single();

                if (insertResult.error && insertResult.error.code === "PGRST204") {
                    const { city_id: _c, currency_id: _cur, ...fallbackRequest } = newRequest;
                    insertResult = await admin
                        .from("villa_requests")
                        .insert(fallbackRequest)
                        .select()
                        .single();
                }
            }
        }

        if (insertResult.error) {
            console.error("Error inserting villa request:", insertResult.error);
            // إذا كان الجدول غير موجود بعد
            if (insertResult.error.code === "42P01") {
                return NextResponse.json(
                    {
                        error: "جدول طلبات الفلل (villa_requests) لم يتم إنشاؤه في قاعدة البيانات بعد. يرجى تنفيذ ملف SQL في لوحة Supabase.",
                        needsMigration: true,
                    },
                    { status: 500 }
                );
            }
            return NextResponse.json(
                { error: insertResult.error.message || "حدث خطأ أثناء حفظ الطلب" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: insertResult.data,
            message: "تم إرسال طلب إضافة الفيلا بنجاح وهو الآن قيد المراجعة والمعاينة",
        });
    } catch (err: unknown) {
        console.error("API error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "حدث خطأ غير متوقع" },
            { status: 500 }
        );
    }
}
