import { AsyncBufferWritable } from "@asyncBuffer";
import { botVar } from "@bot";
import { IsString, IsBoolean, IsNumber, IsOptional, IsArray, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class Sticker {
  @IsUUID()
  id: string; // UUID

  @IsString()
  emoji: string;

  @IsString()
  image_link: string;

  @IsUUID()
  pack_id: string; // UUID

  constructor(
    id: string, // UUID
    emoji: string,
    image_link: string,
    pack_id: string // UUID
  ) {
    this.id = id;
    this.emoji = emoji;
    this.image_link = image_link;
    this.pack_id = pack_id;
  }

  async download(asyncBuffer: AsyncBufferWritable): Promise<void> {
    const bot = botVar.get();
    if (!bot) {
      throw new Error("Bot not found in context");
    }
    
    // Создаем временный HTTP клиент для загрузки стикера
    const { createHttpClient } = await import("@client");
    const httpClient = createHttpClient();
    
    const response = await httpClient.get<ArrayBuffer>(this.image_link, {
      responseType: "arraybuffer",
    });

    await asyncBuffer.write(Buffer.from(response.data));
    await asyncBuffer.seek(0);
  }
}

export class StickerPack {
  @IsUUID()
  id: string; // UUID

  @IsString()
  name: string;

  @IsBoolean()
  is_public: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Sticker)
  stickers: Sticker[];

  constructor(
    id: string, // UUID
    name: string,
    is_public: boolean,
    stickers: Sticker[]
  ) {
    this.id = id;
    this.name = name;
    this.is_public = is_public;
    this.stickers = stickers;
  }
}

export class StickerPackFromList {
  @IsUUID()
  id: string; // UUID

  @IsString()
  name: string;

  @IsBoolean()
  is_public: boolean;

  @IsNumber()
  stickers_count: number;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  sticker_ids?: string[]; // UUID[] | undefined

  constructor(
    id: string, // UUID
    name: string,
    is_public: boolean,
    stickers_count: number,
    sticker_ids?: string[] // UUID[] | undefined
  ) {
    this.id = id;
    this.name = name;
    this.is_public = is_public;
    this.stickers_count = stickers_count;
    this.sticker_ids = sticker_ids;
  }
}

export class StickerPackPage {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StickerPackFromList)
  sticker_packs: StickerPackFromList[];

  @IsOptional()
  @IsString()
  after?: string;

  constructor(
    sticker_packs: StickerPackFromList[],
    after?: string
  ) {
    this.sticker_packs = sticker_packs;
    this.after = after;
  }
}
