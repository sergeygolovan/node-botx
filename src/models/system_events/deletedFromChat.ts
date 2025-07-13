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
    public deletedMembers: string[]
  ) {}
}

export class BotAPIDeletedFromChatPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public commandType: BotAPICommandTypes,
    public data: BotAPIDeletedFromChatData
  ) {}
}

export class BotAPIDeletedFromChat {
  constructor(
    public botId: string,
    public payload: BotAPIDeletedFromChatPayload,
    public sender: { groupChatId: string; chatType: string; host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): DeletedFromChatEvent {
    return new DeletedFromChatEvent(
      new BotAccount(this.botId, this.sender.host),
      rawCommand,
      this.payload.data.deletedMembers,
      new Chat(
        this.sender.groupChatId,
        convertChatTypeToDomain(this.sender.chatType)
      )
    );
  }
} 