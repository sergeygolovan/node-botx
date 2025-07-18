import { APIChatTypes, convertChatTypeToDomain } from "./enums";
import { IsUUID, IsString, IsOptional, IsBoolean, IsEnum } from "class-validator";

export type BotMenu = Record<string, string>;

export class StatusRecipient {
  @IsUUID()
  bot_id: string;

  @IsUUID()
  huid: string;

  @IsOptional()
  @IsString()
  ad_login: string | null;

  @IsOptional()
  @IsString()
  ad_domain: string | null;

  @IsOptional()
  @IsBoolean()
  is_admin: boolean | null;

  @IsEnum(APIChatTypes)
  chat_type: APIChatTypes | string;

  constructor(
    bot_id: string,
    huid: string,
    ad_login: string | null,
    ad_domain: string | null,
    is_admin: boolean | null,
    chat_type: APIChatTypes | string,
  ) {
    this.bot_id = bot_id;
    this.huid = huid;
    this.ad_login = ad_login;
    this.ad_domain = ad_domain;
    this.is_admin = is_admin;
    this.chat_type = chat_type;
  }
}

export class BotAPIStatusRecipient {
  @IsUUID()
  bot_id: string;

  @IsUUID()
  user_huid: string;

  @IsOptional()
  @IsString()
  ad_login: string | null;

  @IsOptional()
  @IsString()
  ad_domain: string | null;

  @IsOptional()
  @IsBoolean()
  is_admin: boolean | null;

  @IsEnum(APIChatTypes)
  chat_type: APIChatTypes | string;

  constructor(
    bot_id: string,
    user_huid: string,
    ad_login: string | null,
    ad_domain: string | null,
    is_admin: boolean | null,
    chat_type: APIChatTypes | string,
  ) {
    this.bot_id = bot_id;
    this.user_huid = user_huid;
    this.ad_login = ad_login;
    this.ad_domain = ad_domain;
    this.is_admin = is_admin;
    this.chat_type = chat_type;
  }

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
  @IsString()
  description: string;

  @IsString()
  body: string;

  @IsString()
  name: string;

  constructor(
    description: string,
    body: string,
    name: string
  ) {
    this.description = description;
    this.body = body;
    this.name = name;
  }
}

export type BotAPIBotMenu = BotAPIBotMenuItem[];

export class BotAPIStatusResult {
  @IsString()
  commands: BotAPIBotMenu;

  @IsBoolean()
  enabled: true = true;

  @IsOptional()
  @IsString()
  status_message?: string;

  constructor(
    commands: BotAPIBotMenu,
    enabled: true = true,
    status_message?: string
  ) {
    this.commands = commands;
    this.enabled = enabled;
    this.status_message = status_message;
  }
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

  // Эмулируем asdict из Python, преобразуя объект в plain object
  return status;
}