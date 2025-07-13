import { AsyncBufferWritable } from "@asyncBuffer";
import { botVar } from "@bot";

export class Sticker {
  constructor(
    public id: string, // UUID
    public emoji: string,
    public imageLink: string,
    public packId: string // UUID
  ) {}

  async download(asyncBuffer: AsyncBufferWritable): Promise<void> {
    const bot = botVar.get();
    if (!bot || !bot.httpClient) {
      throw new Error("Bot or HTTP client not found in context");
    }
    const response = await bot.httpClient.get<ArrayBuffer>(this.imageLink, {
      responseType: "arraybuffer",
    });

    await asyncBuffer.write(Buffer.from(response.data));
    await asyncBuffer.seek(0);
  }
}

export class StickerPack {
  constructor(
    public id: string, // UUID
    public name: string,
    public isPublic: boolean,
    public stickers: Sticker[]
  ) {}
}

export class StickerPackFromList {
  constructor(
    public id: string, // UUID
    public name: string,
    public isPublic: boolean,
    public stickersCount: number,
    public stickerIds?: string[] // UUID[] | undefined
  ) {}
}

export class StickerPackPage {
  constructor(
    public stickerPacks: StickerPackFromList[],
    public after?: string
  ) {}
}
