import { APIChatTypes, convertChatTypeToDomain, IncomingChatTypes } from "./enums";
import { IncomingMessage } from "./message/incomingMessage";

export type BotMenu = Record<string, string>;

export class StatusRecipient {
  constructor(
    public botId: string,
    public huid: string,
    public adLogin: string | null,
    public adDomain: string | null,
    public isAdmin: boolean | null,
    public chatType: IncomingChatTypes,
  ) {}

  static fromIncomingMessage(incomingMessage: IncomingMessage): StatusRecipient {
    return new StatusRecipient(
      incomingMessage.bot.id,
      incomingMessage.sender.huid,
      incomingMessage.sender.adLogin ?? null,
      incomingMessage.sender.adDomain ?? null,
      incomingMessage.sender.isChatAdmin ?? null,
      incomingMessage.chat.type,
    );
  }
}

export class BotAPIStatusRecipient {
  constructor(
    public botId: string,
    public userHuid: string,
    public adLogin: string | null,
    public adDomain: string | null,
    public isAdmin: boolean | null,
    public chatType: APIChatTypes | string,
  ) {}

  // Замена пустых строк на null (эмулирует валидатор)
  static normalizeField<T extends string | boolean | null>(fieldValue: T): T | null {
    return fieldValue === "" ? null : fieldValue;
  }

  static fromRaw(data: {
    botId: string;
    userHuid: string;
    adLogin?: string | null;
    adDomain?: string | null;
    isAdmin?: boolean | null;
    chatType: APIChatTypes | string;
  }): BotAPIStatusRecipient {
    return new BotAPIStatusRecipient(
      data.botId,
      data.userHuid,
      this.normalizeField(data.adLogin ?? null),
      this.normalizeField(data.adDomain ?? null),
      this.normalizeField(data.isAdmin ?? null),
      data.chatType,
    );
  }

  toDomain(): StatusRecipient {
    return new StatusRecipient(
      this.botId,
      this.userHuid,
      this.adLogin,
      this.adDomain,
      this.isAdmin,
      convertChatTypeToDomain(this.chatType),
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
    public statusMessage?: string,
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
    ([command, description]) => new BotAPIBotMenuItem(command, command, description),
  );

  const status = new BotAPIStatus(
    new BotAPIStatusResult(commands, true, "Bot is working"),
  );

  // Эмулируем asdict из Python, преобразуя объект в plain object
  return {
    status: status.status,
    result: {
      commands: status.result.commands.map(item => ({
        description: item.description,
        body: item.body,
        name: item.name,
      })),
      enabled: status.result.enabled,
      status_message: status.result.statusMessage,
    }
  };
}