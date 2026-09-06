import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type {
  ContractData,
  ContractSection,
  Clause,
  SubClause,
} from "../content/types";

/* ═══════════════════════════════════════
   الخطوط
   ═══════════════════════════════════════ */

Font.register({
  family: "Amiri",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/amiri/v30/J7aRnpd8CGxBHqUp.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/amiri/v30/J7acnpd8CGxBHp2VkZY4xJ9CGyAa.ttf",
      fontWeight: 700,
    },
  ],
});

/* ═══════════════════════════════════════
   مساعد أرقام: react-pdf/PDFKit ما بيطبق خوارزمية
   Unicode Bidi كاملة، فأي رقم غربي (0-9) جوا جملة
   عربية بيطلع بمكان غلط. الأرقام العربية-الهندية
   (٠-٩) نوعها Bidi مختلف وبتنحط صح تلقائياً.
   ═══════════════════════════════════════ */

function toArabicIndicDigits(value: string | number): string {
  const western = "0123456789";
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  return String(value).replace(/[0-9]/g, (d) => arabic[western.indexOf(d)]);
}

/* ═══════════════════════════════════════
   الألوان والمسافات
   ═══════════════════════════════════════ */

const C = {
  primary: "#00ADB5",
  primaryDark: "#006666",
  primaryLight: "#E0F7FA",
  text: "#1a1a1a",
  textSec: "#555555",
  textMuted: "#999999",
  surface: "#F7F9FA",
  white: "#ffffff",
  line: "#E0E0E0",
};

const sp = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 22,
  xl: 32,
  xxl: 44,
};

// ارتفاعات ثابتة صريحة للهيدر والفوتر — لازم تتطابق مع الـ spacer views تحت
const HEADER_HEIGHT = 46;
const FOOTER_HEIGHT = 34;

/* ═══════════════════════════════════════
   الأنماط
   ═══════════════════════════════════════ */

const styles = StyleSheet.create({
  page: {
    fontFamily: "Amiri",
    fontSize: 11,
    color: C.text,
    paddingTop: HEADER_HEIGHT + sp.md,      // ← الـ padding هون، على الصفحة مباشرة
    paddingBottom: FOOTER_HEIGHT + sp.md,   // ← مش على content
  },

  /* ── هيدر (زخرفي فقط، فوق كل شي) ── */
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: sp.xl,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  // عنصر حجز مساحة حقيقي (مش padding) — بيتكرر كل صفحة ويضمن إنه
  // المحتوى ما بيبلش إلا تحت الهيدر فعلياً، حتى لما يكون استمرار
  // لفقرة جاية من الصفحة السابقة (هاي بالضبط الحالة يلي كانت تنكسر)
  headerSpacer: {
    height: HEADER_HEIGHT,
  },
  headerBrand: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 4,
    color: C.primaryDark,
  },
  headerDoc: {
    fontSize: 8,
    color: C.textMuted,
  },

  /* ── محتوى ── */
  content: {
    paddingHorizontal: sp.xl,
  },

  /* ── عنوان العقد ── */
  titleBlock: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: sp.xl,
  },
  titleLine: {
    width: 50,
    height: 2,
    backgroundColor: C.primary,
    borderRadius: 1,
    marginBottom: sp.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: C.text,
    textAlign: "center",
  },

  /* ── الأطراف ── */
  intro: {
    marginBottom: sp.xl,
    lineHeight: 1.9,
    textAlign: "right",
  },
  partyRow: {
    flexDirection: "row-reverse",
    marginBottom: sp.xs,
  },
  partyLabel: {
    fontWeight: 700,
    fontSize: 11,
  },
  partyValue: {
    fontSize: 11,
    flex: 1,
  },

  /* ── التمهيد ── */
  preamble: {
    backgroundColor: C.surface,
    borderRadius: 6,
    padding: sp.md,
    marginBottom: sp.xl,
    lineHeight: 1.9,
    textAlign: "right",
  },
  preambleLabel: {
    fontWeight: 700,
    marginBottom: sp.xs,
    fontSize: 12,
    color: C.primaryDark,
  },

  /* ── القسم ── */
  section: {
    marginBottom: sp.lg,
  },
  sectionAccent: {
    flexDirection: "row-reverse",
    alignItems: "stretch",
    marginBottom: sp.md,
  },
  sectionBar: {
    width: 4,
    backgroundColor: C.primary,
    borderRadius: 2,
  },
  sectionTitleArea: {
    flex: 1,
    paddingRight: sp.sm,
    paddingTop: 1,
  },
  sectionNumber: {
    fontSize: 14,
    fontWeight: 700,
    color: C.primaryDark,
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: C.text,
    textAlign: "right",
    marginTop: sp.xs,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: C.line,
    marginTop: sp.sm,
  },

  /* ── البند ── */
  clause: {
    marginBottom: sp.md,
    paddingRight: sp.lg,
    textAlign: "right",
  },
  clauseTitle: {
    fontSize: 11.5,
    fontWeight: 700,
    color: C.text,
    lineHeight: 1.8,
  },

  /* ── شرح البند ── */
  clauseDesc: {
    fontSize: 10,
    color: C.textSec,
    lineHeight: 1.7,
    marginTop: sp.xs,
    paddingRight: sp.md,
    borderRightWidth: 2,
    borderRightColor: C.primaryLight,
  },

  /* ── البنود الفرعية ── */
  subList: {
    paddingRight: sp.lg,
    marginTop: sp.sm,
  },
  subItem: {
    marginBottom: sp.sm,
  },
  subTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    color: C.text,
    lineHeight: 1.7,
  },
  subDesc: {
    fontSize: 9.5,
    color: C.textMuted,
    lineHeight: 1.6,
    marginTop: 2,
    paddingRight: sp.md,
  },

  /* ── السجل الرقمي ── */
  legalBox: {
    backgroundColor: C.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.line,
    padding: sp.md,
    marginTop: sp.xl,
  },
  legalTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: C.text,
    textAlign: "right",
    marginBottom: sp.sm,
  },
  legalRow: {
    flexDirection: "row-reverse",
    marginBottom: sp.xs,
  },
  legalLabel: {
    fontSize: 9,
    color: C.textMuted,
    width: 80,
    textAlign: "left",
  },
  legalValue: {
    fontSize: 9,
    color: C.textSec,
    flex: 1,
    textAlign: "left", // IP/User-Agent تقنية بحتة، تبقى LTR
  },

  /* ── التوقيعات ── */
  sigRow: {
    flexDirection: "row-reverse",
    marginTop: sp.xxl,
  },
  sigBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 6,
    padding: sp.md,
    alignItems: "center",
  },
  sigBoxGap: {
    marginRight: sp.lg,
  },
  sigLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: C.text,
    marginBottom: sp.lg,
  },
  sigLine: {
    width: "80%",
    height: 1,
    backgroundColor: C.text,
    marginBottom: sp.sm,
  },
  sigName: {
    fontSize: 12,
    fontWeight: 700,
    color: C.text,
  },
  sigDate: {
    fontSize: 9,
    color: C.textMuted,
    marginTop: sp.xs,
  },

  /* ── فوتر (زخرفي فقط) ── */
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: FOOTER_HEIGHT,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: sp.xl,
    borderTopWidth: 1,
    borderTopColor: C.line,
    backgroundColor: C.white,
  },
  footerText: {
    fontSize: 7,
    color: C.textMuted,
  },
  footerPage: {
    fontSize: 7,
    color: C.textMuted,
  },
});

/* ═══════════════════════════════════════
   مساعدات
   ═══════════════════════════════════════ */

const ARABIC_ORDINALS = [
  "الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة",
  "السادسة", "السابعة", "الثامنة", "التاسعة", "العاشرة",
  "الحادية عشرة", "الثانية عشرة", "الثالثة عشرة", "الرابعة عشرة", "الخامسة عشرة",
  "السادسة عشرة", "السابعة عشرة", "الثامنة عشرة", "التاسعة عشرة", "العشرين",
];

function ordinal(n: number): string {
  return ARABIC_ORDINALS[n - 1] ?? String(n);
}

/* ═══════════════════════════════════════
   بند فرعي
   ═══════════════════════════════════════ */

function SubClauseItem({ item }: { item: SubClause; index?: number }) {
  return (
    <View style={styles.subItem}>
      <Text style={styles.subTitle}>{item.text}</Text>
      {item.description && (
        <Text style={styles.subDesc}>{item.description}</Text>
      )}
    </View>
  );
}

/* ═══════════════════════════════════════
   بند رئيسي
   ═══════════════════════════════════════ */

function ClauseItem({ item }: { item: Clause; index?: number }) {
  return (
    <View style={styles.clause}>
      <Text style={styles.clauseTitle}>{item.text}</Text>

      {item.description && (
        <Text style={styles.clauseDesc}>{item.description}</Text>
      )}

      {item.subClauses && item.subClauses.length > 0 && (
        <View style={styles.subList}>
          {item.subClauses.map((sub, i) => (
            <SubClauseItem key={i} item={sub} index={i} />
          ))}
        </View>
      )}
    </View>
  );
}

/* ═══════════════════════════════════════
   قسم (مادة)
   ═══════════════════════════════════════ */

function SectionBlock({
  section,
  index,
}: {
  section: ContractSection;
  index: number;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionAccent}>
        <View style={styles.sectionBar} />
        <View style={styles.sectionTitleArea}>
          <Text style={styles.sectionNumber}>
            المادة {ordinal(index + 1)}
          </Text>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionDivider} />
        </View>
      </View>

      {section.clauses.map((clause, i) => (
        <ClauseItem key={i} item={clause} index={i} />
      ))}
    </View>
  );
}

/* ═══════════════════════════════════════
   المكون الرئيسي
   ═══════════════════════════════════════ */

interface ContractProps {
  contractData: ContractData;
  managerName: string;
  nationalId: string;
  phoneNumber: string;
  ipAddress: string;
  userAgent: string;
  date: string;
}

export const ContractV1 = ({
  contractData: data,
  managerName,
  nationalId,
  phoneNumber,
  ipAddress,
  userAgent,
  date,
}: ContractProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* هيدر زخرفي — يرسم فوق كل شي بكل صفحة */}
      <View fixed style={styles.header}>
        <Text style={styles.headerBrand}>JERICHO VIBES</Text>
        <Text style={styles.headerDoc}>عقد إدراج وتسويق فيلا</Text>
      </View>



      {/* محتوى */}
      <View style={styles.content}>
        {/* عنوان */}
        <View style={styles.titleBlock}>
          <View style={styles.titleLine} />
          <Text style={styles.title}>{data.title}</Text>
          <View style={styles.titleLine} />
        </View>

        {/* الأطراف */}
        <View style={styles.intro}>
          <Text style={{ marginBottom: sp.sm }}>
            إنه في يوم {toArabicIndicDigits(date)}، تم الاتفاق بين كل من:
          </Text>
          <View style={styles.partyRow}>
            <Text style={styles.partyLabel}>الطرف الأول: </Text>
            <Text style={styles.partyValue}>
              ممثلة بالسيد عمر داود حسين صالح، يحمل هوية
              وطنية رقم ({toArabicIndicDigits("406593095")})، ورقم جوال (
              {toArabicIndicDigits("0595153443")}).
            </Text>
          </View>
          <View style={styles.partyRow}>
            <Text style={styles.partyLabel}>الطرف الثاني: </Text>
            <Text style={styles.partyValue}>
              السيد/ة {managerName}، يحمل/ة هوية وطنية رقم (
              {toArabicIndicDigits(nationalId)})، ورقم جوال (
              {toArabicIndicDigits(phoneNumber)}).
            </Text>
          </View>
        </View>

        {/* تمهيد */}
        {data.preamble && (
          <View style={styles.preamble} wrap={false}>
            <Text style={styles.preambleLabel}>تمهيد:</Text>
            <Text>{data.preamble}</Text>
          </View>
        )}

        {/* الأقسام */}
        {data.sections.map((section, i) => (
          <SectionBlock key={i} section={section} index={i} />
        ))}

        {/* السجل الرقمي */}
        <View style={styles.legalBox} wrap={false}>
          <Text style={styles.legalTitle}>{data.legalRecordTitle}</Text>
          <View style={styles.legalRow}>
            <Text style={styles.legalLabel}>IP Address</Text>
            <Text style={styles.legalValue}>{ipAddress}</Text>
          </View>
          <View style={styles.legalRow}>
            <Text style={styles.legalLabel}>User Agent</Text>
            <Text style={styles.legalValue}>{userAgent}</Text>
          </View>
          <View style={styles.legalRow}>
            <Text style={styles.legalLabel}>Timestamp</Text>
            <Text style={styles.legalValue}>{date}</Text>
          </View>
        </View>

        {/* التوقيعات */}
        <View style={styles.sigRow} wrap={false}>
          <View style={styles.sigBox}>
            <Text style={styles.sigLabel}>الطرف الأول</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>عمر داود حسين صالح</Text>
            <Text style={styles.sigDate}>
              التاريخ: {toArabicIndicDigits(date)}
            </Text>
          </View>
          <View style={[styles.sigBox, styles.sigBoxGap]}>
            <Text style={styles.sigLabel}>الطرف الثاني (إلكتروني)</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>{managerName}</Text>
            <Text style={styles.sigDate}>
              التاريخ: {toArabicIndicDigits(date)}
            </Text>
          </View>
        </View>
      </View>

      {/* فوتر زخرفي */}
      <View fixed style={styles.footer}>
        <Text style={styles.footerText}>{data.footer}</Text>
        <Text
          style={styles.footerPage}
          render={({ pageNumber, totalPages }) =>
            `${toArabicIndicDigits(pageNumber)} / ${toArabicIndicDigits(totalPages)}`
          }
        />
      </View>
    </Page>
  </Document>
);