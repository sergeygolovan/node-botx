import { BotAPISystemEventTypes, IncomingChatTypes, BotAccount, Chat } from "@models";

export class JoinToChatEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, unknown>,
    public huids: string[], // UUID[] как string[]
    public chat: Chat
  ) {}
}

export interface BotAPIJoinToChatData {
  addedMembers: string[]; // UUID[] как string[]
}

export interface BotAPIJoinToChatPayload {
  body: BotAPISystemEventTypes.JOIN_TO_CHAT;
  data: BotAPIJoinToChatData;
}

export interface BotAPIJoinToChat {
  botId: string;
  command: BotAPIJoinToChatPayload;
  from: {
    host: string;
    groupChatId: string;
    chatType: string;
  };
}

export function toDomainJoinToChat(
  api: BotAPIJoinToChat,
  rawCommand: Record<string, unknown>
): JoinToChatEvent {
  return new JoinToChatEvent(
    new BotAccount(api.botId, api.from.host),
    rawCommand,
    api.command.data.addedMembers,
    new Chat(
      api.from.groupChatId,
      api.from.chatType as IncomingChatTypes
    )
  );
} 