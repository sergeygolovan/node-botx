import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { PermissionDeniedError, ChatNotFoundError } from "@client/exceptions";

export class BotXAPIAddUserRequestPayload extends UnverifiedPayloadBaseModel {
  group_chat_id!: string;
  user_huids!: string[];

  static fromDomain(chatId: string, huids: string[]): BotXAPIAddUserRequestPayload {
    return new BotXAPIAddUserRequestPayload({
      group_chat_id: chatId,
      user_huids: huids,
    });
  }
}

export class BotXAPIAddUserResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
}

export class AddUserMethod extends AuthorizedBotXMethod {
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

  async execute(payload: BotXAPIAddUserRequestPayload): Promise<void> {
    const path = "/api/v3/botx/chats/add_user";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload.jsonableDict() }
    );

    this.verifyAndExtractApiModel(BotXAPIAddUserResponsePayload, response);
  }
} 