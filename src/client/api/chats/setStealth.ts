import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { Missing } from "@missing";
import { PermissionDeniedError, ChatNotFoundError } from "@client/exceptions";

export class BotXAPISetStealthRequestPayload extends UnverifiedPayloadBaseModel {
  group_chat_id!: string;
  disable_web!: Missing<boolean>;
  burn_in!: Missing<number>;
  expire_in!: Missing<number>;

  static fromDomain(
    chatId: string,
    disableWebClient: Missing<boolean>,
    ttlAfterRead: Missing<number>,
    totalTtl: Missing<number>
  ): BotXAPISetStealthRequestPayload {
    return new BotXAPISetStealthRequestPayload({
      group_chat_id: chatId,
      disable_web: disableWebClient,
      burn_in: ttlAfterRead,
      expire_in: totalTtl,
    });
  }
}

export class BotXAPISetStealthResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
}

export class SetStealthMethod extends AuthorizedBotXMethod {
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

  async execute(payload: BotXAPISetStealthRequestPayload): Promise<void> {
    const path = "/api/v3/botx/chats/stealth_set";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload.jsonableDict() }
    );

    this.verifyAndExtractApiModel(
      BotXAPISetStealthResponsePayload,
      response
    );
  }
} 