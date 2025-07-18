import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { StickerPackOrStickerNotFoundError } from "@client/exceptions/stickers";

export class BotXAPIDeleteStickerRequestPayload extends UnverifiedPayloadBaseModel {
  sticker_pack_id!: string; // UUID
  sticker_id!: string; // UUID

  static fromDomain(
    stickerPackId: string,
    stickerId: string
  ): BotXAPIDeleteStickerRequestPayload {
    return new BotXAPIDeleteStickerRequestPayload({
      sticker_pack_id: stickerPackId,
      sticker_id: stickerId,
    });
  }
}

export class BotXAPIDeleteStickerResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
}

export class DeleteStickerMethod extends AuthorizedBotXMethod {
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

  async execute(payload: BotXAPIDeleteStickerRequestPayload): Promise<void> {
    const jsonableDict = payload.jsonableDict();
    const path = `/api/v3/botx/stickers/packs/${jsonableDict.sticker_pack_id}/stickers/${jsonableDict.sticker_id}`;

    const response = await this.botxMethodCall(
      "DELETE",
      this.buildUrl(path)
    );

    this.verifyAndExtractApiModel(BotXAPIDeleteStickerResponsePayload, response);
  }
} 