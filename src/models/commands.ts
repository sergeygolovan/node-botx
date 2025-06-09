import type {
    BotAPIIncomingMessage,
    IncomingMessage,
} from "./message/incoming_message";

import type {
    AddedToChatEvent,
    BotAPIAddedToChat,
} from "./system_events/added_to_chat";

import type {
    BotAPIChatCreated,
    ChatCreatedEvent,
} from "./system_events/chat_created";

import type {
    BotAPIChatDeletedByUser,
    ChatDeletedByUserEvent,
} from "./system_events/chat_deleted_by_user";

import type {
    BotAPIConferenceChanged,
    ConferenceChangedEvent,
} from "./system_events/conference_changed";

import type {
    BotAPIConferenceCreated,
    ConferenceCreatedEvent,
} from "./system_events/conference_created";

import type {
    BotAPIConferenceDeleted,
    ConferenceDeletedEvent,
} from "./system_events/conference_deleted";

import type { BotAPICTSLogin, CTSLoginEvent } from "./system_events/cts_login";

import type {
    BotAPICTSLogout,
    CTSLogoutEvent,
} from "./system_events/cts_logout";

import type {
    BotAPIDeletedFromChat,
    DeletedFromChatEvent,
} from "./system_events/deleted_from_chat";

import type { BotAPIEventEdit, EventEdit } from "./system_events/event_edit";

import type {
    BotAPIInternalBotNotification,
    InternalBotNotificationEvent,
} from "./system_events/internal_bot_notification";

import type {
    BotAPILeftFromChat,
    LeftFromChatEvent,
} from "./system_events/left_from_chat";

import type {
    BotAPISmartAppEvent,
    SmartAppEvent,
} from "./system_events/smartapp_event";

import type {
    BotAPIJoinToChat,
    JoinToChatEvent,
} from "./system_events/user_joined_to_chat";

// Типы для системных событий (BotAPI)
export type BotAPISystemEvent =
  | BotAPISmartAppEvent
  | BotAPIInternalBotNotification
  | BotAPIChatCreated
  | BotAPIChatDeletedByUser
  | BotAPIAddedToChat
  | BotAPIDeletedFromChat
  | BotAPILeftFromChat
  | BotAPICTSLogin
  | BotAPICTSLogout
  | BotAPIEventEdit
  | BotAPIJoinToChat
  | BotAPIConferenceChanged
  | BotAPIConferenceCreated
  | BotAPIConferenceDeleted;

// Команда бота — либо входящее сообщение, либо системное событие
export type BotAPICommand = BotAPIIncomingMessage | BotAPISystemEvent;

// Типы для системных событий (для пользователя)
export type SystemEvent =
  | SmartAppEvent
  | InternalBotNotificationEvent
  | ChatCreatedEvent
  | ChatDeletedByUserEvent
  | AddedToChatEvent
  | DeletedFromChatEvent
  | LeftFromChatEvent
  | CTSLoginEvent
  | CTSLogoutEvent
  | EventEdit
  | JoinToChatEvent
  | ConferenceChangedEvent
  | ConferenceCreatedEvent
  | ConferenceDeletedEvent;

// Команда бота (пользовательская)
export type BotCommand = IncomingMessage | SystemEvent;
