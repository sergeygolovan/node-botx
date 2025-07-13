import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";
import { SmartApp } from "@models";

export interface BotXAPISmartAppsListRequestPayload {
  version?: number;
}

export interface BotXAPISmartAppEntity {
  appId: string;
  enabled: boolean;
  id: string;
  name: string;
  avatar?: string;
  avatarPreview?: string;
}

export interface BotXAPISmartAppsListResult {
  apps: BotXAPISmartAppEntity[];
  version: number;
}

export interface BotXAPISmartAppsListResponsePayload {
  status: "ok";
  result: BotXAPISmartAppsListResult;
  toDomain(): [SmartApp[], number];
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
      { params: payload }
    );

    const responseData = await response.json();
    const result: BotXAPISmartAppsListResponsePayload = {
      result: responseData.result,
      status: responseData.status,
      toDomain() {
        const smartappsList = this.result.apps.map((smartapp: BotXAPISmartAppEntity) => 
          new SmartApp(
            smartapp.appId,
            smartapp.enabled,
            smartapp.id,
            smartapp.name,
            smartapp.avatar,
            smartapp.avatarPreview
          )
        );
        return [smartappsList, this.result.version];
      }
    };
    return result;
  }
} 