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
 * Formats a USD amount with proper currency symbol and decimals
 */
export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)} USD`;
}

/**
 * Formats a conversion result with both original and converted amounts
 */
export function formatConversion(hkdAmount: number): string {
  const usdAmount = convertHKDToUSD(hkdAmount);
  return `${formatUSD(usdAmount)} (was HK$${hkdAmount.toFixed(2)})`;
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
 * Handles formats like: "HK$1,234.56", "1234.56 HKD", "HKD 1,234.56"
 */
export function parseCurrencyAmount(text: string): number | null {
  // Remove currency symbols and commas
  const cleaned = text
    .replace(/HK\$/gi, '')
    .replace(/HKD/gi, '')
    .replace(/,/g, '')
    .trim();

  const amount = parseFloat(cleaned);

  return isNaN(amount) ? null : amount;
}

/**
 * Detects if a text string contains HKD currency
 */
export function isHKDCurrency(text: string): boolean {
  const hkdPattern = /HK\$|HKD/i;
  return hkdPattern.test(text);
}
