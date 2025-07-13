import type {
    IncomingMessage,
    BotAPIIncomingMessage,
} from "./message/incomingMessage";

import type {
    AddedToChatEvent,
    BotAPIAddedToChat,
} from "./system_events/addedToChat";

import type {
    BotAPIChatCreated,
    ChatCreatedEvent,
} from "./system_events/chatCreated";

import type {
    BotAPIChatDeletedByUser,
    ChatDeletedByUserEvent,
} from "./system_events/chatDeletedByUser";

import type {
    BotAPIConferenceChanged,
    ConferenceChangedEvent,
} from "./system_events/conferenceChanged";

import type {
    BotAPIConferenceCreated,
    ConferenceCreatedEvent,
} from "./system_events/conferenceCreated";

import type {
    BotAPIConferenceDeleted,
    ConferenceDeletedEvent,
} from "./system_events/conferenceDeleted";

import type { BotAPICTSLogin, CTSLoginEvent } from "./system_events/ctsLogin";

import type {
    BotAPICTSLogout,
    CTSLogoutEvent,
} from "./system_events/ctsLogout";

import type {
    BotAPIDeletedFromChat,
    DeletedFromChatEvent,
} from "./system_events/deletedFromChat";

import type { BotAPIEventEdit, EventEdit } from "./system_events/eventEdit";

import type {
    BotAPIInternalBotNotification,
    InternalBotNotificationEvent,
} from "./system_events/internalBotNotification";

import type {
    BotAPILeftFromChat,
    LeftFromChatEvent,
} from "./system_events/leftFromChat";

import type {
    BotAPISmartAppEvent,
    SmartAppEvent,
} from "./system_events/smartappEvent";

import type {
    BotAPIJoinToChat,
    JoinToChatEvent,
} from "./system_events/userJoinedToChat";

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
