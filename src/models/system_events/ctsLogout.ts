import { BotAccount, BotAPISystemEventTypes } from "@models";

export class CTSLogoutEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, any>,
    public huid: string
  ) {}
}

export class BotAPICTSLogoutData {
  constructor(
    public user_huid: string
  ) {}
}

export class BotAPICTSLogoutPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public data: BotAPICTSLogoutData
  ) {}
}

export class BotAPICTSLogout {
  constructor(
    public bot_id: string,
    public payload: BotAPICTSLogoutPayload,
    public sender: { host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): CTSLogoutEvent {
    return new CTSLogoutEvent(
      new BotAccount(this.bot_id, this.sender.host),
      rawCommand,
      this.payload.data.user_huid
    );
  }
} 