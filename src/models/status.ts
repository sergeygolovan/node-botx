import { APIChatTypes, convertChatTypeToDomain, IncomingChatTypes } from "./enums";

export type BotMenu = Record<string, string>;

export class StatusRecipient {
  constructor(
    public bot_id: string,
    public huid: string,
    public ad_login: string | null,
    public ad_domain: string | null,
    public is_admin: boolean | null,
    public chat_type: IncomingChatTypes,
  ) {}

  static fromIncomingMessage(incomingMessage: IncomingMessage): StatusRecipient {
    return new StatusRecipient(
      incomingMessage.bot.id,
      incomingMessage.sender.huid,
      incomingMessage.sender.ad_login ?? null,
      incomingMessage.sender.ad_domain ?? null,
      incomingMessage.sender.is_chat_admin ?? null,
      incomingMessage.chat.type,
    );
  }
}

export class BotAPIStatusRecipient {
  constructor(
    public bot_id: string,
    public user_huid: string,
    public ad_login: string | null,
    public ad_domain: string | null,
    public is_admin: boolean | null,
    public chat_type: APIChatTypes | string,
  ) {}

  // Замена пустых строк на null (эмулирует валидатор)
  static normalizeField<T extends string | boolean | null>(fieldValue: T): T | null {
    return fieldValue === "" ? null : fieldValue;
  }

  static fromRaw(data: {
    bot_id: string;
    user_huid: string;
    ad_login?: string | null;
    ad_domain?: string | null;
    is_admin?: boolean | null;
    chat_type: APIChatTypes | string;
  }): BotAPIStatusRecipient {
    return new BotAPIStatusRecipient(
      data.bot_id,
      data.user_huid,
      this.normalizeField(data.ad_login ?? null),
      this.normalizeField(data.ad_domain ?? null),
      this.normalizeField(data.is_admin ?? null),
      data.chat_type,
    );
  }

  toDomain(): StatusRecipient {
    return new StatusRecipient(
      this.bot_id,
      this.user_huid,
      this.ad_login,
      this.ad_domain,
      this.is_admin,
      convertChatTypeToDomain(this.chat_type),
    );
  }
}

export class BotAPIBotMenuItem {
  constructor(
    public description: string,
    public body: string,
    public name: string,
  ) {}
}

export type BotAPIBotMenu = BotAPIBotMenuItem[];

export class BotAPIStatusResult {
  constructor(
    public commands: BotAPIBotMenu,
    public enabled: true = true,
    public status_message?: string,
  ) {}
}

export class BotAPIStatus {
  constructor(
    public result: BotAPIStatusResult,
    public status: "ok" = "ok",
  ) {}
}

export function buildBotStatusResponse(botMenu: BotMenu): object {
  const commands = Object.entries(botMenu).map(
    ([command, description]) => new BotAPIBotMenuItem(description, command, command),
  );

  const status = new BotAPIStatus(
    new BotAPIStatusResult(commands, true, "Bot is working"),
  );

  return JSON.parse(JSON.stringify(status));
}