import { IsBoolean, IsOptional, ValidateNested, IsArray } from "class-validator";
import { Type } from "class-transformer";
import { File } from "@models";
import { RPCError } from "./errors";

// Типы для результатов (аналогично Python версии)
export type JsonableResultType = 
  | number 
  | string 
  | boolean 
  | Array<any> 
  | Record<string, any>;

export type ResultType = 
  | (new (...args: any[]) => any)  // Класс/конструктор (аналог BaseModel)
  | JsonableResultType;             // Примитивы и контейнеры

export class RPCResultResponse<T extends ResultType = ResultType> {
  result: T;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => File)
  files: File[] = [];

  @IsOptional()
  @IsBoolean()
  encrypted: boolean = true;

  constructor(result: T, files: File[] = [], encrypted: boolean = true) {
    this.result = result;
    this.files = files;
    this.encrypted = encrypted;
  }

  jsonableDict(): Record<string, any> {
    return {
      status: "ok",
      type: "smartapp_rpc",
      result: this.jsonableResult(),
    };
  }

  jsonableResult(): JsonableResultType {
    // Если результат - это класс с методом toJSON или plain object
    if (typeof this.result === 'object' && this.result !== null) {
      return JSON.parse(JSON.stringify(this.result)) as JsonableResultType;
    }
    return this.result as JsonableResultType;
  }
}

export class RPCErrorResponse {
  @ValidateNested({ each: true })
  @Type(() => RPCError)
  errors: RPCError[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => File)
  files: File[] = [];

  @IsOptional()
  @IsBoolean()
  encrypted: boolean = true;

  constructor(errors: RPCError[], files: File[] = [], encrypted: boolean = true) {
    this.errors = errors;
    this.files = files;
    this.encrypted = encrypted;
  }

  jsonableDict(): Record<string, any> {
    return {
      status: "error",
      type: "smartapp_rpc",
      errors: this.jsonableErrors(),
    };
  }

  jsonableErrors(): Record<string, any>[] {
    return this.errors.map(error => ({
      reason: error.reason,
      id: error.id,
      meta: error.meta || {}
    }));
  }
}

// Утилиты для создания стандартных ошибок
export function buildInvalidRPCRequestErrorResponse(
  validationErrors: Array<{ msg: string; type: string; loc: string[] }>
): RPCErrorResponse {
  return new RPCErrorResponse(
    validationErrors.map(error => new RPCError(
      `Invalid RPC request: ${error.msg}`,
      error.type.split(".")[0].toUpperCase(),
      { field: error.loc[0] }
    ))
  );
}

export function buildInvalidRPCArgsErrorResponse(
  validationErrors: Array<{ msg: string; type: string; loc: string[] }>
): RPCErrorResponse {
  return new RPCErrorResponse(
    validationErrors.map(error => new RPCError(
      error.msg,
      error.type.split(".")[0].toUpperCase(),
      { location: error.loc }
    ))
  );
}

export function buildMethodNotFoundErrorResponse(method: string): RPCErrorResponse {
  return new RPCErrorResponse([
    new RPCError(
      "Method not found",
      "METHOD_NOT_FOUND",
      { method }
    )
  ]);
} 