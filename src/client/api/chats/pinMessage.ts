import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { PermissionDeniedError, ChatNotFoundError } from "@client/exceptions";

export class BotXAPIPinMessageRequestPayload extends UnverifiedPayloadBaseModel {
  chat_id!: string;
  sync_id!: string;

  static fromDomain(chatId: string, syncId: string): BotXAPIPinMessageRequestPayload {
    return new BotXAPIPinMessageRequestPayload({
      chat_id: chatId,
      sync_id: syncId,
    });
  }
}

export class BotXAPIPinMessageResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
}

export class PinMessageMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    this.statusHandlers = {
      ...this.statusHandlers,
      403: responseExceptionThrower(PermissionDeniedError),
      404: responseExceptionThrower(ChatNotFoundError),
    };
  }

  async execute(payload: BotXAPIPinMessageRequestPayload): Promise<void> {
    const path = "/api/v3/botx/chats/pin_message";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload.jsonableDict() }
    );

    this.verifyAndExtractApiModel(
      BotXAPIPinMessageResponsePayload,
      response
    );
  }
} 