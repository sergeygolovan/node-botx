import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { MessageNotFoundError } from "@client/exceptions/message";

export class BotXAPIDeleteEventRequestPayload extends UnverifiedPayloadBaseModel {
  sync_id!: string;

  static fromDomain(syncId: string): BotXAPIDeleteEventRequestPayload {
    return new BotXAPIDeleteEventRequestPayload({
      sync_id: syncId,
    });
  }
}

export class BotXAPIDeleteEventResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: string;
}

export class DeleteEventMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    this.statusHandlers = {
      ...this.statusHandlers,
      404: responseExceptionThrower(MessageNotFoundError),
    };
  }

  async execute(payload: BotXAPIDeleteEventRequestPayload): Promise<BotXAPIDeleteEventResponsePayload> {
    const path = "/api/v3/botx/events/delete_event";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload.jsonableDict() }
    );

    return this.verifyAndExtractApiModel(BotXAPIDeleteEventResponsePayload, response);
  }
} 