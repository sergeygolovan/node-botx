import { IsString, IsOptional, IsObject } from "class-validator";

// RPCArgsBaseModel - базовый класс для аргументов RPC методов
export abstract class RPCArgsBaseModel {
  constructor(data?: Record<string, any>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

// RPCRequest - структура RPC запроса
export class RPCRequest {
  @IsString()
  method: string;

  @IsString()
  type: "smartapp_rpc";

  @IsOptional()
  @IsObject()
  params?: Record<string, any>;

  constructor(method: string, type: "smartapp_rpc" = "smartapp_rpc", params?: Record<string, any>) {
    this.method = method;
    this.type = type;
    this.params = params;
  }
} 