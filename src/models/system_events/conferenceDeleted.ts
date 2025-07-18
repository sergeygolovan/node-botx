import { BotAccount, BotAPISystemEventTypes } from "@models";

export class ConferenceDeletedEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, any>,
    public call_id: string
  ) {}
}

export class BotAPIConferenceDeletedData {
  constructor(
    public call_id: string
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
    public bot_id: string,
    public payload: BotAPIConferenceDeletedPayload,
    public sender: { host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): ConferenceDeletedEvent {
    return new ConferenceDeletedEvent(
      new BotAccount(this.bot_id, this.sender.host),
      rawCommand,
      this.payload.data.call_id
    );
  }
} 