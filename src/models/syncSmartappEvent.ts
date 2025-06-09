import { Missing, Undefined } from "../missing";
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

type AnyDict = Record<string, any>;

export class BotAPISyncSmartAppSender {
  constructor(
    public user_huid: string,
    public udid?: string,
    public platform?: BotAPIClientPlatforms | null
  ) {}
}

export class BotAPISyncSmartAppPayload {
  constructor(public data: AnyDict, public files: APIAsyncFile[]) {}
}

export class BotAPISyncSmartAppEvent {
  constructor(
    public bot_id: string,
    public group_chat_id: string,
    public sender_info: BotAPISyncSmartAppSender,
    public method: string,
    public payload: BotAPISyncSmartAppPayload
  ) {}

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
      null
    );

    const sender = new UserSender(
      this.sender_info.user_huid,
      this.sender_info.udid,
      device,
      null,
      null,
      null,
      null,
      null
    );

    return new SmartAppEvent(
      new BotAccount(this.bot_id, null),
      new Chat(this.group_chat_id, ChatTypes.PERSONAL_CHAT),
      sender,
      {
        method: this.method,
        type: "smartapp_rpc",
        params: this.payload.data,
      },
      null,
      this.bot_id,
      null,
      this.payload.files.map(convertAsyncFileToDomain),
      null,
      rawSmartappEvent
    );
  }
}

export class BotAPISyncSmartAppEventResultResponse {
  constructor(public data: any, public files: APIAsyncFile[]) {}

  static fromDomain(
    data: any,
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
  constructor(
    public reason: string,
    public errors: any[],
    public errorData: Record<string, any>
  ) {}

  static fromDomain(
    reason: Missing<string> = Undefined,
    errors: Missing<any[]> = Undefined,
    errorData: Missing<Record<string, any>> = Undefined
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
      ...JSON.parse(JSON.stringify(this)),
    };
  }
}

// Объединённый тип для результата или ошибки
export type BotAPISyncSmartAppEventResponse =
  | BotAPISyncSmartAppEventResultResponse
  | BotAPISyncSmartAppEventErrorResponse;
