import { AuthorizedBotXMethod } from "../../authorizedBotxMethod";
import { HttpClient } from "../../httpClient";
import { BotAccountsStorage } from "../../../bot/botAccountsStorage";

export interface BotXAPISmartAppUnreadCounterRequestPayload {
  groupChatId: string;
  counter: number;
}

export interface BotXAPISyncIdResult {
  syncId: string;
}

export interface BotXAPISmartAppUnreadCounterResponsePayload {
  status: "ok";
  result: BotXAPISyncIdResult;
  toDomain(): string;
}

export class SmartAppUnreadCounterMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(
    payload: BotXAPISmartAppUnreadCounterRequestPayload,
    waitCallback: boolean,
    callbackTimeout?: number,
    defaultCallbackTimeout: number = 30
  ): Promise<BotXAPISmartAppUnreadCounterResponsePayload> {
    const path = "/api/v4/botx/smartapps/unread_counter";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload }
    );

    const responseData = await response.json();
    const result: BotXAPISmartAppUnreadCounterResponsePayload = {
      status: responseData.status,
      result: responseData.result,
      toDomain() {
        return this.result.syncId;
      }
    };

    // Обработка callback (упрощенная версия)
    if (waitCallback) {
      await this.processCallback(
        result.result.syncId,
        waitCallback,
        callbackTimeout || null,
        defaultCallbackTimeout
      );
    }

    return result;
  }
} 