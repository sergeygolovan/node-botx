import { AuthorizedBotXMethod } from "../../authorizedBotxMethod";
import { HttpClient } from "../../httpClient";
import { BotAccountsStorage } from "../../../bot/botAccountsStorage";

// Enums
export enum WebLayoutChoices {
  minimal = "minimal",
  half = "half",
  full = "full"
}

export interface SmartappManifestIosParams {
  fullscreenLayout: boolean;
}

export interface SmartappManifestAndroidParams {
  fullscreenLayout: boolean;
}

export interface SmartappManifestAuroraParams {
  fullscreenLayout: boolean;
}

export interface SmartappManifestWebParams {
  defaultLayout: WebLayoutChoices;
  expandedLayout: WebLayoutChoices;
  alwaysPinned: boolean;
}

export interface SmartappManifestUnreadCounterParams {
  userHuid: string[];
  groupChatId: string[];
  appId: string[];
}

export interface SmartappManifest {
  ios: SmartappManifestIosParams;
  android: SmartappManifestAndroidParams;
  web: SmartappManifestWebParams;
  unreadCounterLink: SmartappManifestUnreadCounterParams;
}

export interface SmartappManifestPayload {
  ios?: SmartappManifestIosParams;
  android?: SmartappManifestAndroidParams;
  web?: SmartappManifestWebParams;
  aurora?: SmartappManifestAuroraParams;
  unreadCounterLink?: SmartappManifestUnreadCounterParams;
}

export interface BotXAPISmartAppManifestRequestPayload {
  manifest: SmartappManifestPayload;
}

export interface BotXAPISmartAppManifestResponsePayload {
  status: "ok";
  result: SmartappManifest;
  toDomain(): SmartappManifest;
}

export class SmartAppManifestMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPISmartAppManifestRequestPayload): Promise<BotXAPISmartAppManifestResponsePayload> {
    const path = "/api/v1/botx/smartapps/manifest";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload }
    );

    const responseData = await response.json();
    const result: BotXAPISmartAppManifestResponsePayload = {
      status: responseData.status,
      result: responseData.result,
      toDomain() {
        return this.result;
      }
    };
    return result;
  }
} 