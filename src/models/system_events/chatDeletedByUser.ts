import { BotAccount, BotAPISystemEventTypes } from "@models";

export class ChatDeletedByUserEvent {
  constructor(
    public sync_id: string,
    public bot: BotAccount,
    public chat_id: string,
    public huid: string,
    public rawCommand: Record<string, any>
  ) {}
}

export class BotAPIChatDeletedByUserData {
  constructor(
    public user_huid: string,
    public group_chat_id: string
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
    public sync_id: string,
    public bot_id: string,
    public payload: BotAPIChatDeletedByUserPayload,
    public sender: { host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): ChatDeletedByUserEvent {
    return new ChatDeletedByUserEvent(
      this.sync_id,
      new BotAccount(this.bot_id, this.sender.host),
      this.payload.data.group_chat_id,
      this.payload.data.user_huid,
      rawCommand
    );
  }
} 