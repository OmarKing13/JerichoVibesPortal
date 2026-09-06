/* ═══════════════════════════════════════
   بند فرعي داخل بند رئيسي
   ═══════════════════════════════════════ */
export interface SubClause {
    text: string;
    description?: string;
}

/* ═══════════════════════════════════════
   بند رئيسي
   ═══════════════════════════════════════ */
export interface Clause {
    text: string;
    description?: string;
    subClauses?: SubClause[];
}

/* ═══════════════════════════════════════
   قسم (مادة) في العقد
   ═══════════════════════════════════════ */
export interface ContractSection {
    title: string;
    clauses: Clause[];
}

/* ═══════════════════════════════════════
   محتوى العقد فقط (اللي يدخل الـ PDF)
   ═══════════════════════════════════════ */
export interface ContractData {
    title: string;
    preamble?: string;
    sections: ContractSection[];
    legalRecordTitle: string;
    footer: string;
}

/* ═══════════════════════════════════════
   الحاوية الكاملة: وصفية + محتوى + موافقة
   ═══════════════════════════════════════ */
export interface ContractContent {
    version: string;
    fileName: string;
    contract: ContractData;
    approvalText: string;
}