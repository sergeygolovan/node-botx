import { BotAccount, BotAPISystemEventTypes } from "@models";

export class CTSLoginEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, any>,
    public huid: string
  ) {}
}

export class BotAPICTSLoginData {
  constructor(
    public user_huid: string
  ) {}
}

export class BotAPICTSLoginPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public data: BotAPICTSLoginData
  ) {}
}

export class BotAPICTSLogin {
  constructor(
    public bot_id: string,
    public payload: BotAPICTSLoginPayload,
    public sender: { host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): CTSLoginEvent {
    return new CTSLoginEvent(
      new BotAccount(this.bot_id, this.sender.host),
      rawCommand,
      this.payload.data.user_huid
    );
  }
} 