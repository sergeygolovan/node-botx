import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { UserFromSearch, UserKinds } from "@models";
import { UserNotFoundError } from "@client/exceptions/users";

export class BotXAPISearchUserByEmailRequestPayload extends UnverifiedPayloadBaseModel {
  email!: string;

  static fromDomain(email: string): BotXAPISearchUserByEmailRequestPayload {
    return new BotXAPISearchUserByEmailRequestPayload({
      email,
    });
  }
}

export class BotXAPISearchUserResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: any;

  toDomain(): UserFromSearch {
    return new UserFromSearch(
      this.result.user_huid,
      this.result.ad_login || null,
      this.result.ad_domain || null,
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

export class SearchUserByEmailMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    this.statusHandlers = {
      ...this.statusHandlers,
      404: responseExceptionThrower(UserNotFoundError),
    };
  }

  async execute(payload: BotXAPISearchUserByEmailRequestPayload): Promise<BotXAPISearchUserResponsePayload> {
    const path = "/api/v3/botx/users/by_email";

    const response = await this.botxMethodCall(
      "GET",
      this.buildUrl(path),
      { params: payload.jsonableDict() }
    );

    return this.verifyAndExtractApiModel(BotXAPISearchUserResponsePayload, response);
  }
} 