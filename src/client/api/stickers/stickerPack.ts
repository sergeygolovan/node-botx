import { Sticker, StickerPack, VerifiedPayloadBaseModel } from "../../../models";

export class BotXAPIGetStickerResult extends VerifiedPayloadBaseModel {
  id!: string;
  emoji!: string;
  link!: string;
}

export class BotXAPIGetStickerPackResult extends VerifiedPayloadBaseModel {
  id!: string;
  name!: string;
  public!: boolean;
  stickers!: BotXAPIGetStickerResult[];
  stickers_order?: string[];
}

export class BotXAPIGetStickerPackResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: BotXAPIGetStickerPackResult;

  toDomain(): StickerPack {
    // Сортируем стикеры по порядку, если есть stickers_order
    if (this.result.stickers_order) {
      this.result.stickers.sort((a, b) => {
        const aIndex = this.result.stickers_order!.indexOf(a.id);
        const bIndex = this.result.stickers_order!.indexOf(b.id);
        return aIndex - bIndex;
      });
    }

    const stickers = this.result.stickers.map(sticker => new Sticker(
      sticker.id,
      sticker.emoji,
      sticker.link,
      this.result.id
    ));

    return new StickerPack(
      this.result.id,
      this.result.name,
      this.result.public,
      stickers
    );
  }
} 