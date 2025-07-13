import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";
import { StickerPackFromList, StickerPackPage, UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";

export class BotXAPIGetStickerPacksRequestPayload extends UnverifiedPayloadBaseModel {
  user_huid!: string;
  limit!: number;
  after?: string;

  static fromDomain(huid: string, limit: number, after?: string): BotXAPIGetStickerPacksRequestPayload {
    return new BotXAPIGetStickerPacksRequestPayload({
      user_huid: huid,
      limit,
      after: after || undefined,
    });
  }
}

export class BotXAPIGetPaginationResult extends VerifiedPayloadBaseModel {
  after?: string;
}

export class BotXAPIGetStickerPackResult extends VerifiedPayloadBaseModel {
  id!: string;
  name!: string;
  public!: boolean;
  stickers_count!: number;
  stickers_order?: string[];
}

export class BotXAPIGetStickerPacksResult extends VerifiedPayloadBaseModel {
  packs!: BotXAPIGetStickerPackResult[];
  pagination!: BotXAPIGetPaginationResult;
}

export class BotXAPIGetStickerPacksResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: BotXAPIGetStickerPacksResult;

  toDomain(): StickerPackPage {
    return new StickerPackPage(
      this.result.packs.map((stickerPack: BotXAPIGetStickerPackResult) => 
        new StickerPackFromList(
          stickerPack.id,
          stickerPack.name,
          stickerPack.public,
          stickerPack.stickers_count,
          stickerPack.stickers_order
        )
      ),
      this.result.pagination.after
    );
  }
}

export class GetStickerPacksMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPIGetStickerPacksRequestPayload): Promise<BotXAPIGetStickerPacksResponsePayload> {
    const path = "/api/v3/botx/stickers/packs";

    const response = await this.botxMethodCall(
      "GET",
      this.buildUrl(path),
      { params: payload.jsonableDict() }
    );

    return this.verifyAndExtractApiModel(BotXAPIGetStickerPacksResponsePayload, response);
  }
} 