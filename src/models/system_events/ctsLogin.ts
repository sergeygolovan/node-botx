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
    public userHuid: string
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
    public botId: string,
    public payload: BotAPICTSLoginPayload,
    public sender: { host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): CTSLoginEvent {
    return new CTSLoginEvent(
      new BotAccount(this.botId, this.sender.host),
      rawCommand,
      this.payload.data.userHuid
    );
  }
} 