import { BotAccount, BotAPISystemEventTypes } from "@models";

export class ConferenceDeletedEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, any>,
    public callId: string
  ) {}
}

export class BotAPIConferenceDeletedData {
  constructor(
    public callId: string
  ) {}
}

export class BotAPIConferenceDeletedPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public data: BotAPIConferenceDeletedData
  ) {}
}

export class BotAPIConferenceDeleted {
  constructor(
    public botId: string,
    public payload: BotAPIConferenceDeletedPayload,
    public sender: { host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): ConferenceDeletedEvent {
    return new ConferenceDeletedEvent(
      new BotAccount(this.botId, this.sender.host),
      rawCommand,
      this.payload.data.callId
    );
  }
} 