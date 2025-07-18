import 'reflect-metadata';
import { plainToClass, ClassConstructor } from 'class-transformer';
import { validate } from 'class-validator';
import { BotAPICommand } from './commands';
import { BotAPISyncSmartAppEvent } from './syncSmartappEvent';
import { BotAPIMethodSuccessfulCallback, BotAPIMethodFailedCallback } from './methodCallbacks';

/**
 * Универсальный парсер для преобразования JSON в классы с валидацией
 * Аналог Python функции parse_obj_as
 */
export async function parseObjAs<T extends object>(
  targetClass: ClassConstructor<T>,
  data: Record<string, any>
): Promise<T> {
  // Преобразуем plain object в экземпляр класса
  const instance = plainToClass(targetClass, data, {
    excludeExtraneousValues: false,
    enableImplicitConversion: true,
  });

  // Валидируем объект
  const errors = await validate(instance);
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
  }

  return instance;
}

/**
 * Парсер для BotAPICommand - определяет тип команды и создает соответствующий объект
 */
export function parseBotAPICommand(rawCommand: Record<string, any>): BotAPICommand {
  // Определяем тип команды по полю command
  const command = rawCommand.command;
  if (!command) {
    throw new Error("Missing 'command' field in BotAPICommand");
  }

  const commandType = command.command_type;
  
  if (commandType === 'user') {
    // Это входящее сообщение - создаем объект с правильной структурой
    return new BotAPIIncomingMessage(
      rawCommand.bot_id,
      rawCommand.sync_id,
      rawCommand.proto_version,
      rawCommand.command,
      rawCommand.from,
      rawCommand.source_sync_id,
      rawCommand.attachments || [],
      rawCommand.entities || []
    );
  } else if (commandType === 'system') {
    // Это системное событие
    const body = command.body;
    
    // Определяем тип системного события по body
    switch (body) {
      case 'smartapp_event':
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
          rawCommand.sync_id,
          rawCommand.proto_version,
          smartAppPayload,
          smartAppContext,
          rawCommand.async_files || []
        );
      case 'internal_bot_notification':
        return rawCommand as BotAPIInternalBotNotification;
      case 'chat_created':
        return rawCommand as BotAPIChatCreated;
      case 'chat_deleted_by_user':
        return rawCommand as BotAPIChatDeletedByUser;
      case 'added_to_chat':
        return rawCommand as BotAPIAddedToChat;
      case 'deleted_from_chat':
        return rawCommand as BotAPIDeletedFromChat;
      case 'left_from_chat':
        return rawCommand as BotAPILeftFromChat;
      case 'cts_login':
        return rawCommand as BotAPICTSLogin;
      case 'cts_logout':
        return rawCommand as BotAPICTSLogout;
      case 'event_edit':
        return rawCommand as BotAPIEventEdit;
      case 'join_to_chat':
        return rawCommand as BotAPIJoinToChat;
      case 'conference_changed':
        return rawCommand as BotAPIConferenceChanged;
      case 'conference_created':
        return rawCommand as BotAPIConferenceCreated;
      case 'conference_deleted':
        return rawCommand as BotAPIConferenceDeleted;
      default:
        throw new Error(`Unknown system event: ${body}`);
    }
  } else {
    throw new Error(`Unknown command type: ${commandType}`);
  }
}

/**
 * Парсер для BotAPISyncSmartAppEvent
 */
export function parseBotAPISyncSmartAppEvent(rawEvent: Record<string, any>): BotAPISyncSmartAppEvent {
  const sender_info = new BotAPISyncSmartAppSender(
    rawEvent.sender_info.user_huid,
    rawEvent.sender_info.udid,
    rawEvent.sender_info.platform
  );

  const payload = new BotAPISyncSmartAppPayload(
    rawEvent.payload.data,
    rawEvent.payload.files || []
  );

  return new BotAPISyncSmartAppEvent(
    rawEvent.bot_id,
    rawEvent.group_chat_id,
    sender_info,
    rawEvent.method,
    payload
  );
}

/**
 * Парсер для BotXMethodCallback
 */
export function parseBotXMethodCallback(data: Record<string, any>): BotXMethodCallback {
  if (data.status === "ok") {
    return new BotAPIMethodSuccessfulCallback(
      data.sync_id,
      data.status,
      data.result
    );
  } else if (data.status === "error") {
    return new BotAPIMethodFailedCallback(
      data.sync_id,
      data.status,
      data.reason,
      data.errors || [],
      data.error_data || {}
    );
  }
  throw new Error("Invalid BotX method callback status");
}

// Импорты для типов
import { BotAPIIncomingMessage } from './message/incomingMessage';
import { BotAPISmartAppEvent, BotAPISmartAppPayload, BotAPISmartAppEventContext } from './system_events/smartappEvent';
import { BotAPIInternalBotNotification } from './system_events/internalBotNotification';
import { BotAPIChatCreated } from './system_events/chatCreated';
import { BotAPIChatDeletedByUser } from './system_events/chatDeletedByUser';
import { BotAPIAddedToChat } from './system_events/addedToChat';
import { BotAPIDeletedFromChat } from './system_events/deletedFromChat';
import { BotAPILeftFromChat } from './system_events/leftFromChat';
import { BotAPICTSLogin } from './system_events/ctsLogin';
import { BotAPICTSLogout } from './system_events/ctsLogout';
import { BotAPIEventEdit } from './system_events/eventEdit';
import { BotAPIJoinToChat } from './system_events/userJoinedToChat';
import { BotAPIConferenceChanged } from './system_events/conferenceChanged';
import { BotAPIConferenceCreated } from './system_events/conferenceCreated';
import { BotAPIConferenceDeleted } from './system_events/conferenceDeleted';
import { BotAPISyncSmartAppSender, BotAPISyncSmartAppPayload } from './syncSmartappEvent';
import { BotXMethodCallback } from './methodCallbacks'; 