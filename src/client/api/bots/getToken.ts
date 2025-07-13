import { BotXMethod, HttpClient, InvalidBotAccountError, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";

export class BotXAPIGetTokenRequestPayload extends UnverifiedPayloadBaseModel {
  signature!: string;

  static fromDomain(signature: string): BotXAPIGetTokenRequestPayload {
    return new BotXAPIGetTokenRequestPayload({
      signature,
    });
  }
}

export class BotXAPIGetTokenResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: string;

  toDomain(): string {
    return this.result;
  }
}

export class GetTokenMethod extends BotXMethod {
  statusHandlers = { 401: responseExceptionThrower(InvalidBotAccountError) };

  async execute(payload: BotXAPIGetTokenRequestPayload): Promise<BotXAPIGetTokenResponsePayload> {
    const path = `/api/v2/botx/bots/${this.senderBotId}/token`;

    const response = await this.botxMethodCall(
      "GET",
      this.buildUrl(path),
      { params: payload.jsonableDict() }
    );

    return this.verifyAndExtractApiModel(BotXAPIGetTokenResponsePayload, response);
  }
} 