import { BotAPISystemEventTypes, BotAccount, Chat, BotSender, convertChatTypeToDomain } from "@models";

export class InternalBotNotificationEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, any>,
    public data: Record<string, any>,
    public opts: Record<string, any>,
    public chat: Chat,
    public sender: BotSender
  ) {}
}

export class BotAPIInternalBotNotificationData {
  constructor(
    public data: Record<string, any>,
    public opts: Record<string, any>
  ) {}
}

export class BotAPIInternalBotNotificationPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public data: BotAPIInternalBotNotificationData
  ) {}
}

export class BotAPIBotContext {
  constructor(
    public host: string,
    public group_chat_id: string,
    public chat_type: string,
    public user_huid: string,
    public is_admin?: boolean | null,
    public is_creator?: boolean | null
  ) {}
}

export class BotAPIInternalBotNotification {
  constructor(
    public bot_id: string,
    public payload: BotAPIInternalBotNotificationPayload,
    public sender: BotAPIBotContext
  ) {}

  toDomain(rawCommand: Record<string, any>): InternalBotNotificationEvent {
    return new InternalBotNotificationEvent(
      new BotAccount(this.bot_id, this.sender.host),
      rawCommand,
      this.payload.data.data,
      this.payload.data.opts,
      new Chat(
        this.sender.group_chat_id,
        convertChatTypeToDomain(this.sender.chat_type)
      ),
      new BotSender(
        this.sender.user_huid,
        this.sender.is_admin ?? null,
        this.sender.is_creator ?? null
      )
    );
  }
} 