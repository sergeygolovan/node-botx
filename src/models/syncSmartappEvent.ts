import { Missing, Undefined } from "@missing";
import {
    APIAsyncFile,
    convertAsyncFileFromDomain,
    convertAsyncFileToDomain,
    File,
} from "./asyncFiles";
import { BotAccount } from "./botAccount";
import { Chat } from "./chats";
import {
    BotAPIClientPlatforms,
    ChatTypes,
    convertClientPlatformToDomain,
} from "./enums";
import { SmartAppEvent } from "./system_events/smartappEvent";
import { UserDevice, UserSender } from "./message/incomingMessage";
import { IsUUID, IsString, IsOptional, IsArray, ValidateNested, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

type AnyDict = Record<string, unknown>;

export class BotAPISyncSmartAppSender {
  @IsUUID()
  user_huid!: string;

  @IsOptional()
  @IsUUID()
  udid?: string;

  @IsOptional()
  @IsEnum(BotAPIClientPlatforms)
  platform?: BotAPIClientPlatforms;

  constructor(
    user_huid: string,
    udid?: string,
    platform?: BotAPIClientPlatforms | null
  ) {
    this.user_huid = user_huid;
    this.udid = udid || undefined;
    this.platform = platform || undefined;
  }
}

export class BotAPISyncSmartAppPayload {
  @IsObject()
  data!: AnyDict;

  @IsArray()
  files!: APIAsyncFile[];

  constructor(data: AnyDict, files: APIAsyncFile[]) {
    this.data = data;
    this.files = files;
  }
}

export class BotAPISyncSmartAppEvent {
  @IsUUID()
  bot_id!: string;

  @IsUUID()
  group_chat_id!: string;

  @ValidateNested()
  @Type(() => BotAPISyncSmartAppSender)
  sender_info!: BotAPISyncSmartAppSender;

  @IsString()
  method!: string;

  @ValidateNested()
  @Type(() => BotAPISyncSmartAppPayload)
  payload!: BotAPISyncSmartAppPayload;

  constructor(
    bot_id: string,
    group_chat_id: string,
    sender_info: BotAPISyncSmartAppSender,
    method: string,
    payload: BotAPISyncSmartAppPayload
  ) {
    this.bot_id = bot_id;
    this.group_chat_id = group_chat_id;
    this.sender_info = sender_info;
    this.method = method;
    this.payload = payload;
  }

  toDomain(rawSmartappEvent: AnyDict): SmartAppEvent {
    const platform = this.sender_info.platform
      ? convertClientPlatformToDomain(this.sender_info.platform)
      : null;

    const device = new UserDevice(
      platform,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );

    const sender = new UserSender(
      this.sender_info.user_huid,
      this.sender_info.udid,
      null,
      null,
      null,
      null,
      null,
      device
    );

    return new SmartAppEvent(
      new BotAccount(this.bot_id, null), // bot
      this.bot_id, // smartappId
      {
        method: this.method,
        type: "smartapp_rpc",
        params: this.payload.data,
      }, // data
      this.payload.files.map(convertAsyncFileToDomain), // files
      new Chat(this.group_chat_id, ChatTypes.PERSONAL_CHAT), // chat
      sender, // sender
      rawSmartappEvent, // rawCommand
      null, // ref
      null, // opts
      null // smartappApiVersion
    );
  }
}

export class BotAPISyncSmartAppEventResultResponse {
  data!: Record<string, unknown>;

  @IsArray()
  files!: APIAsyncFile[];

  constructor(data: Record<string, unknown>, files: APIAsyncFile[]) {
    this.data = data;
    this.files = files;
  }

  static fromDomain(
    data: Record<string, unknown>,
    files: Missing<File[]> = Undefined
  ): BotAPISyncSmartAppEventResultResponse {
    const apiAsyncFiles =
      files !== Undefined ? files.map(convertAsyncFileFromDomain) : [];
    return new BotAPISyncSmartAppEventResultResponse(data, apiAsyncFiles);
  }

  jsonableDict(): AnyDict {
    return {
      status: "ok",
      result: JSON.parse(JSON.stringify(this)), // простой сериализованный объект
    };
  }
}

export class BotAPISyncSmartAppEventErrorResponse {
  @IsString()
  reason!: string;

  @IsArray()
  errors!: Record<string, unknown>[];

  @IsObject()
  error_data!: Record<string, any>;

  constructor(
    reason: string,
    errors: Record<string, unknown>[],
    error_data: Record<string, unknown>
  ) {
    this.reason = reason;
    this.errors = errors;
    this.error_data = error_data;
  }

  static fromDomain(
    reason: Missing<string> = Undefined,
    errors: Missing<Record<string, unknown>[]> = Undefined,
    errorData: Missing<Record<string, unknown>> = Undefined
  ): BotAPISyncSmartAppEventErrorResponse {
    return new BotAPISyncSmartAppEventErrorResponse(
      reason === Undefined ? "smartapp_error" : reason,
      errors === Undefined ? [] : errors,
      errorData === Undefined ? {} : errorData
    );
  }

  jsonableDict(): AnyDict {
    return {
      status: "error",
      reason: this.reason,
      errors: this.errors,
      error_data: this.error_data,
    };
  }
}

export type BotAPISyncSmartAppEventResponse =
  | BotAPISyncSmartAppEventResultResponse
  | BotAPISyncSmartAppEventErrorResponse;
