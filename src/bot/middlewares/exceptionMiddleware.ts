import { IncomingMessage } from "../../models";
import { Bot } from "../bot";
import { IncomingMessageHandlerFunc } from "../handler";
import { defaultLogger } from "../../logger";

export type ExceptionHandler = (message: IncomingMessage, bot: Bot, error: Error) => Promise<void>;
export type ExceptionHandlersDict = Map<Function, ExceptionHandler>;

export class ExceptionMiddleware {
  private exceptionHandlers: ExceptionHandlersDict;

  constructor(exceptionHandlers: ExceptionHandlersDict) {
    this.exceptionHandlers = exceptionHandlers;
  }

  async dispatch(
    message: IncomingMessage,
    bot: Bot,
    callNext: IncomingMessageHandlerFunc
  ): Promise<void> {
    try {
      await callNext(message, bot);
    } catch (messageHandlerExc) {
      const exceptionHandler = this.getExceptionHandler(messageHandlerExc as Error);
      if (exceptionHandler === undefined) {
        throw messageHandlerExc;
      }

      try {
        await exceptionHandler(message, bot, messageHandlerExc as Error);
      } catch (errorHandlerExc) {
        const excName = (messageHandlerExc as Error)?.constructor?.name || "UnknownError";
        defaultLogger.error(
          `Uncaught exception ${excName} in exception handler:`,
          errorHandlerExc as Error
        );
      }
    }
  }

  private getExceptionHandler(exc: Error): ExceptionHandler | undefined {
    // Имитируем Python's type(exc).mro() - получаем цепочку прототипов
    const prototypeChain: Function[] = [];
    let currentProto = Object.getPrototypeOf(exc);
    
    while (currentProto && currentProto.constructor !== Object) {
      prototypeChain.push(currentProto.constructor);
      currentProto = Object.getPrototypeOf(currentProto);
    }
    
    // Добавляем сам класс исключения в начало
    prototypeChain.unshift(exc.constructor);
    
    // Ищем обработчик в порядке наследования (как Python's mro)
    for (const excClass of prototypeChain) {
      const handler = this.exceptionHandlers.get(excClass);
      if (handler) {
        return handler;
      }
    }

    return undefined;
  }
}

 