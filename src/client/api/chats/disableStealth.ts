import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { PermissionDeniedError, ChatNotFoundError } from "@client/exceptions";

export class BotXAPIDisableStealthRequestPayload extends UnverifiedPayloadBaseModel {
  group_chat_id!: string;

  static fromDomain(chatId: string): BotXAPIDisableStealthRequestPayload {
    return new BotXAPIDisableStealthRequestPayload({
      group_chat_id: chatId,
    });
  }
}

export class BotXAPIDisableStealthResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
}

export class DisableStealthMethod extends AuthorizedBotXMethod {
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
    } as any;
  }

  async execute(payload: BotXAPIDisableStealthRequestPayload): Promise<void> {
    const path = "/api/v3/botx/chats/stealth_disable";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload.jsonableDict() }
    );

    this.verifyAndExtractApiModel(
      BotXAPIDisableStealthResponsePayload,
      response
    );
  }
} 