import type { Metadata } from "next";
import { Amiri, Tajawal } from "next/font/google";
import "./globals.css";

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "بوابة أصحاب الفلل | Jericho Vibes",
  description: "بوابة أصحاب الفلل لمراجعة العقد والتوقيع عليه إلكترونياً",
  themeColor: "#00ADB5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} ${tajawal.variable}`}>
      <body className="font-tajawal antialiased bg-[var(--color-surface)] text-[var(--color-ink)]">
        {children}
      </body>
    </html>
  );
}