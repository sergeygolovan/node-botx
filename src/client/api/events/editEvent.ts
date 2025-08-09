import { BotAccountsStorage } from "@bot";
import { AuthorizedBotXMethod, HttpClient } from "@client";
import { Missing, Undefined } from "@missing";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { BotXAPIAttachment } from "@models/attachments";
import { apiMarkupFromDomain } from "@models/message/markup";
import { findAndReplaceEmbedMentions } from "@models/message/mentions";

export class BotXAPIEditEventPayloadOpts extends UnverifiedPayloadBaseModel {
  buttons_auto_adjust!: Missing<boolean>;
}

export class BotXAPIEditEventOpts extends UnverifiedPayloadBaseModel {
  raw_mentions!: Missing<boolean>;
}

export class BotXAPIEditEvent extends UnverifiedPayloadBaseModel {
  body!: Missing<string>;
  metadata!: Missing<Record<string, any>>;
  opts!: Missing<BotXAPIEditEventPayloadOpts>;
  bubble!: Missing<any>; // BotXAPIMarkup
  keyboard!: Missing<any>; // BotXAPIMarkup
  mentions!: Missing<any[]>; // BotXAPIMention[]
}

export class BotXAPIEditEventRequestPayload extends UnverifiedPayloadBaseModel {
  sync_id!: string;
  payload!: BotXAPIEditEvent;
  file!: Missing<any>; // BotXAPIAttachment
  opts!: Missing<BotXAPIEditEventOpts>;

  static fromDomain(
    syncId: string,
    body: Missing<string>,
    metadata: Missing<Record<string, any>>,
    bubbles: Missing<any>,
    keyboard: Missing<any>,
    file: Missing<any>,
    markupAutoAdjust: Missing<boolean>,
  ): BotXAPIEditEventRequestPayload {
    // TODO: Metadata can be cleaned with `{}`

    let apiFile: Missing<any> = Undefined;
    if (file) {
      apiFile = BotXAPIAttachment.fromFileAttachment(file);
    } else if (file === null) {
      apiFile = null;
    }

    let mentions: Missing<any[]> = Undefined;
    if (typeof body === 'string') {
      const result = findAndReplaceEmbedMentions(body);
      body = result.body;
      mentions = result.mentions;
    }

    const payload = new BotXAPIEditEventRequestPayload();
    payload.sync_id = syncId;
    
    const eventPayload = new BotXAPIEditEvent();
    eventPayload.body = body;
    eventPayload.metadata = metadata;
    
    const payloadOpts = new BotXAPIEditEventPayloadOpts();
    payloadOpts.buttons_auto_adjust = markupAutoAdjust;
    eventPayload.opts = payloadOpts;
    
    eventPayload.bubble = bubbles ? apiMarkupFromDomain(bubbles) : bubbles;
    eventPayload.keyboard = keyboard ? apiMarkupFromDomain(keyboard) : keyboard;
    eventPayload.mentions = mentions;
    
    payload.payload = eventPayload;
    payload.file = apiFile;
    
    const opts = new BotXAPIEditEventOpts();
    opts.raw_mentions = mentions ? true : Undefined;
    payload.opts = opts;
    
    return payload;
  }
}

export class BotXAPIEditEventResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
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
      { data: payload.jsonableDict() }
    );

    this.verifyAndExtractApiModel(BotXAPIEditEventResponsePayload, response);
  }
} 