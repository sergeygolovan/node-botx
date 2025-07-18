import { BotAPISystemEventTypes, BotAccount, IncomingAttachment } from "@models";
import { Entity } from "../message/incomingMessage";

export class EventEdit {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, any>,
    public body: string | null,
    public sync_id: string,
    public chat_id: string,
    public huid: string,
    public attachments: IncomingAttachment[],
    public entities: Entity[]
  ) {}
}

export class BotAPIEventEditData {
  constructor(
    public body?: string | null
  ) {}
}

export class BotAPIEventEditPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public data: BotAPIEventEditData
  ) {}
}

export class BotAPIEventEdit {
  constructor(
    public bot_id: string,
    public payload: BotAPIEventEditPayload,
    public sender: {
      group_chat_id: string;
      user_huid: string;
      host: string;
    },
    public sync_id: string,
    public attachments: IncomingAttachment[],
    public entities: Entity[]
  ) {}

  toDomain(rawCommand: Record<string, any>): EventEdit {
    return new EventEdit(
      new BotAccount(this.bot_id, this.sender.host),
      rawCommand,
      this.payload.data.body ?? null,
      this.sync_id,
      this.sender.group_chat_id,
      this.sender.user_huid,
      this.attachments,
      this.entities
    );
  }
} 