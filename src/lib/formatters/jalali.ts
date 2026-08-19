// Jalali (Persian Calendar) Formatting & Conversion Utilities

import { toPersianDigits } from './currency';

export const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

/**
 * Converts Gregorian date (year, month 1-12, day 1-31) to Jalali date object.
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

/**
 * Converts Jalali date (year, month 1-12, day 1-31) to Gregorian date object.
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  while (gm < 12 && days >= sal_a[gm + 1]) {
    days -= sal_a[gm + 1];
    gm++;
  }
  return { gy, gm: gm + 1, gd: days + 1 };
}

/**
 * Converts ISO date string YYYY-MM-DD to Jalali parts { jy, jm, jd }.
 */
export function isoToJalaliParts(isoDateStr: string): { jy: number; jm: number; jd: number } {
  if (!isoDateStr) {
    const now = new Date();
    return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
  const [gy, gm, gd] = isoDateStr.split('-').map(Number);
  return gregorianToJalali(gy || 2026, gm || 1, gd || 1);
}

/**
 * Converts Jalali parts { jy, jm, jd } to ISO date string YYYY-MM-DD.
 */
export function jalaliPartsToISO(jy: number, jm: number, jd: number): string {
  const { gy, gm, gd } = jalaliToGregorian(jy, jm, jd);
  const mm = String(gm).padStart(2, '0');
  const dd = String(gd).padStart(2, '0');
  return `${gy}-${mm}-${dd}`;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) or Date object into a readable Jalali date string.
 * e.g. "2026-08-20" -> "۲۹ مرداد ۱۴۰۵"
 */
export function formatJalaliDate(dateInput: string | Date | number): string {
  if (!dateInput) return '';
  let isoStr = typeof dateInput === 'string' ? dateInput : '';
  if (dateInput instanceof Date) {
    isoStr = dateInput.toISOString().split('T')[0];
  } else if (typeof dateInput === 'number') {
    isoStr = new Date(dateInput).toISOString().split('T')[0];
  }

  try {
    const { jy, jm, jd } = isoToJalaliParts(isoStr);
    const monthName = PERSIAN_MONTH_NAMES[jm - 1] || '';
    return `${toPersianDigits(jd)} ${monthName} ${toPersianDigits(jy)}`;
  } catch (e) {
    return isoStr;
  }
}

/**
 * Formats date into concise Jalali format: YYYY/MM/DD in Persian digits.
 * e.g. "2026-08-20" -> "۱۴۰۵/۰۵/۲۹"
 */
export function formatJalaliShort(dateInput: string | Date | number): string {
  if (!dateInput) return '';
  let isoStr = typeof dateInput === 'string' ? dateInput : '';
  if (dateInput instanceof Date) {
    isoStr = dateInput.toISOString().split('T')[0];
  } else if (typeof dateInput === 'number') {
    isoStr = new Date(dateInput).toISOString().split('T')[0];
  }

  try {
    const { jy, jm, jd } = isoToJalaliParts(isoStr);
    const mmStr = String(jm).padStart(2, '0');
    const ddStr = String(jd).padStart(2, '0');
    return `${toPersianDigits(jy)}/${toPersianDigits(mmStr)}/${toPersianDigits(ddStr)}`;
  } catch (e) {
    return isoStr;
  }
}

/**
 * Gets Persian day name of the week.
 * e.g. "شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"
 */
export function getPersianDayName(dateInput: string | Date | number): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  return dayNames[date.getDay()];
}

/**
 * Get current date in ISO format YYYY-MM-DD in local time
 */
export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a 24-hour time string (e.g., "07:30") into Persian digits (e.g., "۰۷:۳۰").
 */
export function formatTime24(timeStr: string): string {
  if (!timeStr) return '';
  return toPersianDigits(timeStr);
}
