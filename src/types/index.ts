/**
 * Type definitions - re-exported from Zod schemas
 * This file maintains backward compatibility while using Zod for schema validation
 */

export type {
  CurrencyConfig,
  CurrencyMatch,
  ConversionResult,
} from '../schemas';

// Re-export schemas for validation purposes
export {
  CurrencyConfigSchema,
  CurrencyMatchSchema,
  ConversionResultSchema,
} from '../schemas';
