import { IsString, IsOptional, IsObject } from "class-validator";

export class RPCError {
  @IsString()
  reason: string;

  @IsString()
  id: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;

  constructor(reason: string, id: string, meta?: Record<string, any>) {
    this.reason = reason;
    this.id = id;
    this.meta = meta;
  }
} 