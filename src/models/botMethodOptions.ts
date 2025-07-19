import { AsyncBufferReadable, AsyncBufferWritable } from "@asyncBuffer";
import { BubbleMarkup, KeyboardMarkup } from "./message/markup";
import { IncomingFileAttachment, OutgoingAttachment } from "./attachments";
import { Missing, MissingOptional } from "@missing";
import { EditMessage, OutgoingMessage, ReplyMessage, BotAccountWithSecret } from "@models";
import { ChatTypes } from "./enums";
import { HandlerCollector } from "../bot/handlerCollector";
import { Middleware } from "../bot/handler";
import { HttpClient } from "../client/httpClient";
import { ExceptionHandlersDict } from "../bot/middlewares/exceptionMiddleware";
import { CallbackRepoProto } from "../bot/callbacks/callbackRepoProto";

import { File } from "./asyncFiles";
import { 
  SmartappManifestIosParams, 
  SmartappManifestAndroidParams, 
  SmartappManifestWebParams, 
  SmartappManifestUnreadCounterParams 
} from "@client/api/smartapps/smartappManifest";

// Конструктор Bot
export interface BotConstructorOptions {
  collectors: HandlerCollector[];
  botAccounts: BotAccountWithSecret[];
  middlewares?: Middleware[];
  httpClient?: HttpClient;
  exceptionHandlers?: ExceptionHandlersDict;
  defaultCallbackTimeout?: number;
  callbackRepo?: CallbackRepoProto;
}

// Боты
export interface GetBotsListOptions {
  botId: string;
  since?: Date;
}

// Сообщения
export interface SendOptions {
  botId: string;
  chatId: string;
  body: string;
  metadata?: Record<string, unknown>;
  bubbles?: BubbleMarkup;
  keyboard?: KeyboardMarkup;
  file?: IncomingFileAttachment | OutgoingAttachment;
  recipients?: string[]; // UUID[]
  silentResponse?: boolean;
  markupAutoAdjust?: boolean;
  stealthMode?: boolean;
  sendPush?: boolean;
  ignoreMute?: boolean;
  waitCallback?: boolean;
  callbackTimeout?: number;
}

export interface SendMessageOptions {
  message: OutgoingMessage;
  waitCallback?: boolean;
  callbackTimeout?: number;
}

export interface SendMessageWithParamsOptions {
  botId: string;
  chatId: string;
  body: string;
  metadata: Missing<Record<string, unknown>>;
  bubbles: Missing<BubbleMarkup>;
  keyboard: Missing<KeyboardMarkup>;
  file: Missing<IncomingFileAttachment | OutgoingAttachment>;
  recipients: Missing<string[]>; // UUID[]
  silentResponse: Missing<boolean>;
  markupAutoAdjust: Missing<boolean>;
  stealthMode: Missing<boolean>;
  sendPush: Missing<boolean>;
  ignoreMute: Missing<boolean>;
  waitCallback?: boolean;
  callbackTimeout?: number;
}

export interface EditOptions {
  botId: string;
  chatId: string;
  syncId: string;
  body: string;
  metadata?: Record<string, unknown>;
  bubbles?: BubbleMarkup;
  keyboard?: KeyboardMarkup;
  file?: IncomingFileAttachment | OutgoingAttachment;
  recipients?: string[]; // UUID[]
  silentResponse?: boolean;
  markupAutoAdjust?: boolean;
  stealthMode?: boolean;
  sendPush?: boolean;
  ignoreMute?: boolean;
  waitCallback?: boolean;
  callbackTimeout?: number;
}

export interface EditMessageOptions {
  message: EditMessage;
}

export interface EditMessageWithParamsOptions {
  botId: string;
  syncId: string;
  body: Missing<string>;
  metadata: Missing<Record<string, unknown>>;
  bubbles: Missing<BubbleMarkup>;
  keyboard: Missing<KeyboardMarkup>;
  file: MissingOptional<IncomingFileAttachment | OutgoingAttachment>;
  markupAutoAdjust: Missing<boolean>;
}

export interface ReplyOptions {
  message: ReplyMessage;
}

export interface ReplyMessageOptions {
  botId: string;
  syncId: string;
  body: string;
  metadata: Missing<Record<string, unknown>>;
  bubbles: Missing<BubbleMarkup>;
  keyboard: Missing<KeyboardMarkup>;
  file: Missing<IncomingFileAttachment | OutgoingAttachment>;
  silentResponse: Missing<boolean>;
  markupAutoAdjust: Missing<boolean>;
  stealthMode: Missing<boolean>;
  sendPush: Missing<boolean>;
  ignoreMute: Missing<boolean>;
}

export interface GetMessageStatusOptions {
  botId: string;
  chatId: string;
  syncId: string;
}

export interface StartTypingOptions {
  botId: string;
  chatId: string;
}

export interface StopTypingOptions {
  botId: string;
  chatId: string;
}

export interface DeleteMessageOptions {
  botId: string;
  chatId: string;
  syncId: string;
}

// Чаты
export interface ListChatsOptions {
  botId: string;
}

export interface ChatInfoOptions {
  botId: string;
  chatId: string;
}

export interface AddUsersToChatOptions {
  botId: string;
  chatId: string;
  huids: string[]; // UUID[]
}

export interface RemoveUsersFromChatOptions {
  botId: string;
  chatId: string;
  huids: string[]; // UUID[]
}

export interface PromoteToChatAdminsOptions {
  botId: string;
  chatId: string;
  huids: string[]; // UUID[]
}

export interface EnableStealthOptions {
  botId: string;
  chatId: string;
  disableWebClient?: boolean;
  ttlAfterRead?: number;
  totalTtl?: number;
}

export interface DisableStealthOptions {
  botId: string;
  chatId: string;
}

export interface PinMessageOptions {
  botId: string;
  chatId: string;
  syncId: string;
}

export interface UnpinMessageOptions {
  botId: string;
  chatId: string;
}

// Пользователи
export interface SearchUserByEmailsOptions {
  botId: string;
  emails: string[];
}

export interface SearchUserByEmailOptions {
  botId: string;
  email: string;
}

export interface SearchUserByHuidOptions {
  botId: string;
  huid: string;
}

export interface SearchUserByAdOptions {
  botId: string;
  adLogin: string;
  adDomain: string;
}

export interface SearchUserByOtherIdOptions {
  botId: string;
  otherId: string;
}

// Файлы
export interface DownloadFileOptions {
  botId: string;
  chatId: string;
  fileId: string;
  asyncBuffer: AsyncBufferWritable;
}

export interface UploadFileOptions {
  botId: string;
  chatId: string;
  asyncBuffer: AsyncBufferReadable;
  filename: string;
  duration?: number;
  caption?: string;
}

// OpenID и метрики
export interface RefreshAccessTokenOptions {
  botId: string;
  huid: string;
  ref?: string;
}

export interface CollectMetricOptions {
  botId: string;
  botFunction: string;
  huids: string[];
  chatId: string;
}

// Стикеры
export interface GetStickerPackOptions {
  botId: string;
  stickerPackId: string;
}

export interface GetStickerOptions {
  botId: string;
  stickerPackId: string;
  stickerId: string;
}

// SmartApps
export interface SendSmartappEventOptions {
  botId: string;
  chatId: string;
  data: Record<string, unknown>;
  encrypted?: boolean;
  ref?: string;
  opts: Missing<Record<string, unknown>>;
  files: Missing<File[]>;
}

export interface SendSmartappNotificationOptions {
  botId: string;
  chatId: string;
  smartappCounter: number;
  body?: string;
  opts: Missing<Record<string, unknown>>;
  meta: Missing<Record<string, unknown>>;
}

export interface GetSmartappsListOptions {
  botId: string;
  version?: number;
}

export interface UploadStaticFileOptions {
  botId: string;
  asyncBuffer: AsyncBufferReadable;
  filename: string;
}

export interface SendSmartappCustomNotificationOptions {
  botId: string;
  groupChatId: string;
  title: string;
  body: string;
  meta: Missing<Record<string, unknown>>;
  waitCallback?: boolean;
  callbackTimeout?: number;
}

export interface SendSmartappUnreadCounterOptions {
  botId: string;
  groupChatId: string;
  counter: number;
  waitCallback?: boolean;
  callbackTimeout?: number;
}

// Дополнительные типы для методов, которые были добавлены позже
export interface SendInternalBotNotificationOptions {
  botId: string;
  chatId: string;
  data: Record<string, unknown>;
  opts: Missing<Record<string, unknown>>;
  recipients: Missing<string[]>;
  waitCallback?: boolean;
  callbackTimeout?: number;
}

export interface CreateChatOptions {
  botId: string;
  name: string;
  chatType: ChatTypes;
  huids: string[];
  description?: string;
  sharedHistory?: boolean;
}

export interface SendSmartappManifestOptions {
  botId: string;
  ios: Missing<SmartappManifestIosParams>;
  android: Missing<SmartappManifestAndroidParams>;
  webLayout: Missing<SmartappManifestWebParams>;
  unreadCounter: Missing<SmartappManifestUnreadCounterParams>;
}

export interface UpdateUserProfileOptions {
  botId: string;
  userHuid: string;
  avatar: Missing<IncomingFileAttachment | OutgoingAttachment>;
  name: Missing<string>;
  publicName: Missing<string>;
  company: Missing<string>;
  companyPosition: Missing<string>;
  description: Missing<string>;
  department: Missing<string>;
  office: Missing<string>;
  manager: Missing<string>;
}

export interface UsersAsCsvOptions {
  botId: string;
  ctsUser?: boolean;
  unregistered?: boolean;
  botx?: boolean;
}

// Методы для работы со стикерами
export interface CreateStickerPackOptions {
  botId: string;
  name: string;
  huid: Missing<string>;
}

export interface AddStickerOptions {
  botId: string;
  stickerPackId: string;
  emoji: string;
  asyncBuffer: AsyncBufferReadable;
}

export interface DeleteStickerOptions {
  botId: string;
  stickerPackId: string;
  stickerId: string;
}

export interface IterateByStickerPacksOptions {
  botId: string;
  userHuid: string;
}

export interface DeleteStickerPackOptions {
  botId: string;
  stickerPackId: string;
}

export interface EditStickerPackOptions {
  botId: string;
  stickerPackId: string;
  name: string;
  preview: string;
  stickersOrder: string[];
} 