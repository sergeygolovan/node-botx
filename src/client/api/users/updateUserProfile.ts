import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { UserNotFoundError, InvalidProfileDataError } from "@client/exceptions/users";
import { Missing, Undefined } from "@missing";
import { BotXAPIAttachment, IncomingFileAttachment, OutgoingAttachment } from "@models";

export class BotXAPIUpdateUserProfileRequestPayload extends UnverifiedPayloadBaseModel {
  user_huid!: string;
  name!: Missing<string>;
  public_name!: Missing<string>;
  avatar!: Missing<any>; // BotXAPIAttachment['data']
  company!: Missing<string>;
  company_position!: Missing<string>;
  description!: Missing<string>;
  department!: Missing<string>;
  office!: Missing<string>;
  manager!: Missing<string>;

  static fromDomain(
    user_huid: string,
    avatar: Missing<IncomingFileAttachment | OutgoingAttachment> = Undefined,
    name: Missing<string> = Undefined,
    publicName: Missing<string> = Undefined,
    company: Missing<string> = Undefined,
    companyPosition: Missing<string> = Undefined,
    description: Missing<string> = Undefined,
    department: Missing<string> = Undefined,
    office: Missing<string> = Undefined,
    manager: Missing<string> = Undefined
  ): BotXAPIUpdateUserProfileRequestPayload {
    let apiAvatar: Missing<any> = Undefined;
    if (avatar !== Undefined) {
      apiAvatar = BotXAPIAttachment.fromFileAttachment(avatar).data;
    }
    return new BotXAPIUpdateUserProfileRequestPayload({
      user_huid: user_huid,
      name,
      public_name: publicName,
      avatar: apiAvatar,
      company,
      company_position: companyPosition,
      description,
      department,
      office,
      manager,
    });
  }
}

export class BotXAPIUpdateUserProfileResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: true;
}

export class UpdateUsersProfileMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    this.statusHandlers = {
      ...this.statusHandlers,
      400: responseExceptionThrower(InvalidProfileDataError),
      404: responseExceptionThrower(UserNotFoundError),
    };
  }

  async execute(payload: BotXAPIUpdateUserProfileRequestPayload): Promise<BotXAPIUpdateUserProfileResponsePayload> {
    const path = "/api/v3/botx/users/update_profile";

    const response = await this.botxMethodCall(
      "PUT",
      this.buildUrl(path),
      {
        headers: { "Content-Type": "application/json" },
        data: payload.jsonableDict()
      }
    );

    return this.verifyAndExtractApiModel(BotXAPIUpdateUserProfileResponsePayload, response);
  }
} 