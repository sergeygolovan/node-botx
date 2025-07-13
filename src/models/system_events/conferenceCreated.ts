import { BotAccount, BotAPISystemEventTypes } from "@models";

export class ConferenceCreatedEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, any>,
    public callId: string
  ) {}
}

export class BotAPIConferenceCreatedData {
  constructor(
    public callId: string
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
    public botId: string,
    public payload: BotAPIConferenceCreatedPayload,
    public sender: { host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): ConferenceCreatedEvent {
    return new ConferenceCreatedEvent(
      new BotAccount(this.botId, this.sender.host),
      rawCommand,
      this.payload.data.callId
    );
  }
} 