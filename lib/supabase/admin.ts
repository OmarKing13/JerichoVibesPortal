import { createClient } from "@supabase/supabase-js";

/**
 * عميل مخصّص للعمليات التي يجب أن تتم على الخادم فقط، مثل إصدار رابط تنزيل
 * لعقد تم التحقق مسبقاً من ملكيته. لا يجوز استيراده في أي Client Component.
 */
export function createAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) return null;

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}
