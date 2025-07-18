import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel, StickerPack } from "@models";
import { Missing } from "@missing";

export class BotXAPICreateStickerPackRequestPayload extends UnverifiedPayloadBaseModel {
  name!: string;
  user_huid!: Missing<string>; // UUID

  static fromDomain(
    name: string,
    huid: Missing<string>
  ): BotXAPICreateStickerPackRequestPayload {
    return new BotXAPICreateStickerPackRequestPayload({
      name,
      user_huid: huid,
    });
  }
}

export class BotXAPICreateStickerPackResult extends VerifiedPayloadBaseModel {
  id!: string; // UUID
  name!: string;
  public!: boolean;
}

export class BotXAPICreateStickerPackResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: BotXAPICreateStickerPackResult;

  toDomain(): StickerPack {
    return new StickerPack(
      this.result.id,
      this.result.name,
      this.result.public,
      []
    );
  }
}

export class CreateStickerPackMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPICreateStickerPackRequestPayload): Promise<BotXAPICreateStickerPackResponsePayload> {
    const path = "/api/v3/botx/stickers/packs";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      payload.jsonableDict()
    );

    return this.verifyAndExtractApiModel(BotXAPICreateStickerPackResponsePayload, response);
  }
} 