import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel } from "@models";
import { BotXAPIGetStickerPackResponsePayload } from "./stickerPack";
import { StickerPackOrStickerNotFoundError } from "@client/exceptions/stickers";
import { Missing, Undefined } from "@missing";

export class BotXAPIEditStickerPackRequestPayload extends UnverifiedPayloadBaseModel {
  sticker_pack_id!: string; // UUID
  name!: string;
  preview!: string; // UUID
  stickers_order!: Missing<string[]>;

  static fromDomain(
    stickerPackId: string,
    name: string,
    preview: string,
    stickersOrder?: string[]
  ): BotXAPIEditStickerPackRequestPayload {
    return new BotXAPIEditStickerPackRequestPayload({
      sticker_pack_id: stickerPackId,
      name,
      preview,
      stickers_order: stickersOrder || Undefined,
    });
  }
}

export class EditStickerPackMethod extends AuthorizedBotXMethod {
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

  async execute(payload: BotXAPIEditStickerPackRequestPayload): Promise<BotXAPIGetStickerPackResponsePayload> {
    const jsonableDict = payload.jsonableDict();
    const { sticker_pack_id, ...body } = jsonableDict;
    const path = `/api/v3/botx/stickers/packs/${sticker_pack_id}`;

    const response = await this.botxMethodCall(
      "PUT",
      this.buildUrl(path),
      body
    );

    return this.verifyAndExtractApiModel(BotXAPIGetStickerPackResponsePayload, response);
  }
} 