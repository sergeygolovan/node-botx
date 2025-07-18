import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { Missing, Undefined } from "@missing";
import { findAndReplaceEmbedMentions } from "@models/message/mentions";
import { apiMarkupFromDomain } from "@models/message/markup";
import { BotXAPIAttachment } from "@models/attachments";

export class BotXAPIReplyEventMessageOpts extends UnverifiedPayloadBaseModel {
  silent_response!: Missing<boolean>;
  buttons_auto_adjust!: Missing<boolean>;
}

export class BotXAPIReplyEvent extends UnverifiedPayloadBaseModel {
  status!: "ok";
  body!: string;
  metadata!: Missing<Record<string, any>>;
  opts!: Missing<BotXAPIReplyEventMessageOpts>;
  bubble!: Missing<any>; // BotXAPIMarkup
  keyboard!: Missing<any>; // BotXAPIMarkup
  mentions!: Missing<any[]>; // BotXAPIMention[]
}

export class BotXAPIReplyEventNestedOpts extends UnverifiedPayloadBaseModel {
  send!: Missing<boolean>;
  force_dnd!: Missing<boolean>;
}

export class BotXAPIReplyEventOpts extends UnverifiedPayloadBaseModel {
  raw_mentions!: true;
  stealth_mode!: Missing<boolean>;
  notification_opts!: Missing<BotXAPIReplyEventNestedOpts>;
}

export class BotXAPIReplyEventRequestPayload extends UnverifiedPayloadBaseModel {
  source_sync_id!: string;
  reply!: BotXAPIReplyEvent;
  file!: Missing<any>; // BotXAPIAttachment
  opts!: BotXAPIReplyEventOpts;

  static fromDomain(
    syncId: string,
    body: string,
    metadata: Missing<Record<string, any>>,
    bubbles: Missing<any>,
    keyboard: Missing<any>,
    file: Missing<any>,
    silentResponse: Missing<boolean>,
    markupAutoAdjust: Missing<boolean>,
    stealthMode: Missing<boolean>,
    sendPush: Missing<boolean>,
    ignoreMute: Missing<boolean>,
  ): BotXAPIReplyEventRequestPayload {
    let apiFile: Missing<any> = Undefined;
    if (file) {
      apiFile = BotXAPIAttachment.fromFileAttachment(file);
    }

    const result = findAndReplaceEmbedMentions(body);
    const newBody = result.body;
    const mentions = result.mentions;

    const payload = new BotXAPIReplyEventRequestPayload();
    payload.source_sync_id = syncId;
    
    const reply = new BotXAPIReplyEvent();
    reply.status = "ok";
    reply.body = newBody;
    reply.metadata = metadata;
    
    const replyOpts = new BotXAPIReplyEventMessageOpts();
    replyOpts.buttons_auto_adjust = markupAutoAdjust;
    replyOpts.silent_response = silentResponse;
    reply.opts = replyOpts;
    
    reply.bubble = bubbles ? apiMarkupFromDomain(bubbles) : bubbles;
    reply.keyboard = keyboard ? apiMarkupFromDomain(keyboard) : keyboard;
    reply.mentions = mentions.length > 0 ? mentions : Undefined;
    
    payload.reply = reply;
    payload.file = apiFile;
    
    const opts = new BotXAPIReplyEventOpts();
    opts.raw_mentions = true;
    opts.stealth_mode = stealthMode;
    
    const notificationOpts = new BotXAPIReplyEventNestedOpts();
    notificationOpts.send = sendPush;
    notificationOpts.force_dnd = ignoreMute;
    opts.notification_opts = notificationOpts;
    
    payload.opts = opts;
    
    return payload;
  }
}

export class BotXAPIReplyEventResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
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
      { json: payload.jsonableDict() }
    );

    this.verifyAndExtractApiModel(BotXAPIReplyEventResponsePayload, response);
  }
} 