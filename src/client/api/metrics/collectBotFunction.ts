import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";

export class BotXAPICollectBotFunctionRequestPayload extends UnverifiedPayloadBaseModel {
  group_chat_id!: string;
  user_huids!: string[];
  bot_function!: string;

  static fromDomain(chatId: string, huids: string[], botFunction: string): BotXAPICollectBotFunctionRequestPayload {
    return new BotXAPICollectBotFunctionRequestPayload({
      group_chat_id: chatId,
      user_huids: huids,
      bot_function: botFunction,
    });
  }
}

export class BotXAPICollectBotFunctionResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: boolean;
}

export class CollectBotFunctionMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPICollectBotFunctionRequestPayload): Promise<void> {
    const path = "/api/v3/botx/metrics/bot_function";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload.jsonableDict() }
    );

    this.verifyAndExtractApiModel(
      BotXAPICollectBotFunctionResponsePayload,
      response
    );
  }
} 