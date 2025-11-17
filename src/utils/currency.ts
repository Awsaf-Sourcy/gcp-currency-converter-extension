import {
  CurrencyConfig,
  ConversionResult,
  CurrencyConfigSchema,
  ConversionResultSchema,
} from '../types';

/**
 * Static conversion rate from HKD to USD
 * Approximately 1 HKD = 0.128 USD (as of recent rates)
 */
export const HKD_TO_USD_RATE = 0.128;

/**
 * Currency configuration for HKD to USD conversion
 * Validated using Zod schema
 */
export const currencyConfig: CurrencyConfig = CurrencyConfigSchema.parse({
  fromCurrency: 'HKD',
  toCurrency: 'USD',
  rate: HKD_TO_USD_RATE,
});

/**
 * Converts an amount from HKD to USD using the static rate
 */
export function convertHKDToUSD(amount: number): number {
  return amount * HKD_TO_USD_RATE;
}

/**
 * Formats a number with K/M/B suffix if appropriate
 * Handles negative numbers correctly
 */
export function formatWithSuffix(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formatted: string;

  if (absAmount >= 1000000000) {
    formatted = `${(absAmount / 1000000000).toFixed(2)}B`;
  } else if (absAmount >= 1000000) {
    formatted = `${(absAmount / 1000000).toFixed(2)}M`;
  } else if (absAmount >= 1000) {
    formatted = `${(absAmount / 1000).toFixed(2)}K`;
  } else if (absAmount >= 1) {
    formatted = absAmount.toFixed(2);
  } else {
    // For very small amounts, show more precision
    formatted = absAmount.toFixed(4).replace(/\.?0+$/, '');
  }

  return isNegative ? `-$${formatted}` : `$${formatted}`;
}

/**
 * Formats a USD amount with proper currency symbol and decimals
 */
export function formatUSD(amount: number): string {
  return `${formatWithSuffix(amount)} USD`;
}

/**
 * Formats a conversion result with both original and converted amounts
 * @param hkdAmount - The original HKD amount
 * @param showOriginal - Whether to show original amount (default: true)
 */
export function formatConversion(hkdAmount: number, showOriginal: boolean = true): string {
  const usdAmount = convertHKDToUSD(hkdAmount);

  if (showOriginal) {
    return `${formatUSD(usdAmount)} (${formatWithSuffix(hkdAmount)} HKD)`;
  } else {
    return formatUSD(usdAmount);
  }
}

/**
 * Performs a complete currency conversion and returns detailed result
 * Result is validated using Zod schema to ensure type safety
 */
export function performConversion(amount: number): ConversionResult {
  const convertedAmount = convertHKDToUSD(amount);

  const result = {
    originalAmount: amount,
    convertedAmount,
    fromCurrency: currencyConfig.fromCurrency,
    toCurrency: currencyConfig.toCurrency,
    formattedValue: formatConversion(amount),
  };

  // Validate the result matches our schema
  return ConversionResultSchema.parse(result);
}

/**
 * Parses a currency string and extracts the numeric amount
 * Handles formats like: "$1,234.56", "$36.9K", "$1.12M", "$200K"
 */
export function parseCurrencyAmount(text: string): number | null {
  // Remove currency symbols and spaces
  let cleaned = text
    .replace(/\$/g, '')
    .replace(/HK/gi, '')
    .replace(/HKD/gi, '')
    .replace(/,/g, '')
    .trim();

  // Handle K, M, B suffixes
  let multiplier = 1;

  if (cleaned.endsWith('K') || cleaned.endsWith('k')) {
    multiplier = 1000;
    cleaned = cleaned.slice(0, -1);
  } else if (cleaned.endsWith('M') || cleaned.endsWith('m')) {
    multiplier = 1000000;
    cleaned = cleaned.slice(0, -1);
  } else if (cleaned.endsWith('B') || cleaned.endsWith('b')) {
    multiplier = 1000000000;
    cleaned = cleaned.slice(0, -1);
  }

  const amount = parseFloat(cleaned) * multiplier;

  return isNaN(amount) ? null : amount;
}

/**
 * Detects if a text string contains HKD currency
 */
export function isHKDCurrency(text: string): boolean {
  const hkdPattern = /HK\$|HKD/i;
  return hkdPattern.test(text);
}
