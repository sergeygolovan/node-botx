import { BotAPISystemEventTypes, IncomingChatTypes, BotAccount, Chat } from "@models";

export class LeftFromChatEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, unknown>,
    public huids: string[], // UUID[] как string[]
    public chat: Chat
  ) {}
}

export interface BotAPILeftFromChatData {
  leftMembers: string[]; // UUID[] как string[]
}

export interface BotAPILeftFromChatPayload {
  body: BotAPISystemEventTypes.LEFT_FROM_CHAT;
  data: BotAPILeftFromChatData;
}

export interface BotAPILeftFromChat {
  botId: string;
  command: BotAPILeftFromChatPayload;
  from: {
    host: string;
    groupChatId: string;
    chatType: string;
  };
}

export function toDomainLeftFromChat(
  api: BotAPILeftFromChat,
  rawCommand: Record<string, unknown>
): LeftFromChatEvent {
  return new LeftFromChatEvent(
    new BotAccount(api.botId, api.from.host),
    rawCommand,
    api.command.data.leftMembers,
    new Chat(
      api.from.groupChatId,
      api.from.chatType as IncomingChatTypes
    )
  );
} 