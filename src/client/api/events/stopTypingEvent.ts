import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";

export interface BotXAPIStopTypingEventRequestPayload {
  group_chat_id: string;
}

export class BotXAPIStopTypingEventResponsePayload {
  status: "ok";

  constructor(data: any) {
    this.status = data.status;
  }
}

export class StopTypingEventMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPIStopTypingEventRequestPayload): Promise<BotXAPIStopTypingEventResponsePayload> {
    const path = "/api/v3/botx/events/stop_typing";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload }
    );

    return this.verifyAndExtractApiModel(BotXAPIStopTypingEventResponsePayload, response);
  }
} 