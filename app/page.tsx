import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // /dashboard هو نقطة التحقق الواحدة من حالة المالك والعقد.
        redirect("/dashboard");
    }

  return (
    <main className="min-h-screen flex flex-col md:flex-row-reverse bg-[var(--color-sand)]">
      {/* لوحة الهوية */}
      <section className="relative md:w-1/2 min-h-[45vh] md:min-h-screen bg-[var(--color-palm)] text-[var(--color-panel)] flex flex-col justify-center px-10 py-16 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-15"
          viewBox="0 0 400 400"
          preserveAspectRatio="xMidYMid slice"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <path
              key={i}
              d={`M ${200} ${200} Q ${200 + Math.cos((i * Math.PI) / 3) * 220} ${200 + Math.sin((i * Math.PI) / 3) * 90
                }, ${200 + Math.cos((i * Math.PI) / 3) * 320} ${200 + Math.sin((i * Math.PI) / 3) * 320
                }`}
              stroke="var(--color-gold)"
              strokeWidth="2"
              fill="none"
            />
          ))}
          <circle cx="200" cy="200" r="10" fill="var(--color-gold)" />
        </svg>

        <div className="relative z-10 max-w-md">
          <p className="font-tajawal text-sm tracking-widest text-[var(--color-gold)] mb-4">
            JERICHO VIBES
          </p>
          <h1 className="font-amiri text-4xl md:text-5xl leading-tight mb-6">
            مرحباً بكم في بوابة أصحاب الفلل
          </h1>
          <p className="font-tajawal text-base md:text-lg text-[var(--color-panel)]/85 leading-relaxed">
            من هون بتقدر تراجع بنود العقد الخاص بفيلتك مع Jericho Vibes،
            وتوقّع عليه إلكترونياً بكل أمان وسهولة.
          </p>
        </div>
      </section>

      {/* لوحة الدخول */}
      <section className="md:w-1/2 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm bg-[var(--color-panel)] rounded-2xl shadow-sm border border-[var(--color-clay)]/15 p-8">
          <h2 className="font-amiri text-2xl text-[var(--color-ink)] mb-2">
            تسجيل الدخول
          </h2>
          <p className="font-tajawal text-sm text-[var(--color-ink)]/60 mb-8">
            أدخل رقم جوالك أو بريدك الإلكتروني المسجّل لدينا
          </p>

          <Link
            href="/login"
            className="block w-full text-center font-tajawal font-medium text-[var(--color-panel)] bg-[var(--color-clay)] rounded-xl py-3 transition hover:opacity-90"
          >
            الدخول إلى حسابي
          </Link>

          <p className="font-tajawal text-xs text-[var(--color-ink)]/50 mt-6 text-center">
            بتحتاج مساعدة؟ تواصل معنا مباشرة
          </p>
        </div>
      </section>
    </main>
  );
}
