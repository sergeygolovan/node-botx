import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { Missing } from "@missing";

export class BotXAPISmartAppCustomNotificationNestedPayload extends UnverifiedPayloadBaseModel {
  title!: string;
  body!: string;
}

export class BotXAPISmartAppCustomNotificationRequestPayload extends UnverifiedPayloadBaseModel {
  group_chat_id!: string;
  payload!: BotXAPISmartAppCustomNotificationNestedPayload;
  meta!: Missing<Record<string, any>>;

  static fromDomain(
    group_chat_id: string,
    title: string,
    body: string,
    meta: Missing<Record<string, any>>
  ): BotXAPISmartAppCustomNotificationRequestPayload {
    return new BotXAPISmartAppCustomNotificationRequestPayload({
      group_chat_id,
      payload: new BotXAPISmartAppCustomNotificationNestedPayload({
        title,
        body,
      }),
      meta,
    });
  }
}

export class BotXAPISyncIdResult extends VerifiedPayloadBaseModel {
  sync_id!: string;
}

export class BotXAPISmartAppCustomNotificationResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: BotXAPISyncIdResult;

  toDomain(): string {
    return this.result.sync_id;
  }
}

export class SmartAppCustomNotificationMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(
    payload: BotXAPISmartAppCustomNotificationRequestPayload,
    wait_callback: boolean,
    callback_timeout?: number,
    default_callback_timeout: number = 30
  ): Promise<BotXAPISmartAppCustomNotificationResponsePayload> {
    const path = "/api/v4/botx/smartapps/notification";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      {
        headers: { "Content-Type": "application/json" },
        data: payload.jsonableDict()
      }
    );

    const api_model = await this.verifyAndExtractApiModel(
      BotXAPISmartAppCustomNotificationResponsePayload,
      response
    );

    await this.processCallback(
      api_model.result.sync_id,
      wait_callback,
      callback_timeout || null,
      default_callback_timeout
    );

    return api_model;
  }
} 