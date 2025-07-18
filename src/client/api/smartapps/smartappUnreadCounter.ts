import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";

export class BotXAPISmartAppUnreadCounterRequestPayload extends UnverifiedPayloadBaseModel {
  group_chat_id!: string;
  counter!: number;

  static fromDomain(
    group_chat_id: string,
    counter: number
  ): BotXAPISmartAppUnreadCounterRequestPayload {
    return new BotXAPISmartAppUnreadCounterRequestPayload({
      group_chat_id,
      counter,
    });
  }
}

export class BotXAPISyncIdResult extends VerifiedPayloadBaseModel {
  sync_id!: string;
}

export class BotXAPISmartAppUnreadCounterResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: BotXAPISyncIdResult;

  toDomain(): string {
    return this.result.sync_id;
  }
}

export class SmartAppUnreadCounterMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(
    payload: BotXAPISmartAppUnreadCounterRequestPayload,
    wait_callback: boolean,
    callback_timeout?: number,
    default_callback_timeout: number = 30
  ): Promise<BotXAPISmartAppUnreadCounterResponsePayload> {
    const path = "/api/v4/botx/smartapps/unread_counter";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload.jsonableDict() }
    );

    const api_model = await this.verifyAndExtractApiModel(
      BotXAPISmartAppUnreadCounterResponsePayload,
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