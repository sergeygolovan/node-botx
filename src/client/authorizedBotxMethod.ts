import { BotXMethod, responseExceptionThrower } from "./botxMethod";
import { BotAccountsStorage } from "@bot";
import { CallbackManager } from "@bot";
import { getToken } from "./getToken";
import { HttpClient, HttpResponse } from "./httpClient";
import { InvalidBotAccountError } from "./exceptions/common";

export class AuthorizedBotXMethod extends BotXMethod {
  statusHandlers = { 
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

  protected async botxMethodCall(method: string, url: string, config?: any): Promise<HttpResponse> {
    const headers = config?.headers || {};
    await this.addAuthorizationHeaders(headers);

    return super.botxMethodCall(method, url, config);
  }

  // Метод для потоковых запросов (как в Python оригинале)
  protected async botxMethodStream(method: string, url: string, config?: any): Promise<HttpResponse<ReadableStream<Uint8Array>>> {
    const headers = config?.headers || {};
    await this.addAuthorizationHeaders(headers);

    if (method === 'GET') {
      return this.httpClient.getStream(url, {
        ...config,
        headers
      });
    }
    
    throw new Error(`Stream requests are only supported for GET method, got: ${method}`);
  }

  private async addAuthorizationHeaders(headers: Record<string, any>): Promise<void> {
    let token = this.botAccountsStorage.getTokenOrNone(this.senderBotId);
    
    if (!token) {
      // TODO: Реализовать getToken
      token = await this.getToken(this.senderBotId);
      this.botAccountsStorage.setToken(this.senderBotId, token);
    }

    headers.Authorization = `Bearer ${token}`;
  }

  private async getToken(botId: string): Promise<string> {
    return getToken(botId, this.httpClient, this.botAccountsStorage);
  }
} 