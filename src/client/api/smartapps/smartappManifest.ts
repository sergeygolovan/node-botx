import { BotAccountsStorage } from "@bot";
import { AuthorizedBotXMethod, HttpClient } from "@client";
import { Missing, Undefined } from "@missing";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";

// Enums
export enum WebLayoutChoices {
  minimal = "minimal",
  half = "half",
  full = "full"
}

export class SmartappManifestIosParams extends VerifiedPayloadBaseModel {
  fullscreen_layout: boolean = false;
}

export class SmartappManifestAndroidParams extends VerifiedPayloadBaseModel {
  fullscreen_layout: boolean = false;
}

export class SmartappManifestAuroraParams extends VerifiedPayloadBaseModel {
  fullscreen_layout: boolean = false;
}

export class SmartappManifestWebParams extends VerifiedPayloadBaseModel {
  default_layout: WebLayoutChoices = WebLayoutChoices.minimal;
  expanded_layout: WebLayoutChoices = WebLayoutChoices.half;
  always_pinned: boolean = false;
}

export class SmartappManifestUnreadCounterParams extends VerifiedPayloadBaseModel {
  user_huid: string[] = [];
  group_chat_id: string[] = [];
  app_id: string[] = [];
}

export class SmartappManifest extends VerifiedPayloadBaseModel {
  ios!: SmartappManifestIosParams;
  android!: SmartappManifestAndroidParams;
  web!: SmartappManifestWebParams;
  unread_counter_link!: SmartappManifestUnreadCounterParams;
}

export class SmartappManifestPayload extends UnverifiedPayloadBaseModel {
  ios!: Missing<SmartappManifestIosParams>;
  android!: Missing<SmartappManifestAndroidParams>;
  web!: Missing<SmartappManifestWebParams>;
  aurora!: Missing<SmartappManifestAuroraParams>;
  unread_counter_link!: Missing<SmartappManifestUnreadCounterParams>;
}

export class BotXAPISmartAppManifestRequestPayload extends UnverifiedPayloadBaseModel {
  manifest!: SmartappManifestPayload;

  static fromDomain(
    ios: Missing<SmartappManifestIosParams> = Undefined,
    android: Missing<SmartappManifestAndroidParams> = Undefined,
    web_layout: Missing<SmartappManifestWebParams> = Undefined,
    unread_counter: Missing<SmartappManifestUnreadCounterParams> = Undefined
  ): BotXAPISmartAppManifestRequestPayload {
    if (web_layout === Undefined && unread_counter === Undefined) {
      return new BotXAPISmartAppManifestRequestPayload({ manifest: {} });
    }

    return new BotXAPISmartAppManifestRequestPayload({
      manifest: new SmartappManifestPayload({
        ios,
        android,
        web: web_layout,
        unread_counter_link: unread_counter,
      }),
    });
  }
}

export class BotXAPISmartAppManifestResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: SmartappManifest;

  toDomain(): SmartappManifest {
    return this.result;
  }
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
      {
        headers: {
          "Content-Type": "application/json"
        },
        data: payload.jsonableDict()
      }
    );

    return this.verifyAndExtractApiModel(
      BotXAPISmartAppManifestResponsePayload,
      response
    );
  }
} 