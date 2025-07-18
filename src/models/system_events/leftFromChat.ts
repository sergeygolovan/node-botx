import { BotAccount, Chat, BotAPISystemEventTypes, convertChatTypeToDomain } from "@models";

export class LeftFromChatEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, any>,
    public huids: string[],
    public chat: Chat
  ) {}
}

export class BotAPILeftFromChatData {
  constructor(
    public left_members: string[]
  ) {}
}

export class BotAPILeftFromChatPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public data: BotAPILeftFromChatData
  ) {}
}

export class BotAPILeftFromChat {
  constructor(
    public bot_id: string,
    public payload: BotAPILeftFromChatPayload,
    public sender: { group_chat_id: string; chat_type: string; host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): LeftFromChatEvent {
    return new LeftFromChatEvent(
      new BotAccount(this.bot_id, this.sender.host),
      rawCommand,
      this.payload.data.left_members,
      new Chat(
        this.sender.group_chat_id,
        convertChatTypeToDomain(this.sender.chat_type)
      )
    );
  }
} 