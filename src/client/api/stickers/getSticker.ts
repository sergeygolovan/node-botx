import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { Sticker, UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { StickerPackOrStickerNotFoundError } from "@client/exceptions/stickers";

export class BotXAPIGetStickerRequestPayload extends UnverifiedPayloadBaseModel {
  sticker_pack_id!: string;
  sticker_id!: string;

  static fromDomain(stickerPackId: string, stickerId: string): BotXAPIGetStickerRequestPayload {
    return new BotXAPIGetStickerRequestPayload({
      sticker_pack_id: stickerPackId,
      sticker_id: stickerId,
    });
  }
}

export class BotXAPIGetStickerResult extends VerifiedPayloadBaseModel {
  id!: string;
  emoji!: string;
  link!: string;
}

export class BotXAPIGetStickerResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: BotXAPIGetStickerResult;

  toDomain(pack_id: string): Sticker {
    return new Sticker(
      this.result.id,
      this.result.emoji,
      this.result.link,
      pack_id
    );
  }
}

export class GetStickerMethod extends AuthorizedBotXMethod {
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

  async execute(payload: BotXAPIGetStickerRequestPayload): Promise<BotXAPIGetStickerResponsePayload> {
    const jsonableDict = payload.jsonableDict();
    const path = `/api/v3/botx/stickers/packs/${jsonableDict.sticker_pack_id}/stickers/${jsonableDict.sticker_id}`;

    const response = await this.botxMethodCall(
      "GET",
      this.buildUrl(path)
    );

    return this.verifyAndExtractApiModel(BotXAPIGetStickerResponsePayload, response);
  }
} 