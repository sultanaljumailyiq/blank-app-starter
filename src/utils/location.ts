
/** Iraqi Governorates — Single source of truth for all dropdowns */
export const IRAQI_GOVERNORATES = [
    'بغداد',
    'البصرة',
    'نينوى',
    'أربيل',
    'النجف',
    'كربلاء',
    'ديالى',
    'كركوك',
    'ذي قار',
    'ميسان',
    'المثنى',
    'الأنبار',
    'بابل',
    'صلاح الدين',
    'واسط',
    'القادسية',
] as const;

export type IraqiGovernorate = typeof IRAQI_GOVERNORATES[number];

/**
 * Format location for display: "المحافظة، العنوان"
 * Falls back gracefully if either part is missing.
 */
export function formatLocation(governorate?: string | null, address?: string | null): string {
    const g = governorate?.trim();
    const a = address?.trim();
    if (g && a) return `${g}، ${a}`;
    if (g) return g;
    if (a) return a;
    return '';
}
