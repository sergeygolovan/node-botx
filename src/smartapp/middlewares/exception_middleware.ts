import { SmartAppInstance } from "../smartapp";
import { RPCArgsBaseModel } from "../models/request";
import { RPCResponse, HandlerWithArgs, ExceptionHandler, ExceptionHandlerDict } from "../typing";
import { defaultExceptionHandler } from "../exception_handlers";

export class ExceptionMiddleware {
  private exceptionHandlers: ExceptionHandlerDict;

  constructor(exceptionHandlers?: ExceptionHandlerDict) {
    this.exceptionHandlers = exceptionHandlers || new Map();
  }

  async execute(
    smartapp: SmartAppInstance,
    rpcArguments: RPCArgsBaseModel,
    callNext: HandlerWithArgs
  ): Promise<RPCResponse> {
    try {
      const rpcResult = await callNext(smartapp, rpcArguments);
      return rpcResult;
    } catch (exc: unknown) {
      const exceptionHandler = this.getExceptionHandler(exc as Error);
      try {
        return await exceptionHandler(exc as Error, smartapp);
      } catch (errorHandlerExc: unknown) {
        return await defaultExceptionHandler(errorHandlerExc as Error, smartapp);
      }
    }
  }

  private getExceptionHandler(exc: Error): ExceptionHandler {
    // Ищем обработчик для класса исключения и его родителей
    let currentClass = exc.constructor as new (...args: any[]) => Error;
    
    while (currentClass) {
      const handler = this.exceptionHandlers.get(currentClass);
      if (handler) {
        return handler;
      }
      
      // В TypeScript нет прямого аналога mro(), поэтому используем прототип
      const prototype = Object.getPrototypeOf(currentClass);
      if (prototype === Function.prototype || prototype === null) {
        break;
      }
      currentClass = prototype as new (...args: any[]) => Error;
    }

    // Если не нашли обработчик, возвращаем обработчик по умолчанию
    return defaultExceptionHandler;
  }
} 