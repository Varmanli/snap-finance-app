// Persian Number and Toman Currency Formatting Utilities

/**
 * Converts English digits to Persian digits.
 * e.g. "12345" -> "۱۲۳۴۵"
 */
export function toPersianDigits(str: string | number): string {
  if (str === null || str === undefined) return '';
  const numStr = str.toString();
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return numStr.replace(/\d/g, (w) => persianDigits[parseInt(w, 10)]);
}

/**
 * Formats a number with standard comma grouping and Persian digits.
 * e.g. 1729864 -> "۱,۷۲۹,۸۶۴"
 */
export function formatNumber(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '۰';
  const integerVal = Math.round(val);
  // Format with standard commas (en-US), then replace English digits with Persian digits
  const parts = integerVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return toPersianDigits(parts);
}

/**
 * Formats an integer Toman amount into a localized Persian string with comma separators.
 * e.g. 2500000 -> "۲,۵۰۰,۰۰۰ تومان"
 */
export function formatToman(amount: number, showSymbol: boolean = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return showSymbol ? '۰ تومان' : '۰';
  }
  const formattedNumber = formatNumber(amount);
  
  if (showSymbol) {
    return `${formattedNumber} تومان`;
  }
  return formattedNumber;
}

/**
 * Formats decimal values (e.g. Km or percentages) to N decimal places with Persian digits and comma grouping.
 * e.g. 12.5 -> "۱۲.۵"
 */
export function formatDecimal(val: number, decimals: number = 1): string {
  if (isNaN(val) || val === null || val === undefined) return '۰';
  const fixedStr = val.toFixed(decimals);
  const [intPart, decPart] = fixedStr.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const result = decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  return toPersianDigits(result);
}
