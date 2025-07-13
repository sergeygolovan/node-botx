import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";
import { BotsListItem, UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { Missing, Undefined } from "@missing";

export class BotXAPIBotsListRequestPayload extends UnverifiedPayloadBaseModel {
  since!: Missing<Date>;

  static fromDomain(since: Missing<Date> = Undefined): BotXAPIBotsListRequestPayload {
    return new BotXAPIBotsListRequestPayload({
      since,
    });
  }
}

export class BotXAPIBotItem extends VerifiedPayloadBaseModel {
  user_huid!: string;
  name!: string;
  description!: string;
  avatar!: string | null;
  enabled!: boolean;
}

export class BotXAPIBotsListResult extends VerifiedPayloadBaseModel {
  generated_at!: Date;
  bots!: BotXAPIBotItem[];
}

export class BotXAPIBotsListResponsePayload extends VerifiedPayloadBaseModel {
  result!: BotXAPIBotsListResult;
  status!: "ok";

  toDomain(): [BotsListItem[], Date] {
    const botsList = this.result.bots.map(bot => new BotsListItem(
      bot.user_huid,
      bot.name,
      bot.description,
      bot.avatar,
      bot.enabled
    ));
    return [botsList, this.result.generated_at];
  }
}

export class BotsListMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPIBotsListRequestPayload): Promise<BotXAPIBotsListResponsePayload> {
    const path = "/api/v1/botx/bots/catalog";

    const response = await this.botxMethodCall(
      "GET",
      this.buildUrl(path),
      { params: payload.jsonableDict() }
    );

    return this.verifyAndExtractApiModel(BotXAPIBotsListResponsePayload, response);
  }
} 