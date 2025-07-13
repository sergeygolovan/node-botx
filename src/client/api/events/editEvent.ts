import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";

export interface BotXAPIEditEventPayloadOpts {
  buttonsAutoAdjust?: boolean;
}

export interface BotXAPIEditEventOpts {
  rawMentions?: boolean;
}

export interface BotXAPIEditEvent {
  body?: string;
  metadata?: Record<string, any>;
  opts?: BotXAPIEditEventPayloadOpts;
  bubble?: any; // BotXAPIMarkup
  keyboard?: any; // BotXAPIMarkup
  mentions?: any[]; // BotXAPIMention[]
}

export interface BotXAPIEditEventRequestPayload {
  syncId: string;
  payload: BotXAPIEditEvent;
  file?: any; // BotXAPIAttachment
  opts?: BotXAPIEditEventOpts;
}

export interface BotXAPIEditEventResponsePayload {
  status: "ok";
}

export class EditEventMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPIEditEventRequestPayload): Promise<void> {
    const path = "/api/v3/botx/events/edit_event";

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