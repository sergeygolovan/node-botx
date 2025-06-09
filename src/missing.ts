const Undefined = Symbol("Undefined");
type UndefinedType = typeof Undefined;

export { Undefined };
export type { UndefinedType };

export type Missing<T> = T | UndefinedType;
export type MissingOptional<T> = T | null | UndefinedType;