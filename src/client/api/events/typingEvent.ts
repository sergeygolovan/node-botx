import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";

export interface BotXAPITypingEventRequestPayload {
  groupChatId: string;
}

export interface BotXAPITypingEventResponsePayload {
  status: "ok";
}

export class TypingEventMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPITypingEventRequestPayload): Promise<void> {
    const path = "/api/v3/botx/events/typing";

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