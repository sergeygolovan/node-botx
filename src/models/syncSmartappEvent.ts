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

type AnyDict = Record<string, any>;

export class BotAPISyncSmartAppSender {
  constructor(
    public userHuid: string,
    public udid?: string,
    public platform?: BotAPIClientPlatforms | null
  ) {}
}

export class BotAPISyncSmartAppPayload {
  constructor(public data: AnyDict, public files: APIAsyncFile[]) {}
}

export class BotAPISyncSmartAppEvent {
  constructor(
    public botId: string,
    public groupChatId: string,
    public senderInfo: BotAPISyncSmartAppSender,
    public method: string,
    public payload: BotAPISyncSmartAppPayload
  ) {}

  toDomain(rawSmartappEvent: AnyDict): SmartAppEvent {
    const platform = this.senderInfo.platform
      ? convertClientPlatformToDomain(this.senderInfo.platform)
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
      this.senderInfo.userHuid,
      this.senderInfo.udid,
      null,
      null,
      null,
      null,
      null,
      device
    );

    return new SmartAppEvent(
      null, // ref
      this.botId, // smartappId
      this.payload.data, // data
      null, // opts
      null, // smartappApiVersion
      this.payload.files.map(convertAsyncFileToDomain), // files
      new Chat(this.groupChatId, ChatTypes.PERSONAL_CHAT), // chat
      sender, // sender
      new BotAccount(this.botId, null), // bot
      rawSmartappEvent // rawCommand
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
    public error_data: Record<string, any>
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
