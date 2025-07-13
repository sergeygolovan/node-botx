import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";

export class BotXAPIRefreshAccessTokenRequestPayload extends UnverifiedPayloadBaseModel {
  user_huid!: string;
  ref?: string;

  static fromDomain(huid: string, ref?: string): BotXAPIRefreshAccessTokenRequestPayload {
    return new BotXAPIRefreshAccessTokenRequestPayload({
      user_huid: huid,
      ref,
    });
  }
}

export class BotXAPIRefreshAccessTokenResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: boolean;
}

export class RefreshAccessTokenMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPIRefreshAccessTokenRequestPayload): Promise<BotXAPIRefreshAccessTokenResponsePayload> {
    const path = "/api/v3/botx/openid/refresh_access_token";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload.jsonableDict() }
    );

    return this.verifyAndExtractApiModel(
      BotXAPIRefreshAccessTokenResponsePayload,
      response
    );
  }
} 