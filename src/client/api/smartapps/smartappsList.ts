import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";
import { SmartApp } from "@models";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { Missing, Undefined } from "@missing";

export class BotXAPISmartAppsListRequestPayload extends UnverifiedPayloadBaseModel {
  version!: Missing<number>;

  static fromDomain(version: Missing<number> = Undefined): BotXAPISmartAppsListRequestPayload {
    return new BotXAPISmartAppsListRequestPayload({ version });
  }
}

export class BotXAPISmartAppEntity extends VerifiedPayloadBaseModel {
  app_id!: string;
  enabled!: boolean;
  id!: string;
  name!: string;
  avatar?: string;
  avatar_preview?: string;
}

export class BotXAPISmartAppsListResult extends VerifiedPayloadBaseModel {
  phonebook_version!: number;
  smartapps!: BotXAPISmartAppEntity[];
}

export class BotXAPISmartAppsListResponsePayload extends VerifiedPayloadBaseModel {
  result!: BotXAPISmartAppsListResult;
  status!: "ok";

  toDomain(): [SmartApp[], number] {
    const smartappsList = this.result.smartapps.map((smartapp: BotXAPISmartAppEntity) => 
      new SmartApp(
        smartapp.app_id,
        smartapp.enabled,
        smartapp.id,
        smartapp.name,
        smartapp.avatar,
        smartapp.avatar_preview
      )
    );
    return [smartappsList, this.result.phonebook_version];
  }
}

export class SmartAppsListMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPISmartAppsListRequestPayload): Promise<BotXAPISmartAppsListResponsePayload> {
    const path = "/api/v3/botx/smartapps/list";

    const response = await this.botxMethodCall(
      "GET",
      this.buildUrl(path),
      { params: payload.jsonableDict() }
    );

    return this.verifyAndExtractApiModel(
      BotXAPISmartAppsListResponsePayload,
      response
    );
  }
} 