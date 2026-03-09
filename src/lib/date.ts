/**
 * Date utility for Gregorian dates only.
 * Replaces the previous Hijri/Dual date system.
 */

/**
 * Formats a date as a numeric string (DD/MM/YYYY)
 */
export function formatNumericDate(date: Date | string): string {
    let gDate = typeof date === 'string' ? new Date(date) : date;
    if (!gDate || isNaN(gDate.getTime())) {
        gDate = new Date();
    }

    const day = gDate.getDate().toString().padStart(2, '0');
    const month = (gDate.getMonth() + 1).toString().padStart(2, '0');
    const year = gDate.getFullYear();

    return `${day}/${month}/${year}`;
}

/**
 * Alias for formatNumericDate
 */
export function formatDate(date: Date | string): string {
    return formatNumericDate(date);
}
