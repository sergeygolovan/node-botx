import { BotAccount, BotAPISystemEventTypes } from "@models";

export class ConferenceCreatedEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, any>,
    public call_id: string
  ) {}
}

export class BotAPIConferenceCreatedData {
  constructor(
    public call_id: string
  ) {}
}

export class BotAPIConferenceCreatedPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public data: BotAPIConferenceCreatedData
  ) {}
}

export class BotAPIConferenceCreated {
  constructor(
    public bot_id: string,
    public payload: BotAPIConferenceCreatedPayload,
    public sender: { host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): ConferenceCreatedEvent {
    return new ConferenceCreatedEvent(
      new BotAccount(this.bot_id, this.sender.host),
      rawCommand,
      this.payload.data.call_id
    );
  }
} 