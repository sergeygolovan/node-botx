import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { BotXAPIGetStickerPackResponsePayload } from "./stickerPack";
import { StickerPackOrStickerNotFoundError } from "@client/exceptions/stickers";

export class BotXAPIGetStickerPackRequestPayload extends UnverifiedPayloadBaseModel {
  sticker_pack_id!: string;

  static fromDomain(stickerPackId: string): BotXAPIGetStickerPackRequestPayload {
    return new BotXAPIGetStickerPackRequestPayload({
      sticker_pack_id: stickerPackId,
    });
  }
}

export class GetStickerPackMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    this.statusHandlers = {
      ...this.statusHandlers,
      404: responseExceptionThrower(StickerPackOrStickerNotFoundError),
    } as any;
  }

  async execute(payload: BotXAPIGetStickerPackRequestPayload): Promise<BotXAPIGetStickerPackResponsePayload> {
    const jsonableDict = payload.jsonableDict();
    const path = `/api/v3/botx/stickers/packs/${jsonableDict.sticker_pack_id}`;

    const response = await this.botxMethodCall(
      "GET",
      this.buildUrl(path)
    );

    return this.verifyAndExtractApiModel(BotXAPIGetStickerPackResponsePayload, response);
  }
} 