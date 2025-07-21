import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { Missing } from "@missing";

// Константы
const SMARTAPP_API_VERSION = 1;

export class BotXAPISmartAppNotificationRequestPayload extends UnverifiedPayloadBaseModel {
  group_chat_id!: string;
  smartapp_counter!: number;
  body!: Missing<string>;
  opts!: Missing<Record<string, any>>;
  meta!: Missing<Record<string, any>>;
  smartapp_api_version!: number;

  static fromDomain(
    chat_id: string,
    smartapp_counter: number,
    body: Missing<string>,
    opts: Missing<Record<string, any>>,
    meta: Missing<Record<string, any>>
  ): BotXAPISmartAppNotificationRequestPayload {
    return new BotXAPISmartAppNotificationRequestPayload({
      group_chat_id: chat_id,
      smartapp_counter,
      body,
      opts,
      meta,
      smartapp_api_version: SMARTAPP_API_VERSION,
    });
  }
}

export class BotXAPISmartAppNotificationResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
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

    // TODO: Remove opts
    // UnverifiedPayloadBaseModel.jsonableDict remove empty dicts
    const json = payload.jsonableDict();
    json.opts = json.opts || {};

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      {
        headers: { "Content-Type": "application/json" },
        data: json
      }
    );

    this.verifyAndExtractApiModel(
      BotXAPISmartAppNotificationResponsePayload,
      response
    );
  }
} 