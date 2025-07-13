import { AuthorizedBotXMethod } from "../../authorizedBotxMethod";
import { HttpClient } from "../../httpClient";
import { BotAccountsStorage } from "../../../bot/botAccountsStorage";
import { BotXAPISearchUserByEmailsResponsePayload } from "./userFromSearch";
import { UnverifiedPayloadBaseModel } from "@models";

export class BotXAPISearchUserByEmailsRequestPayload extends UnverifiedPayloadBaseModel {
  emails!: string[];

  static fromDomain(emails: string[]): BotXAPISearchUserByEmailsRequestPayload {
    return new BotXAPISearchUserByEmailsRequestPayload({
      emails,
    });
  }
}

export class SearchUserByEmailsMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPISearchUserByEmailsRequestPayload): Promise<BotXAPISearchUserByEmailsResponsePayload> {
    const path = "/api/v3/botx/users/by_email";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload.jsonableDict() }
    );

    return this.verifyAndExtractApiModel(BotXAPISearchUserByEmailsResponsePayload, response);
  }
} 