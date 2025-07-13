import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";

export interface BotXAPIStopTypingEventRequestPayload {
  groupChatId: string;
}

export interface BotXAPIStopTypingEventResponsePayload {
  status: "ok";
}

export class StopTypingEventMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPIStopTypingEventRequestPayload): Promise<void> {
    const path = "/api/v3/botx/events/stop_typing";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload }
    );

    const responseData = await response.json();
    // Проверяем, что статус "ok"
    if (responseData.status !== "ok") {
      throw new Error(`Unexpected response status: ${responseData.status}`);
    }
  }
} 