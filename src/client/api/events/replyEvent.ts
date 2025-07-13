import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";

export interface BotXAPIReplyEventMessageOpts {
  silentResponse?: boolean;
  buttonsAutoAdjust?: boolean;
}

export interface BotXAPIReplyEvent {
  status: "ok";
  body: string;
  metadata?: Record<string, any>;
  opts?: BotXAPIReplyEventMessageOpts;
  bubble?: any; // BotXAPIMarkup
  keyboard?: any; // BotXAPIMarkup
  mentions?: any[]; // BotXAPIMention[]
}

export interface BotXAPIReplyEventNestedOpts {
  send?: boolean;
  forceDnd?: boolean;
}

export interface BotXAPIReplyEventOpts {
  rawMentions: true;
  stealthMode?: boolean;
  notificationOpts?: BotXAPIReplyEventNestedOpts;
}

export interface BotXAPIReplyEventRequestPayload {
  sourceSyncId: string;
  reply: BotXAPIReplyEvent;
  file?: any; // BotXAPIAttachment
  opts: BotXAPIReplyEventOpts;
}

export interface BotXAPIReplyEventResponsePayload {
  status: "ok";
}

export class ReplyEventMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPIReplyEventRequestPayload): Promise<void> {
    const path = "/api/v3/botx/events/reply_event";

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