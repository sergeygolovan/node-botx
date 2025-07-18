import { BotAccountsStorage } from "@bot";
import { CallbackManager } from "@bot";
import type { BotAPIMethodFailedCallback, BotXMethodCallback } from "@models";
import { HttpClient, HttpResponse } from "./httpClient";
import { ClientErrorConstructor } from "./exceptions/base";
import { logger } from "@logger";

// Типы для обработчиков ошибок
export type StatusHandler = (response: HttpResponse) => Promise<never>;
export type StatusHandlers = Record<number, StatusHandler>;
type CallbackExceptionHandler = (callback: BotAPIMethodFailedCallback) => never;
type ErrorCallbackHandlers = Record<string, CallbackExceptionHandler>;

export class BotXMethod {
  statusHandlers: StatusHandlers = {};
  errorCallbackHandlers: ErrorCallbackHandlers = {};

  constructor(
    protected senderBotId: string,
    protected httpClient: HttpClient,
    protected botAccountsStorage: BotAccountsStorage,
    protected callbacksManager?: CallbackManager
  ) {}

  // Метод execute должен быть переопределен в наследниках
  async execute(..._args: any[]): Promise<any> {
    throw new Error("You should define `execute` method");
  }

  protected buildUrl(path: string): string {
    const ctsUrl = this.botAccountsStorage.getCtsUrl(this.senderBotId);
    return [ctsUrl, path].map(part => part.replace(/^\/+|\/+$/g, '')).join('/');
  }

  protected async verifyAndExtractApiModel<T>(
    modelCls: new (data: any) => T,
    response: HttpResponse
  ): Promise<T> {
    try {
      const rawModel = await response.json();
      
      // TODO: Добавить логирование
      logger.debug("Got response from botx:", rawModel);
      
      // Если у модели есть Zod схема, используем её для валидации
      if ((modelCls as any).schema) {
        const schema = (modelCls as any).schema;
        const validatedData = schema.parse(rawModel);
        return new modelCls(validatedData);
      }
      
      // Иначе просто создаем экземпляр класса
      return new modelCls(rawModel);
    } catch (decodingExc) {
      throw new Error(`Invalid BotX response payload: ${decodingExc}`);
    }
  }

  protected async botxMethodCall(method: string, url: string, config?: any): Promise<HttpResponse> {
    this.logOutgoingRequest(method, url, config);

    const requestConfig = {
      method,
      url,
      ...config
    };
    
    const response = await this.httpClient.request(requestConfig);
    await this.raiseForStatus(response);

    return response;
  }

  protected async raiseForStatus(response: HttpResponse): Promise<void> {
    const handler = this.statusHandlers[response.status];
    if (handler) {
      await handler(response); // Handler should raise an exception
    }

    if (!response.ok) {
      throw new Error(`Invalid BotX status code: ${response.status}`);
    }
  }

  protected async processCallback(
    syncId: string,
    waitCallback: boolean,
    callbackTimeout: number | null,
    defaultCallbackTimeout: number
  ): Promise<BotXMethodCallback | null> {
    if (!this.callbacksManager) {
      throw new Error("CallbackManager hasn't been passed to this method");
    }

    await this.callbacksManager.createBotxMethodCallback(syncId);

    if (callbackTimeout === null) {
      callbackTimeout = defaultCallbackTimeout;
    }

    if (!waitCallback) {
      this.callbacksManager.setupCallbackTimeoutAlarm(syncId, callbackTimeout);
      return null;
    }

    const callback = await this.callbacksManager.waitBotxMethodCallback(syncId, callbackTimeout);

    if (callback.status === "error") {
      const errorHandler = this.errorCallbackHandlers[callback.reason];
      if (!errorHandler) {
        throw new Error(`BotX method failed callback received: ${callback.reason}`);
      }

      errorHandler(callback); // Handler should raise an exception
    }

    return callback;
  }

  private logOutgoingRequest(...args: any[]): void {
    const [method, url] = args;
    const queryParams = args.find(arg => typeof arg === 'object' && arg.params)?.params;
    const jsonBody = args.find(arg => typeof arg === 'object' && arg.json)?.json;

    let logTemplate = `Performing request to BotX:\n${method} ${url}`;
    if (queryParams) {
      logTemplate += `\nquery: ${JSON.stringify(queryParams)}`;
    }
    if (jsonBody !== undefined) {
      logTemplate += `\nbody: ${JSON.stringify(jsonBody)}`;
    }

    console.debug(logTemplate);
  }
}

// Функция для создания обработчика исключений
export function responseExceptionThrower(
  exc: ClientErrorConstructor,
  comment?: string
): StatusHandler {
  return async (response: HttpResponse) => {
    throw exc.fromResponse(response, comment);
  };
}

// Функция для создания обработчика callback исключений
export function callbackExceptionThrower(
  exc: ClientErrorConstructor,
  comment?: string
): CallbackExceptionHandler {
  return (callback: BotAPIMethodFailedCallback) => {
    throw exc.fromCallback(callback, comment);
  };
} 