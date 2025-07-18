import { BOT_API_VERSION } from "@constants";
import { BotAccount } from "./botAccount";
import {
    APIChatTypes,
    BotAPIClientPlatforms,
    BotAPICommandTypes,
    BotAPISystemEventTypes,
} from "./enums";
import { IsString, IsUUID, IsOptional, IsBoolean, IsEnum, IsInt, Validate, IsObject, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";
import { Type } from "class-transformer";

// --- Кастомные валидаторы ---
@ValidatorConstraint({ name: "protoVersion", async: false })
export class ProtoVersionValidator implements ValidatorConstraintInterface {
  validate(value: number, _args: ValidationArguments) {
    return value === BOT_API_VERSION;
  }
  defaultMessage(_args: ValidationArguments) {
    return "Unsupported Bot API version";
  }
}

@ValidatorConstraint({ name: "systemEventType", async: false })
export class SystemEventTypeValidator implements ValidatorConstraintInterface {
  validate(body: string, _args: ValidationArguments) {
    return Object.values(BotAPISystemEventTypes).includes(body as any);
  }
  defaultMessage(_args: ValidationArguments) {
    return "Unknown system event";
  }
}

// --- МОДЕЛИ ---

export class BotAPICommandPayloadModel {
  @IsString()
  body!: string;

  @IsEnum(BotAPICommandTypes)
  command_type!: BotAPICommandTypes.USER;

  @IsObject()
  data!: Record<string, any>;

  @IsObject()
  metadata!: Record<string, any>;

  constructor(
    body: string,
    command_type: BotAPICommandTypes.USER,
    data: Record<string, any>,
    metadata: Record<string, any>
  ) {
    this.body = body;
    this.command_type = command_type;
    this.data = data;
    this.metadata = metadata;
  }
}

export class BotAPIDeviceMetaModel {
  @IsOptional()
  @IsBoolean()
  pushes?: boolean;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsObject()
  permissions?: Record<string, any>;

  constructor(
    pushes?: boolean,
    timezone?: string,
    permissions?: Record<string, any>
  ) {
    this.pushes = pushes;
    this.timezone = timezone;
    this.permissions = permissions;
  }
}

export class BaseBotAPIContextModel {
  @IsString()
  host!: string;

  constructor(host: string) {
    this.host = host;
  }
}

export class BotAPIUserContextModel extends BaseBotAPIContextModel {
  @IsUUID()
  user_huid!: string;

  @IsOptional()
  @IsUUID()
  user_udid?: string;

  @IsOptional()
  @IsString()
  ad_domain?: string;

  @IsOptional()
  @IsString()
  ad_login?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsBoolean()
  is_admin?: boolean;

  @IsOptional()
  @IsBoolean()
  is_creator?: boolean;

  constructor(
    host: string,
    user_huid: string,
    user_udid?: string,
    ad_domain?: string,
    ad_login?: string,
    username?: string,
    is_admin?: boolean,
    is_creator?: boolean
  ) {
    super(host);
    this.user_huid = user_huid;
    this.user_udid = user_udid;
    this.ad_domain = ad_domain;
    this.ad_login = ad_login;
    this.username = username;
    this.is_admin = is_admin;
    this.is_creator = is_creator;
  }
}

export class BotAPIChatContextModel extends BaseBotAPIContextModel {
  @IsUUID()
  group_chat_id!: string;

  @IsEnum(APIChatTypes)
  chat_type!: APIChatTypes | string;

  constructor(host: string, group_chat_id: string, chat_type: APIChatTypes | string) {
    super(host);
    this.group_chat_id = group_chat_id;
    this.chat_type = chat_type;
  }
}

export class BotAPIDeviceContextModel extends BaseBotAPIContextModel {
  @IsOptional()
  @IsString()
  app_version?: string;

  @IsOptional()
  @IsEnum(BotAPIClientPlatforms)
  platform?: BotAPIClientPlatforms;

  @IsOptional()
  @IsString()
  platform_package_id?: string;

  @IsOptional()
  @IsString()
  device?: string;

  @IsOptional()
  @Type(() => BotAPIDeviceMetaModel)
  device_meta?: BotAPIDeviceMetaModel;

  @IsOptional()
  @IsString()
  device_software?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  locale?: string;

  constructor(
    host: string,
    app_version?: string,
    platform?: BotAPIClientPlatforms,
    platform_package_id?: string,
    device?: string,
    device_meta?: BotAPIDeviceMetaModel,
    device_software?: string,
    manufacturer?: string,
    locale?: string
  ) {
    super(host);
    this.app_version = app_version;
    this.platform = platform;
    this.platform_package_id = platform_package_id;
    this.device = device;
    this.device_meta = device_meta;
    this.device_software = device_software;
    this.manufacturer = manufacturer;
    this.locale = locale;
  }
}

export class BotAPIBaseCommandModel {
  @IsUUID()
  bot_id!: string;

  @IsUUID()
  sync_id!: string;

  @IsInt()
  @Validate(ProtoVersionValidator)
  proto_version!: number;

  constructor(bot_id: string, sync_id: string, proto_version: number) {
    this.bot_id = bot_id;
    this.sync_id = sync_id;
    this.proto_version = proto_version;
  }
}

export class BotAPIBaseSystemEventPayloadModel {
  @IsEnum(BotAPICommandTypes)
  command_type!: BotAPICommandTypes.SYSTEM;

  @IsString()
  @Validate(SystemEventTypeValidator)
  body!: string;

  constructor(command_type: BotAPICommandTypes.SYSTEM, body: string) {
    this.command_type = command_type;
    this.body = body;
  }
}

// Базовый класс для команд, соответствующий Python BotCommandBase
export interface BotCommandBase {
  bot: BotAccount;
  raw_command?: Record<string, any>;
}




