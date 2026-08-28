import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row-reverse bg-[var(--color-surface)]">

      {/* ═══════════════════════════════════════════
          لوحة الهوية — الخلفية التركوازية الداكنة
          ═══════════════════════════════════════════ */}
      <section className="relative md:w-1/2 min-h-[42vh] md:min-h-screen bg-[var(--color-primary-dark)] text-white flex flex-col justify-center px-10 py-16 overflow-hidden">

        {/* ── نقش هندسي خلفي ── */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.07]"
          viewBox="0 0 600 600"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* دوائر متداخلة توحي بالفيلات/الأقواس */}
          <circle cx="300" cy="300" r="260" stroke="#00ADB5" strokeWidth="1.5" fill="none" />
          <circle cx="300" cy="300" r="200" stroke="#00ADB5" strokeWidth="1" fill="none" />
          <circle cx="300" cy="300" r="140" stroke="#00ADB5" strokeWidth="0.8" fill="none" />
          <circle cx="300" cy="300" r="80" stroke="#00ADB5" strokeWidth="0.6" fill="none" />

          {/* خطوط شعاعية */}
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1="300" y1="300"
              x2={300 + Math.cos((i * Math.PI * 2) / 12) * 280}
              y2={300 + Math.sin((i * Math.PI * 2) / 12) * 280}
              stroke="#00ADB5"
              strokeWidth="0.5"
            />
          ))}

          {/* نقطة مركزية */}
          <circle cx="300" cy="300" r="6" fill="#00ADB5" opacity="0.5" />
        </svg>

        {/* ── تدرج لوني إضافي ── */}
        <div className="absolute inset-0 bg-gradient-to-tl from-[var(--color-primary-dark)] via-transparent to-[var(--color-primary)]/20" />

        {/* ── عنصر عائم مزخرف ── */}
        <div className="absolute top-12 left-12 w-32 h-32 rounded-full bg-[var(--color-primary)]/10 blur-2xl animate-float" />
        <div className="absolute bottom-20 right-8 w-48 h-48 rounded-full bg-[var(--color-accent)]/8 blur-3xl animate-pulse-soft" />

        {/* ── المحتوى النصي ── */}
        <div className="relative z-10 max-w-md">
          {/* الشعار النصي */}
          <div className="flex items-center gap-3 mb-8 animate-slide-up">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="font-tajawal text-sm font-medium tracking-[0.2em] text-[var(--color-primary)]">
              JERICHO VIBES
            </span>
          </div>

          {/* العنوان الرئيسي */}
          <h1 className="font-amiri text-4xl md:text-[2.75rem] leading-[1.3] mb-6 animate-slide-up-delay">
            مرحباً بكم في
            <br />
            <span className="text-[var(--color-primary)]">بوابة أصحاب الفلل</span>
          </h1>

          {/* الوصف */}
          <p className="font-tajawal text-base md:text-lg text-white/70 leading-relaxed mb-10 animate-slide-up-delay-2">
            من هون بتقدر تراجع بنود العقد الخاص بفيلتك مع
            <span className="text-[var(--color-primary)] font-medium"> Jericho Vibes</span>،
            وتوقّع عليه إلكترونياً بكل أمان وسهولة.
          </p>

          {/* مميزات سريعة */}
          <div className="flex flex-col gap-3 animate-slide-up-delay-2">
            {[
              { icon: "shield", text: "توقيع إلكتروني آمن وموثّق" },
              { icon: "document", text: "مراجعة بنود العقد بالتفصيل" },
              { icon: "clock", text: "إتمام العملية بأقل وقت ممكن" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/55 text-sm font-tajawal">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  {item.icon === "shield" && (
                    <svg className="w-3.5 h-3.5 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  )}
                  {item.icon === "document" && (
                    <svg className="w-3.5 h-3.5 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  )}
                  {item.icon === "clock" && (
                    <svg className="w-3.5 h-3.5 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  )}
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          لوحة الدخول — الخلفية البيضاء النظيفة
          ═══════════════════════════════════════════ */}
      <section className="md:w-1/2 flex items-center justify-center px-6 py-16 bg-[var(--color-surface-alt)]">

        <div className="w-full max-w-sm">

          {/* ── البطاقة الرئيسية ── */}
          <div className="glass-card p-8 animate-slide-up">

            {/* أيقونة الفيلا */}
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-light)] flex items-center justify-center mb-6 mx-auto">
              <svg className="w-7 h-7 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>

            {/* العنوان */}
            <h2 className="font-amiri text-2xl text-[var(--color-ink)] mb-2 text-center">
              تسجيل الدخول
            </h2>
            <p className="font-tajawal text-sm text-[var(--color-ink-secondary)] mb-8 text-center leading-relaxed">
              أدخل رقم جوالك أو بريدك الإلكتروني
              <br />
              المسجّل لدينا للمتابعة
            </p>

            {/* زر الدخول */}
            <Link
              href="/login"
              className="btn-primary block w-full text-center font-tajawal text-base"
            >
              الدخول إلى حسابي
            </Link>

            {/* فاصل */}
            <div className="divider-ornament my-6">
              <span className="text-xs text-[var(--color-ink-muted)] font-tajawal">أو</span>
            </div>

            {/* خيار المساعدة */}
            <Link
              href="#"
              className="flex items-center justify-center gap-2 font-tajawal text-sm text-[var(--color-ink-secondary)] hover:text-[var(--color-primary)] transition-colors duration-200 group"
            >
              <svg className="w-4 h-4 transition-colors duration-200 group-hover:text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              بتحتاج مساعدة؟ تواصل معنا
            </Link>
          </div>

          {/* ── تذييل صغير ── */}
          <p className="font-tajawal text-[11px] text-[var(--color-ink-muted)] mt-6 text-center leading-relaxed">
            بالدخول أنت توافق على{" "}
            <Link href="#" className="text-[var(--color-primary)] hover:underline">
              شروط الاستخدام
            </Link>
            {" "}و{" "}
            <Link href="#" className="text-[var(--color-primary)] hover:underline">
              سياسة الخصوصية
            </Link>
          </p>

          {/* ── شعار Jericho Vibes الصغير ── */}
          <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
            <span className="font-tajawal text-[10px] tracking-[0.15em] text-[var(--color-ink-muted)]">
              JERICHO VIBES
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
          </div>
        </div>
      </section>
    </main>
  );
}