import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";

export interface BotXAPITypingEventRequestPayload {
  group_chat_id: string;
}

export class BotXAPITypingEventResponsePayload {
  status: "ok";

  constructor(data: any) {
    this.status = data.status;
  }
}

export class TypingEventMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPITypingEventRequestPayload): Promise<BotXAPITypingEventResponsePayload> {
    const path = "/api/v3/botx/events/typing";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload }
    );

    return this.verifyAndExtractApiModel(BotXAPITypingEventResponsePayload, response);
  }
} 