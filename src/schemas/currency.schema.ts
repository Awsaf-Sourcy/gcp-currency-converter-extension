import { z } from 'zod';

/**
 * Schema for currency conversion configuration
 */
export const CurrencyConfigSchema = z.object({
  fromCurrency: z.string().min(3).max(3).toUpperCase(),
  toCurrency: z.string().min(3).max(3).toUpperCase(),
  rate: z.number().positive(),
});

/**
 * Schema for a detected currency value in the DOM
 */
export const CurrencyMatchSchema = z.object({
  element: z.custom<Node>((val) => val instanceof Node, {
    message: 'Must be a valid DOM Node',
  }),
  text: z.string(),
  amount: z.number(),
  currency: z.string(),
  fullMatch: z.string(),
});

/**
 * Schema for the result of a currency conversion operation
 */
export const ConversionResultSchema = z.object({
  originalAmount: z.number(),
  convertedAmount: z.number(),
  fromCurrency: z.string().min(3).max(3),
  toCurrency: z.string().min(3).max(3),
  formattedValue: z.string(),
});

/**
 * Inferred TypeScript types from Zod schemas
 */
export type CurrencyConfig = z.infer<typeof CurrencyConfigSchema>;
export type CurrencyMatch = z.infer<typeof CurrencyMatchSchema>;
export type ConversionResult = z.infer<typeof ConversionResultSchema>;
