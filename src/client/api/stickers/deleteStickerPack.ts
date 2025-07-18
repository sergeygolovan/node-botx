import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { StickerPackOrStickerNotFoundError } from "@client/exceptions/stickers";

export class BotXAPIDeleteStickerPackRequestPayload extends UnverifiedPayloadBaseModel {
  sticker_pack_id!: string; // UUID

  static fromDomain(stickerPackId: string): BotXAPIDeleteStickerPackRequestPayload {
    return new BotXAPIDeleteStickerPackRequestPayload({
      sticker_pack_id: stickerPackId,
    });
  }
}

export class BotXAPIDeleteStickerPackResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
}

export class DeleteStickerPackMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    this.statusHandlers = {
      ...this.statusHandlers,
      404: responseExceptionThrower(StickerPackOrStickerNotFoundError),
    };
  }

  async execute(payload: BotXAPIDeleteStickerPackRequestPayload): Promise<BotXAPIDeleteStickerPackResponsePayload> {
    const jsonableDict = payload.jsonableDict();
    const path = `/api/v3/botx/stickers/packs/${jsonableDict.sticker_pack_id}`;

    const response = await this.botxMethodCall(
      "DELETE",
      this.buildUrl(path)
    );

    return this.verifyAndExtractApiModel(BotXAPIDeleteStickerPackResponsePayload, response);
  }
} 