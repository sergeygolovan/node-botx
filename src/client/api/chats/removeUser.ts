import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { PermissionDeniedError, ChatNotFoundError } from "@client/exceptions";

export class BotXAPIRemoveUserRequestPayload extends UnverifiedPayloadBaseModel {
  group_chat_id!: string;
  user_huids!: string[];

  static fromDomain(chatId: string, huids: string[]): BotXAPIRemoveUserRequestPayload {
    return new BotXAPIRemoveUserRequestPayload({
      group_chat_id: chatId,
      user_huids: huids,
    });
  }
}

export class BotXAPIRemoveUserResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
}

export class RemoveUserMethod extends AuthorizedBotXMethod {
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

  async execute(payload: BotXAPIRemoveUserRequestPayload): Promise<void> {
    const path = "/api/v3/botx/chats/remove_user";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload.jsonableDict() }
    );

    this.verifyAndExtractApiModel(
      BotXAPIRemoveUserResponsePayload,
      response
    );
  }
} 