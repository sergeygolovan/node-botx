import { BotAccount, Chat, BotAPICommandTypes, BotAPISystemEventTypes, convertChatTypeToDomain } from "@models";

export class DeletedFromChatEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, any>,
    public huids: string[],
    public chat: Chat
  ) {}
}

export class BotAPIDeletedFromChatData {
  constructor(
    public deleted_members: string[]
  ) {}
}

export class BotAPIDeletedFromChatPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public command_type: BotAPICommandTypes,
    public data: BotAPIDeletedFromChatData
  ) {}
}

export class BotAPIDeletedFromChat {
  constructor(
    public bot_id: string,
    public payload: BotAPIDeletedFromChatPayload,
    public sender: { group_chat_id: string; chat_type: string; host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): DeletedFromChatEvent {
    return new DeletedFromChatEvent(
      new BotAccount(this.bot_id, this.sender.host),
      rawCommand,
      this.payload.data.deleted_members,
      new Chat(
        this.sender.group_chat_id,
        convertChatTypeToDomain(this.sender.chat_type)
      )
    );
  }
} 