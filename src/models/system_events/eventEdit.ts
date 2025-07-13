import { BotAPISystemEventTypes, BotAccount, IncomingAttachment } from "@models";
import { Entity } from "../message/incomingMessage";

export class EventEdit {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, unknown>,
    public body: string | null,
    public syncId: string,
    public chatId: string,
    public huid: string,
    public attachments: IncomingAttachment[],
    public entities: Entity[]
  ) {}
}

export interface BotAPIEventEditData {
  body?: string | null;
}

export interface BotAPIEventEditPayload {
  body: BotAPISystemEventTypes.EVENT_EDIT;
  data: BotAPIEventEditData;
}

export interface BotAPIEventEdit {
  botId: string;
  command: BotAPIEventEditPayload;
  from: {
    groupChatId: string;
    userHuid: string;
    host: string;
  };
  syncId: string;
  attachments: IncomingAttachment[];
  entities: Entity[];
}

export function toDomainEventEdit(
  api: BotAPIEventEdit,
  rawCommand: Record<string, unknown>
): EventEdit {
  return new EventEdit(
    new BotAccount(api.botId, api.from.host),
    rawCommand,
    api.command.data.body ?? null,
    api.syncId,
    api.from.groupChatId,
    api.from.userHuid,
    api.attachments,
    api.entities
  );
} 