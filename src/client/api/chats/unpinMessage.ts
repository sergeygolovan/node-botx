import { BotAccountsStorage } from "@bot";
import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { ChatNotFoundError, PermissionDeniedError } from "@client/exceptions";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";

export class BotXAPIUnpinMessageRequestPayload extends UnverifiedPayloadBaseModel {
  chat_id!: string;

  static fromDomain(chatId: string): BotXAPIUnpinMessageRequestPayload {
    return new BotXAPIUnpinMessageRequestPayload({
      chat_id: chatId,
    });
  }
}

export class BotXAPIUnpinMessageResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
}

export class UnpinMessageMethod extends AuthorizedBotXMethod {
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

  async execute(payload: BotXAPIUnpinMessageRequestPayload): Promise<void> {
    const path = "/api/v3/botx/chats/unpin_message";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { data: payload.jsonableDict() }
    );

    this.verifyAndExtractApiModel(
      BotXAPIUnpinMessageResponsePayload,
      response
    );
  }
} 