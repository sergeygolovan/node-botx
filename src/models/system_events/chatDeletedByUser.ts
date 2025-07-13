import { BotAccount, BotAPISystemEventTypes } from "@models";

export class ChatDeletedByUserEvent {
  constructor(
    public syncId: string,
    public bot: BotAccount,
    public chatId: string,
    public huid: string,
    public rawCommand: Record<string, any>
  ) {}
}

export class BotAPIChatDeletedByUserData {
  constructor(
    public userHuid: string,
    public groupChatId: string
  ) {}
}

export class BotAPIChatDeletedByUserPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public data: BotAPIChatDeletedByUserData
  ) {}
}

export class BotAPIChatDeletedByUser {
  constructor(
    public syncId: string,
    public botId: string,
    public payload: BotAPIChatDeletedByUserPayload,
    public sender: { host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): ChatDeletedByUserEvent {
    return new ChatDeletedByUserEvent(
      this.syncId,
      new BotAccount(this.botId, this.sender.host),
      this.payload.data.groupChatId,
      this.payload.data.userHuid,
      rawCommand
    );
  }
} 