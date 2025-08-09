import { BotXMethod, responseExceptionThrower, StatusHandlers } from "./botxMethod";
import { BotAccountsStorage } from "@bot";
import { CallbackManager } from "@bot";
import { getToken } from "./getToken";
import { HttpClient, HttpResponse } from "./httpClient";
import { InvalidBotAccountError } from "./exceptions/common";
import type { AxiosRequestConfig } from "axios";

export class AuthorizedBotXMethod extends BotXMethod {
  statusHandlers: StatusHandlers = {
    401: responseExceptionThrower(InvalidBotAccountError)
  };
  errorCallbackHandlers: Record<string, any> = {};

  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage,
    callbacksManager?: CallbackManager
  ) {
    super(senderBotId, httpClient, botAccountsStorage, callbacksManager);
  }

  protected async botxMethodCall(method: string, url: string, config?: Partial<AxiosRequestConfig>): Promise<HttpResponse> {
    const headers = config?.headers || {};
    await this.addAuthorizationHeaders();

    return super.botxMethodCall(method, url, config);
  }

  // Метод для потоковых запросов (как в Python оригинале)
  protected async botxMethodStream(method: string, url: string, config?: Partial<AxiosRequestConfig>): Promise<HttpResponse<ReadableStream<Uint8Array>>> {
    await this.addAuthorizationHeaders();

    if (method === 'GET') {
      return this.httpClient.getStream(url, {
        ...config,
      });
    }
    
    throw new Error(`Stream requests are only supported for GET method, got: ${method}`);
  }

  private async addAuthorizationHeaders(): Promise<void> {
    let token = this.botAccountsStorage.getTokenOrNone(this.senderBotId);
    
    if (!token) {
      token = await this.getToken(this.senderBotId);
      this.botAccountsStorage.setToken(this.senderBotId, token);
    }
    this.httpClient.addAuthorizationHeaders(token);
  }

  private async getToken(botId: string): Promise<string> {
    return getToken(botId, this.httpClient, this.botAccountsStorage);
  }
} 