import { AuthorizedBotXMethod } from "../../authorizedBotxMethod";
import { HttpClient } from "../../httpClient";
import { BotAccountsStorage } from "../../../bot/botAccountsStorage";

export interface BotXAPISmartAppCustomNotificationNestedPayload {
  title: string;
  body: string;
}

export interface BotXAPISmartAppCustomNotificationRequestPayload {
  group_chat_id: string;
  payload: BotXAPISmartAppCustomNotificationNestedPayload;
  meta?: Record<string, any>;
}

export interface BotXAPISyncIdResult {
  sync_id: string;
}

export interface BotXAPISmartAppCustomNotificationResponsePayload {
  status: "ok";
  result: BotXAPISyncIdResult;
  toDomain(): string;
}

export class SmartAppCustomNotificationMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(
    payload: BotXAPISmartAppCustomNotificationRequestPayload,
    waitCallback: boolean,
    callbackTimeout?: number,
    defaultCallbackTimeout: number = 30
  ): Promise<BotXAPISmartAppCustomNotificationResponsePayload> {
    const path = "/api/v4/botx/smartapps/notification";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload }
    );

    const responseData = await response.json();
    const result: BotXAPISmartAppCustomNotificationResponsePayload = {
      status: responseData.status,
      result: responseData.result,
      toDomain() {
        return this.result.sync_id;
      }
    };

    // Обработка callback (упрощенная версия)
    if (waitCallback) {
      await this.processCallback(
        result.result.sync_id,
        waitCallback,
        callbackTimeout || null,
        defaultCallbackTimeout
      );
    }

    return result;
  }
} 