import "reflect-metadata";
import { RPCRouter } from "./router";
import { Handler, Middleware } from "./typing";
import { ResultType } from "./models/responses";
import { RPCError } from "./models/errors";

// Метаданные ключи для Reflect
const RPC_METHOD_METADATA_KEY = Symbol("rpc:method");
const RPC_METHOD_NAME_KEY = Symbol("rpc:method:name");
const RPC_METHOD_OPTIONS_KEY = Symbol("rpc:method:options");

// Интерфейс для опций RPC метода
export interface RPCMethodOptions {
  middlewares?: Middleware[];
  returnType?: ResultType;
  tags?: string[];
  errors?: (new (...args: any[]) => RPCError)[];
  includeInSchema?: boolean;
}

// Интерфейс для метаданных RPC метода
interface RPCMethodMetadata {
  name: string;
  options: RPCMethodOptions;
  handler: Handler;
}

// Декоратор для RPC методов
export function RpcMethod(
  methodName: string,
  options: RPCMethodOptions = {}
) {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    // Сохраняем метаданные метода
    const metadata: RPCMethodMetadata = {
      name: methodName,
      options,
      handler: originalMethod
    };
    
    // Сохраняем метаданные в классе
    const existingMethods = Reflect.getMetadata(RPC_METHOD_METADATA_KEY, target.constructor) || [];
    existingMethods.push(metadata);
    Reflect.defineMetadata(RPC_METHOD_METADATA_KEY, existingMethods, target.constructor);
    
    // Возвращаем оригинальный метод без изменений
    return descriptor;
  };
}

// Функция для регистрации всех RPC методов из класса в роутер
export function registerRpcMethods(router: RPCRouter, targetClass: any): void {
  const methods = Reflect.getMetadata(RPC_METHOD_METADATA_KEY, targetClass) || [];
  
  for (const methodMetadata of methods) {
    const { name, options, handler } = methodMetadata;
    
    // Регистрируем метод в роутере
    router.method(
      name,
      options.middlewares,
      options.returnType,
      options.tags,
      options.errors,
      options.includeInSchema
    )(handler);
  }
}

// Декоратор для класса, который автоматически регистрирует все RPC методы
export function RpcController(router: RPCRouter) {
  return function (target: any) {
    // Регистрируем методы при создании экземпляра класса
    const originalConstructor = target;
    
    const newConstructor = function (...args: any[]) {
      const instance = new originalConstructor(...args);
      
      // Регистрируем все RPC методы
      registerRpcMethods(router, target);
      
      return instance;
    };
    
    // Копируем прототип
    newConstructor.prototype = originalConstructor.prototype;
    
    return newConstructor as any;
  };
}

// Утилита для получения всех RPC методов из класса
export function getRpcMethods(targetClass: any): RPCMethodMetadata[] {
  return Reflect.getMetadata(RPC_METHOD_METADATA_KEY, targetClass) || [];
} 