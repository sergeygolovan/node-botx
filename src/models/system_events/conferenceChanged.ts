import { BotAccount, BotAPIConferenceLinkTypes, BotAPISystemEventTypes, ConferenceLinkTypes, convertConferenceLinkTypeToDomain } from "@models";

export class ConferenceChangedEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, any>,
    public accessCode: string | null,
    public actor: string | null,
    public addedUsers: string[],
    public admins: string[],
    public callId: string,
    public deletedUsers: string[],
    public endAt: Date | null,
    public link: string,
    public linkId: string,
    public linkType: ConferenceLinkTypes,
    public members: string[],
    public name: string,
    public operation: string,
    public sipNumber: number,
    public startAt: Date
  ) {}
}

export class BotAPIConferenceChangedData {
  constructor(
    public accessCode: string | null,
    public actor: string | null,
    public addedUsers: string[],
    public admins: string[],
    public callId: string,
    public deletedUsers: string[],
    public endAt: Date | null,
    public link: string,
    public linkId: string,
    public linkType: BotAPIConferenceLinkTypes,
    public members: string[],
    public name: string,
    public operation: string,
    public sipNumber: number,
    public startAt: Date
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
    public botId: string,
    public payload: BotAPIConferenceChangedPayload,
    public sender: { host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): ConferenceChangedEvent {
    return new ConferenceChangedEvent(
      new BotAccount(this.botId, this.sender.host),
      rawCommand,
      this.payload.data.accessCode,
      this.payload.data.actor,
      this.payload.data.addedUsers,
      this.payload.data.admins,
      this.payload.data.callId,
      this.payload.data.deletedUsers,
      this.payload.data.endAt,
      this.payload.data.link,
      this.payload.data.linkId,
      convertConferenceLinkTypeToDomain(this.payload.data.linkType),
      this.payload.data.members,
      this.payload.data.name,
      this.payload.data.operation,
      this.payload.data.sipNumber,
      this.payload.data.startAt
    );
  }
} 