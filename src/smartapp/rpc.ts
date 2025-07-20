import { Bot } from "@bot";
import { SmartAppEvent, BotAPISyncSmartAppEventResponse, BotAPISyncSmartAppEventErrorResponse, BotAPISyncSmartAppEventResultResponse } from "@models";
import { RPCRouter } from "./router";
import { SmartAppInstance } from "./smartapp";
import { RPCRequest } from "./models/request";
import { RPCResponse, Middleware, ExceptionHandlerDict, ExceptionHandler } from "./typing";
import { ExceptionMiddleware } from "./middlewares/exception_middleware";
import { defaultExceptionHandler, rpcExceptionHandler } from "./exception_handlers";
import { RPCErrorExc } from "./exceptions";
import { buildInvalidRPCRequestErrorResponse } from "./models/responses";
import { RPCError } from "./models/errors";
import { Undefined } from "@missing";
import { validate } from "class-validator";

export class SmartAppRPC {
  private middlewares: Middleware[] = [];
  private _router: RPCRouter;

  constructor(
    routers: RPCRouter[],
    middlewares?: Middleware[],
    exceptionHandlers?: ExceptionHandlerDict,
    errors?: (new (...args: any[]) => RPCError)[]
  ) {
    this.middlewares = middlewares || [];
    this.insertExceptionMiddleware(exceptionHandlers || new Map());
    this._router = this.mergeRouters(routers, errors || []);
  }

  async handleSmartappEvent(event: SmartAppEvent, bot: Bot): Promise<void> {
    let rpcResponse: RPCResponse;

    try {
      // Создаем RPC запрос с валидацией (как в Python)
      const rpcRequest = new RPCRequest(
        event.data.method || "",
        "smartapp_rpc",
        event.data.params || {}
      );

      // Валидируем RPC запрос (как в Python с Pydantic)
      const validationErrors = await validate(rpcRequest);
      if (validationErrors.length > 0) {
        // Преобразуем ошибки валидации в формат, совместимый с buildInvalidRPCRequestErrorResponse
        const errorDetails = validationErrors.map(error => ({
          msg: Object.values(error.constraints || {}).join(', '),
          type: "validation_error",
          loc: [error.property]
        }));
        rpcResponse = buildInvalidRPCRequestErrorResponse(errorDetails);
      } else {
        // Выполняем RPC запрос
        rpcResponse = await this._router.performRPCRequest(
          new SmartAppInstance(bot, event.bot.id, event.chat.id, event),
          rpcRequest
        );
      }
    } catch (invalidRcpRequestExc) {
      // Обрабатываем другие ошибки валидации (как в Python)
      rpcResponse = buildInvalidRPCRequestErrorResponse([{
        msg: "Invalid RPC request",
        type: "validation_error",
        loc: []
      }]);
    }

    await bot.sendSmartappEvent({
      botId: event.bot.id,
      chatId: event.chat.id,
      data: rpcResponse.jsonableDict(),
      encrypted: rpcResponse.encrypted,
      ref: event.ref || undefined,
      files: rpcResponse.files || [],
      opts: Undefined,
    });
  }

  async handleSyncSmartappEvent(
    event: SmartAppEvent,
    bot: Bot
  ): Promise<BotAPISyncSmartAppEventResponse> {
    let rpcResponse: RPCResponse;

    try {
      const rpcRequest = new RPCRequest(
        event.data.method || "",
        "smartapp_rpc",
        event.data.params || {}
      );

      const validationErrors = await validate(rpcRequest);
      if (validationErrors.length > 0) {
        // Преобразуем ошибки валидации в формат, совместимый с buildInvalidRPCRequestErrorResponse
        const errorDetails = validationErrors.map(error => ({
          msg: Object.values(error.constraints || {}).join(', '),
          type: "validation_error",
          loc: [error.property]
        }));
        rpcResponse = buildInvalidRPCRequestErrorResponse(errorDetails);
      } else {
        // Выполняем RPC запрос
        rpcResponse = await this._router.performRPCRequest(
          new SmartAppInstance(bot, event.bot.id, event.chat.id, event),
          rpcRequest
        );
      }
    } catch (invalidRcpRequestExc) {
      rpcResponse = buildInvalidRPCRequestErrorResponse([{
        msg: "Invalid RPC request",
        type: "validation_error",
        loc: []
      }]);
    }

    if ('errors' in rpcResponse) {
      // RPCErrorResponse -> BotAPISyncSmartAppEventErrorResponse
      const errors = rpcResponse.jsonableErrors();
      return BotAPISyncSmartAppEventErrorResponse.fromDomain(
        undefined,
        Array.isArray(errors) ? errors : [errors]
      );
    }

    // RPCResultResponse -> BotAPISyncSmartAppEventResultResponse
    const result = rpcResponse.jsonableResult();
    const data = typeof result === 'object' && result !== null ? result as Record<string, unknown> : { result };
    return BotAPISyncSmartAppEventResultResponse.fromDomain(
      data,
      rpcResponse.files
    );
  }

  get router(): RPCRouter {
    return this._router;
  }

  private insertExceptionMiddleware(userExceptionHandlers: ExceptionHandlerDict): void {
    const exceptionHandlers = new Map<any, any>([
      [Error, defaultExceptionHandler],
      [RPCErrorExc, rpcExceptionHandler]
    ]) as ExceptionHandlerDict;

    // Добавляем пользовательские обработчики
    for (const [key, value] of userExceptionHandlers) {
      exceptionHandlers.set(key, value);
    }

    const excMiddleware = new ExceptionMiddleware(exceptionHandlers);
    this.middlewares.unshift(excMiddleware.execute.bind(excMiddleware));
  }

  private mergeRouters(routers: RPCRouter[], errors: (new (...args: any[]) => RPCError)[]): RPCRouter {
    const mainRouter = new RPCRouter(this.middlewares, [], true, errors);
    mainRouter.include(...routers);
    return mainRouter;
  }
} 