import { BotAPISystemEventTypes, IncomingChatTypes, BotAccount, Chat, BotSender } from "@models";

export class InternalBotNotificationEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, unknown>,
    public data: Record<string, unknown>,
    public opts: Record<string, unknown>,
    public chat: Chat,
    public sender: BotSender
  ) {}
}

export interface BotAPIInternalBotNotificationData {
  data: Record<string, unknown>;
  opts: Record<string, unknown>;
}

export interface BotAPIInternalBotNotificationPayload {
  body: BotAPISystemEventTypes.INTERNAL_BOT_NOTIFICATION;
  data: BotAPIInternalBotNotificationData;
}

export interface BotAPIBotContext {
  host: string;
  groupChatId: string;
  chatType: string;
  userHuid: string;
  isAdmin?: boolean | null;
  isCreator?: boolean | null;
}

export interface BotAPIInternalBotNotification {
  botId: string;
  command: BotAPIInternalBotNotificationPayload;
  from: BotAPIBotContext;
  toDomain(rawCommand: Record<string, unknown>): InternalBotNotificationEvent;
}

export function toDomainInternalBotNotification(
  api: BotAPIInternalBotNotification,
  rawCommand: Record<string, unknown>
): InternalBotNotificationEvent {
  return new InternalBotNotificationEvent(
    new BotAccount(api.botId, api.from.host),
    rawCommand,
    api.command.data.data,
    api.command.data.opts,
    new Chat(
      api.from.groupChatId,
      api.from.chatType as IncomingChatTypes
    ),
    new BotSender(
      api.from.userHuid,
      api.from.isAdmin ?? null,
      api.from.isCreator ?? null
    )
  );
} 