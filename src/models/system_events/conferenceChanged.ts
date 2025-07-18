import { BotAccount, BotAPIConferenceLinkTypes, BotAPISystemEventTypes, ConferenceLinkTypes, convertConferenceLinkTypeToDomain } from "@models";

export class ConferenceChangedEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, any>,
    public access_code: string | null,
    public actor: string | null,
    public added_users: string[],
    public admins: string[],
    public call_id: string,
    public deleted_users: string[],
    public end_at: Date | null,
    public link: string,
    public link_id: string,
    public link_type: ConferenceLinkTypes,
    public members: string[],
    public name: string,
    public operation: string,
    public sip_number: number,
    public start_at: Date
  ) {}
}

export class BotAPIConferenceChangedData {
  constructor(
    public access_code: string | null,
    public actor: string | null,
    public added_users: string[],
    public admins: string[],
    public call_id: string,
    public deleted_users: string[],
    public end_at: Date | null,
    public link: string,
    public link_id: string,
    public link_type: BotAPIConferenceLinkTypes,
    public members: string[],
    public name: string,
    public operation: string,
    public sip_number: number,
    public start_at: Date
  ) {}
}

export class BotAPIConferenceChangedPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public data: BotAPIConferenceChangedData
  ) {}
}

export class BotAPIConferenceChanged {
  constructor(
    public bot_id: string,
    public payload: BotAPIConferenceChangedPayload,
    public sender: { host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): ConferenceChangedEvent {
    return new ConferenceChangedEvent(
      new BotAccount(this.bot_id, this.sender.host),
      rawCommand,
      this.payload.data.access_code,
      this.payload.data.actor,
      this.payload.data.added_users,
      this.payload.data.admins,
      this.payload.data.call_id,
      this.payload.data.deleted_users,
      this.payload.data.end_at,
      this.payload.data.link,
      this.payload.data.link_id,
      convertConferenceLinkTypeToDomain(this.payload.data.link_type),
      this.payload.data.members,
      this.payload.data.name,
      this.payload.data.operation,
      this.payload.data.sip_number,
      this.payload.data.start_at
    );
  }
} 