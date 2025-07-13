import { BotAccountsStorage } from "@bot";
import { BotXAPIGetTokenRequestPayload, GetTokenMethod } from "./api/bots/getToken";
import { HttpClient } from "./httpClient";

export async function getToken(
  botId: string,
  httpClient: HttpClient,
  botAccountsStorage: BotAccountsStorage
): Promise<string> {
  const method = new GetTokenMethod(botId, httpClient, botAccountsStorage);

  const signature = botAccountsStorage.buildSignature(botId);
  const payload = BotXAPIGetTokenRequestPayload.fromDomain(signature);

  const botxApiToken = await method.execute(payload);

  return botxApiToken.toDomain();
} 