import { AuthorizedBotXMethod } from "../../authorizedBotxMethod";
import { HttpClient } from "../../httpClient";
import { BotAccountsStorage } from "../../../bot/botAccountsStorage";

// Константы
const SMARTAPP_API_VERSION = 1;

export interface BotXAPISmartAppNotificationRequestPayload {
  group_chat_id: string;
  smartapp_counter: number;
  body?: string;
  opts?: Record<string, any>;
  meta?: Record<string, any>;
  smartapp_api_version: number;
}

export interface BotXAPISmartAppNotificationResponsePayload {
  status: "ok";
}

export class SmartAppNotificationMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPISmartAppNotificationRequestPayload): Promise<void> {
    const path = "/api/v3/botx/smartapps/notification";

    // Подготавливаем JSON для отправки
    const json = { ...payload };
    json.opts = json.opts || {};

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json }
    );

    const responseData = await response.json();
    // Проверяем, что статус "ok"
    if (responseData.status !== "ok") {
      throw new Error(`Unexpected response status: ${responseData.status}`);
    }
  }
} 