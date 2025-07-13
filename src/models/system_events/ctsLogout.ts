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
    public userHuid: string
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
    public botId: string,
    public payload: BotAPICTSLogoutPayload,
    public sender: { host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): CTSLogoutEvent {
    return new CTSLogoutEvent(
      new BotAccount(this.botId, this.sender.host),
      rawCommand,
      this.payload.data.userHuid
    );
  }
} 