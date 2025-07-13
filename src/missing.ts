/**
 * For fields that can be skipped.
 * Equivalent to Python's _UndefinedType class.
 */
const Undefined = Symbol("Undefined");
type UndefinedType = typeof Undefined;


// Union types for missing values
export type Missing<T> = T | UndefinedType;
export type MissingOptional<T> = T | null | UndefinedType;

// Export the Undefined symbol and its type
export { Undefined };
export type { UndefinedType };

// Helper function to check if value is Undefined
export function isUndefined(value: any): value is UndefinedType {
  return value === Undefined;
}