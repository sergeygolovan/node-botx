import { BotAccount, Chat, BotAPISystemEventTypes, convertChatTypeToDomain } from "@models";

export class JoinToChatEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, any>,
    public huids: string[],
    public chat: Chat
  ) {}
}

export class BotAPIJoinToChatData {
  constructor(
    public added_members: string[]
  ) {}
}

export class BotAPIJoinToChatPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public data: BotAPIJoinToChatData
  ) {}
}

export class BotAPIJoinToChat {
  constructor(
    public bot_id: string,
    public payload: BotAPIJoinToChatPayload,
    public sender: { group_chat_id: string; chat_type: string; host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): JoinToChatEvent {
    return new JoinToChatEvent(
      new BotAccount(this.bot_id, this.sender.host),
      rawCommand,
      this.payload.data.added_members,
      new Chat(
        this.sender.group_chat_id,
        convertChatTypeToDomain(this.sender.chat_type)
      )
    );
  }
} 