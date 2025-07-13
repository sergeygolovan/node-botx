import { z } from "zod";
import { BOT_API_VERSION } from "@constants";
import { BotAccount } from "./botAccount";
import {
    APIChatTypes,
    BotAPIClientPlatforms,
    BotAPICommandTypes,
    BotAPISystemEventTypes,
} from "./enums";
import type { BotAPICommand } from "./commands";
import type { BotAPIIncomingMessage } from "./message/incomingMessage";
import { BotAPISmartAppEvent, BotAPISmartAppPayload, BotAPISmartAppEventContext } from "./system_events/smartappEvent";
import type { BotAPIInternalBotNotification } from "./system_events/internalBotNotification";
import { BotAPIChatCreated } from "./system_events/chatCreated";
import { BotAPIChatDeletedByUser } from "./system_events/chatDeletedByUser";
import { BotAPIAddedToChat } from "./system_events/addedToChat";
import { BotAPIDeletedFromChat } from "./system_events/deletedFromChat";
import type { BotAPILeftFromChat } from "./system_events/leftFromChat";
import { BotAPICTSLogin } from "./system_events/ctsLogin";
import { BotAPICTSLogout } from "./system_events/ctsLogout";
import type { BotAPIEventEdit } from "./system_events/eventEdit";
import type { BotAPIJoinToChat } from "./system_events/userJoinedToChat";
import { BotAPIConferenceChanged } from "./system_events/conferenceChanged";
import { BotAPIConferenceCreated } from "./system_events/conferenceCreated";
import { BotAPIConferenceDeleted } from "./system_events/conferenceDeleted";

// Zod схемы для валидации (соответствуют Python Pydantic моделям)
export const BotAPICommandPayloadSchema = z.object({
  body: z.string(),
  command_type: z.literal(BotAPICommandTypes.USER),
  data: z.record(z.any()),
  metadata: z.record(z.any()),
});

export const BotAPIDeviceMetaSchema = z.object({
  pushes: z.boolean().optional(),
  timezone: z.string().optional(),
  permissions: z.record(z.any()).optional(),
});

export const BaseBotAPIContextSchema = z.object({
  host: z.string(),
});

export const BotAPIUserContextSchema = BaseBotAPIContextSchema.extend({
  user_huid: z.string().uuid(),
  user_udid: z.string().uuid().optional(),
  ad_domain: z.string().optional(),
  ad_login: z.string().optional(),
  username: z.string().optional(),
  is_admin: z.boolean().optional(),
  is_creator: z.boolean().optional(),
});

export const BotAPIChatContextSchema = BaseBotAPIContextSchema.extend({
  group_chat_id: z.string().uuid(),
  chat_type: z.union([z.nativeEnum(APIChatTypes), z.string()]),
});

export const BotAPIDeviceContextSchema = BaseBotAPIContextSchema.extend({
  app_version: z.string().optional(),
  platform: z.nativeEnum(BotAPIClientPlatforms).optional(),
  platform_package_id: z.string().optional(),
  device: z.string().optional(),
  device_meta: BotAPIDeviceMetaSchema.optional(),
  device_software: z.string().optional(),
  manufacturer: z.string().optional(),
  locale: z.string().optional(),
});

export const BotAPIBaseCommandSchema = z.object({
  bot_id: z.string().uuid(),
  sync_id: z.string().uuid(),
  proto_version: z.number().refine((v) => v === BOT_API_VERSION, {
    message: "Unsupported Bot API version",
  }),
});

export const BotAPIBaseSystemEventPayloadSchema = z.object({
  command_type: z.literal(BotAPICommandTypes.SYSTEM),
  body: z
    .string()
    .refine(
      (val) => Object.values(BotAPISystemEventTypes).includes(val as any),
      {
        message: "Unknown system event",
      }
    ),
});

// Типы, соответствующие Python Pydantic моделям
export type BotAPICommandPayload = z.infer<typeof BotAPICommandPayloadSchema>;
export type BotAPIDeviceMeta = z.infer<typeof BotAPIDeviceMetaSchema>;
export type BaseBotAPIContext = z.infer<typeof BaseBotAPIContextSchema>;
export type BotAPIUserContext = z.infer<typeof BotAPIUserContextSchema>;
export type BotAPIChatContext = z.infer<typeof BotAPIChatContextSchema>;
export type BotAPIDeviceContext = z.infer<typeof BotAPIDeviceContextSchema>;
export type BotAPIBaseCommand = z.infer<typeof BotAPIBaseCommandSchema>;
export type BotAPIBaseSystemEventPayload = z.infer<typeof BotAPIBaseSystemEventPayloadSchema>;

// Классы, соответствующие Python Pydantic моделям
export class BotAPICommandPayloadModel {
  static schema = BotAPICommandPayloadSchema;
  
  constructor(
    public body: string,
    public command_type: BotAPICommandTypes.USER,
    public data: Record<string, any>,
    public metadata: Record<string, any>
  ) {}

  static parse(data: any): BotAPICommandPayloadModel {
    const validated = this.schema.parse(data);
    return new BotAPICommandPayloadModel(
      validated.body,
      validated.command_type,
      validated.data,
      validated.metadata
    );
  }
}

export class BotAPIDeviceMetaModel {
  static schema = BotAPIDeviceMetaSchema;
  
  constructor(
    public pushes?: boolean,
    public timezone?: string,
    public permissions?: Record<string, any>
  ) {}

  static parse(data: any): BotAPIDeviceMetaModel {
    const validated = this.schema.parse(data);
    return new BotAPIDeviceMetaModel(
      validated.pushes,
      validated.timezone,
      validated.permissions
    );
  }
}

export class BaseBotAPIContextModel {
  static schema = BaseBotAPIContextSchema;
  
  constructor(public host: string) {}

  static parse(data: any): BaseBotAPIContextModel {
    const validated = this.schema.parse(data);
    return new BaseBotAPIContextModel(validated.host);
  }
}

export class BotAPIUserContextModel extends BaseBotAPIContextModel {
  static schema = BotAPIUserContextSchema;
  
  constructor(
    host: string,
    public user_huid: string,
    public user_udid?: string,
    public ad_domain?: string,
    public ad_login?: string,
    public username?: string,
    public is_admin?: boolean,
    public is_creator?: boolean
  ) {
    super(host);
  }

  static parse(data: any): BotAPIUserContextModel {
    const validated = this.schema.parse(data);
    return new BotAPIUserContextModel(
      validated.host,
      validated.user_huid,
      validated.user_udid,
      validated.ad_domain,
      validated.ad_login,
      validated.username,
      validated.is_admin,
      validated.is_creator
    );
  }
}

export class BotAPIChatContextModel extends BaseBotAPIContextModel {
  static schema = BotAPIChatContextSchema;
  
  constructor(
    host: string,
    public group_chat_id: string,
    public chat_type: APIChatTypes | string
  ) {
    super(host);
  }

  static parse(data: any): BotAPIChatContextModel {
    const validated = this.schema.parse(data);
    return new BotAPIChatContextModel(
      validated.host,
      validated.group_chat_id,
      validated.chat_type
    );
  }
}

export class BotAPIDeviceContextModel extends BaseBotAPIContextModel {
  static schema = BotAPIDeviceContextSchema;
  
  constructor(
    host: string,
    public app_version?: string,
    public platform?: BotAPIClientPlatforms,
    public platform_package_id?: string,
    public device?: string,
    public device_meta?: BotAPIDeviceMetaModel,
    public device_software?: string,
    public manufacturer?: string,
    public locale?: string
  ) {
    super(host);
  }

  static parse(data: any): BotAPIDeviceContextModel {
    const validated = this.schema.parse(data);
    return new BotAPIDeviceContextModel(
      validated.host,
      validated.app_version,
      validated.platform,
      validated.platform_package_id,
      validated.device,
      validated.device_meta ? BotAPIDeviceMetaModel.parse(validated.device_meta) : undefined,
      validated.device_software,
      validated.manufacturer,
      validated.locale
    );
  }
}

export class BotAPIBaseCommandModel {
  static schema = BotAPIBaseCommandSchema;
  
  constructor(
    public bot_id: string,
    public sync_id: string,
    public proto_version: number
  ) {
    // Валидация версии протокола
    if (proto_version !== BOT_API_VERSION) {
      throw new Error(`Unsupported Bot API version: ${proto_version}`);
    }
  }

  static parse(data: any): BotAPIBaseCommandModel {
    const validated = this.schema.parse(data);
    return new BotAPIBaseCommandModel(
      validated.bot_id,
      validated.sync_id,
      validated.proto_version
    );
  }
}

export class BotAPIBaseSystemEventPayloadModel {
  static schema = BotAPIBaseSystemEventPayloadSchema;
  
  constructor(
    public command_type: BotAPICommandTypes.SYSTEM,
    public body: string
  ) {
    // Валидация типа системного события
    if (!Object.values(BotAPISystemEventTypes).includes(body as any)) {
      throw new Error(`Unknown system event: ${body}`);
    }
  }

  static parse(data: any): BotAPIBaseSystemEventPayloadModel {
    const validated = this.schema.parse(data);
    return new BotAPIBaseSystemEventPayloadModel(
      validated.command_type,
      validated.body
    );
  }
}

// Базовый класс для команд, соответствующий Python BotCommandBase
export interface BotCommandBase {
  bot: BotAccount;
  raw_command?: Record<string, any>;
}

// Функция для парсинга BotAPICommand, аналогичная Python parse_obj_as
export function parseBotAPICommand(rawCommand: Record<string, any>): BotAPICommand {
  // Определяем тип команды по полю command
  const command = rawCommand.command;
  if (!command) {
    throw new Error("Missing 'command' field in BotAPICommand");
  }

  const commandType = command.command_type;
  
  if (commandType === BotAPICommandTypes.USER) {
    // Это входящее сообщение - создаем объект с правильной структурой
    return {
      bot_id: rawCommand.bot_id,
      sync_id: rawCommand.sync_id,
      proto_version: rawCommand.proto_version,
      command: rawCommand.command,
      from: rawCommand.from,
      source_sync_id: rawCommand.source_sync_id,
      attachments: rawCommand.attachments || [],
      entities: rawCommand.entities || []
    } as unknown as BotAPIIncomingMessage;
  } else if (commandType === BotAPICommandTypes.SYSTEM) {
    // Это системное событие
    const body = command.body;
    
    // Определяем тип системного события по body
    switch (body) {
      case BotAPISystemEventTypes.SMARTAPP_EVENT:
        // Создаем объекты с правильными типами
        const smartAppPayload = new BotAPISmartAppPayload(
          rawCommand.command.body,
          rawCommand.command.command_type,
          rawCommand.command.data,
          rawCommand.command.metadata
        );
        const smartAppContext = new BotAPISmartAppEventContext(
          rawCommand.from.user_huid,
          rawCommand.from.user_udid,
          rawCommand.from.ad_domain,
          rawCommand.from.ad_login,
          rawCommand.from.username,
          rawCommand.from.is_admin,
          rawCommand.from.is_creator,
          rawCommand.from.group_chat_id,
          rawCommand.from.chat_type,
          rawCommand.from.app_version,
          rawCommand.from.platform,
          rawCommand.from.platform_package_id,
          rawCommand.from.device,
          rawCommand.from.device_meta,
          rawCommand.from.device_software,
          rawCommand.from.manufacturer,
          rawCommand.from.locale,
          rawCommand.from.host
        );
        return new BotAPISmartAppEvent(
          rawCommand.bot_id,
          smartAppPayload,
          smartAppContext,
          rawCommand.async_files || []
        );
      case BotAPISystemEventTypes.INTERNAL_BOT_NOTIFICATION:
        return rawCommand as BotAPIInternalBotNotification;
      case BotAPISystemEventTypes.CHAT_CREATED:
        return rawCommand as BotAPIChatCreated;
      case BotAPISystemEventTypes.CHAT_DELETED_BY_USER:
        return rawCommand as BotAPIChatDeletedByUser;
      case BotAPISystemEventTypes.ADDED_TO_CHAT:
        return rawCommand as BotAPIAddedToChat;
      case BotAPISystemEventTypes.DELETED_FROM_CHAT:
        return rawCommand as BotAPIDeletedFromChat;
      case BotAPISystemEventTypes.LEFT_FROM_CHAT:
        return rawCommand as BotAPILeftFromChat;
      case BotAPISystemEventTypes.CTS_LOGIN:
        return rawCommand as BotAPICTSLogin;
      case BotAPISystemEventTypes.CTS_LOGOUT:
        return rawCommand as BotAPICTSLogout;
      case BotAPISystemEventTypes.EVENT_EDIT:
        return rawCommand as BotAPIEventEdit;
      case BotAPISystemEventTypes.JOIN_TO_CHAT:
        return rawCommand as BotAPIJoinToChat;
      case BotAPISystemEventTypes.CONFERENCE_CHANGED:
        return rawCommand as BotAPIConferenceChanged;
      case BotAPISystemEventTypes.CONFERENCE_CREATED:
        return rawCommand as BotAPIConferenceCreated;
      case BotAPISystemEventTypes.CONFERENCE_DELETED:
        return rawCommand as BotAPIConferenceDeleted;
      default:
        throw new Error(`Unknown system event: ${body}`);
    }
  } else {
    throw new Error(`Unknown command type: ${commandType}`);
  }
}


