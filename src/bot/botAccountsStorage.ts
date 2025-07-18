import { createHmac } from "crypto";
import { BotAccountWithSecret } from "../models/botAccount";
import { UnknownBotAccountError } from "./exceptions";

export class BotAccountsStorage {
  private botAccounts: BotAccountWithSecret[];
  private authTokens: Map<string, string> = new Map();

  constructor(botAccounts: BotAccountWithSecret[]) {
    this.botAccounts = botAccounts;
  }

  getBotAccount(botId: string): BotAccountWithSecret {
    const account = this.botAccounts.find((acc) => acc.id === botId);
    if (!account) {
      throw new UnknownBotAccountError(botId);
    }
    return account;
  }

  *iterBotAccounts(): IterableIterator<BotAccountWithSecret> {
    yield* this.botAccounts;
  }

  getCtsUrl(botId: string): string {
    return this.getBotAccount(botId).cts_url;
  }

  setToken(botId: string, token: string): void {
    this.authTokens.set(botId, token);
  }

  getTokenOrNone(botId: string): string | undefined {
    return this.authTokens.get(botId);
  }

  buildSignature(botId: string): string {
    const account = this.getBotAccount(botId);
    const hmac = createHmac("sha256", account.secret_key);
    hmac.update(account.id);
    return hmac.digest("hex").toUpperCase();
  }

  ensureBotIdExists(botId: string): void {
    this.getBotAccount(botId);
  }
} 