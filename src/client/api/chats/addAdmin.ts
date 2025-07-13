import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower, InvalidBotXStatusCodeError } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { PermissionDeniedError, ChatNotFoundError, CantUpdatePersonalChatError, InvalidUsersListError } from "@client/exceptions";

export class BotXAPIAddAdminRequestPayload extends UnverifiedPayloadBaseModel {
  group_chat_id!: string;
  user_huids!: string[];

  static fromDomain(chatId: string, huids: string[]): BotXAPIAddAdminRequestPayload {
    return new BotXAPIAddAdminRequestPayload({
      group_chat_id: chatId,
      user_huids: huids,
    });
  }
}

export class BotXAPIAddAdminResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
}

async function badRequestErrorHandler(response: Response): Promise<never> {
  const responseData = await response.json();
  const reason = responseData.reason;

  if (reason === "chat_members_not_modifiable") {
    throw new CantUpdatePersonalChatError("Personal chat couldn't have admins");
  } else if (reason === "admins_not_changed") {
    throw new InvalidUsersListError("Specified users are already admins or missing from chat");
  }

  throw new InvalidBotXStatusCodeError(`Bad request: ${response.status}`);
}

export class AddAdminMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    (this.statusHandlers as any) = {
      ...this.statusHandlers,
      400: badRequestErrorHandler as any,
      403: responseExceptionThrower(PermissionDeniedError),
      404: responseExceptionThrower(ChatNotFoundError),
    };
  }

  async execute(payload: BotXAPIAddAdminRequestPayload): Promise<void> {
    const path = "/api/v3/botx/chats/add_admin";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload.jsonableDict() }
    );

    this.verifyAndExtractApiModel(BotXAPIAddAdminResponsePayload, response);
  }
} 