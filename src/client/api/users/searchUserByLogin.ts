import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { UserFromSearch, UserKinds } from "@models";
import { UserNotFoundError } from "@client/exceptions/users";

export class BotXAPISearchUserByLoginRequestPayload extends UnverifiedPayloadBaseModel {
  ad_login!: string;
  ad_domain!: string;

  static fromDomain(adLogin: string, adDomain: string): BotXAPISearchUserByLoginRequestPayload {
    return new BotXAPISearchUserByLoginRequestPayload({
      ad_login: adLogin,
      ad_domain: adDomain,
    });
  }
}

export class BotXAPISearchUserResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: any;

  toDomain(): UserFromSearch {
    return new UserFromSearch(
      this.result.userHuid,
      this.result.adLogin || null,
      this.result.adDomain || null,
      this.result.name,
      this.result.company || null,
      this.result.companyPosition || null,
      this.result.department || null,
      this.result.emails,
      this.result.otherId || null,
      this.result.userKind as UserKinds,
      this.result.active || null,
      this.result.description || null,
      this.result.ipPhone || null,
      this.result.manager || null,
      this.result.office || null,
      this.result.otherIpPhone || null,
      this.result.otherPhone || null,
      this.result.publicName || null,
      this.result.ctsId || null,
      this.result.rtsId || null,
      this.result.createdAt ? new Date(this.result.createdAt) : null,
      this.result.updatedAt ? new Date(this.result.updatedAt) : null
    );
  }
}

export class SearchUserByLoginMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    this.statusHandlers = {
      ...this.statusHandlers,
      404: responseExceptionThrower(UserNotFoundError),
    } as any;
  }

  async execute(payload: BotXAPISearchUserByLoginRequestPayload): Promise<BotXAPISearchUserResponsePayload> {
    const path = "/api/v3/botx/users/by_login";

    const response = await this.botxMethodCall(
      "GET",
      this.buildUrl(path),
      { params: payload.jsonableDict() }
    );

    return this.verifyAndExtractApiModel(BotXAPISearchUserResponsePayload, response);
  }
} 