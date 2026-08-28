export function toEnglishDigits(input: string): string {
    const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
    return input.replace(/[٠-٩]/g, (d) => String(arabicIndic.indexOf(d)));
}

export function formatPalestinianPhone(input: string): string {
    const digitsOnly = toEnglishDigits(input).replace(/\D/g, "");
    const local = digitsOnly.startsWith("0") ? digitsOnly.slice(1) : digitsOnly;
    return `+972${local}`;
}