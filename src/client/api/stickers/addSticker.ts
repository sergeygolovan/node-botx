import { AuthorizedBotXMethod, HttpClient, HttpResponse } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel, Sticker } from "@models";
import { AsyncBufferReadable } from "@asyncBuffer";
import { encodeRFC2397 } from "@models/attachments";
import {
  StickerPackOrStickerNotFoundError,
  InvalidEmojiError,
  InvalidImageError
} from "@client/exceptions/stickers";
import { InvalidBotXStatusCodeError } from "@client/exceptions/http";

export class BotXAPIAddStickerRequestPayload extends UnverifiedPayloadBaseModel {
  sticker_pack_id!: string; // UUID
  emoji!: string;
  image!: string;

  static async fromDomain(
    stickerPackId: string,
    emoji: string,
    asyncBuffer: AsyncBufferReadable
  ): Promise<BotXAPIAddStickerRequestPayload> {
    const mimetype = "image/png";
    const content = await asyncBuffer.read();
    const b64Content = encodeRFC2397(Buffer.from(content), mimetype);

    return new BotXAPIAddStickerRequestPayload({
      sticker_pack_id: stickerPackId,
      emoji,
      image: b64Content,
    });
  }
}

export class BotXAPIAddStickerResult extends VerifiedPayloadBaseModel {
  id!: string; // UUID
  emoji!: string;
  link!: string;
}

export class BotXAPIAddStickerResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: BotXAPIAddStickerResult;

  toDomain(packId: string): Sticker {
    return new Sticker(
      this.result.id,
      this.result.emoji,
      this.result.link,
      packId
    );
  }
}

async function badRequestErrorHandler(response: HttpResponse): Promise<never> {
  const responseData = response.json ? await response.json() : {};
  const reason = responseData.reason;

  if (reason === "pack_not_found") {
    throw new StickerPackOrStickerNotFoundError("Sticker pack not found");
  }

  const errorData = responseData.error_data;

  if (errorData?.emoji === "invalid") {
    throw new InvalidEmojiError("Invalid emoji");
  } else if (errorData?.image === "invalid") {
    throw new InvalidImageError("Invalid image");
  }

  throw new InvalidBotXStatusCodeError(response);
}

export class AddStickerMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    this.statusHandlers = {
      ...this.statusHandlers,
      400: badRequestErrorHandler,
    };
  }

  async execute(payload: BotXAPIAddStickerRequestPayload): Promise<BotXAPIAddStickerResponsePayload> {
    const jsonableDict = payload.jsonableDict();
    const { sticker_pack_id, ...body } = jsonableDict;
    const path = `/api/v3/botx/stickers/packs/${sticker_pack_id}/stickers`;

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      body
    );

    return this.verifyAndExtractApiModel(BotXAPIAddStickerResponsePayload, response);
  }
} 