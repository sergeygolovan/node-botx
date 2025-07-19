
import { JwtPayload, decode, verify } from 'jsonwebtoken';
import { 
  BotAccountWithSecret, 
  BotAPIStatusRecipient, 
  BotAPISyncSmartAppEventResponse, 
  BotCommand, 
  BotMenu, 
  BotXMethodCallback, 
  buildBotStatusResponse, 
  SmartAppEvent, 
  StatusRecipient,
  UserFromCSV,
  ChatListItem,
  ChatInfo,
  UserFromSearch,
  MessageStatus
} from "@models";
import {
  BotConstructorOptions,
  GetBotsListOptions,
  SendMessageOptions,
  SendMessageWithParamsOptions,
  EditMessageOptions,
  EditMessageWithParamsOptions,
  ReplyOptions,
  ReplyMessageOptions,
  GetMessageStatusOptions,
  StartTypingOptions,
  StopTypingOptions,
  DeleteMessageOptions,
  ListChatsOptions,
  ChatInfoOptions,
  AddUsersToChatOptions,
  RemoveUsersFromChatOptions,
  PromoteToChatAdminsOptions,
  EnableStealthOptions,
  DisableStealthOptions,
  PinMessageOptions,
  UnpinMessageOptions,
  SearchUserByEmailsOptions,
  SearchUserByEmailOptions,
  SearchUserByHuidOptions,
  SearchUserByAdOptions,
  SearchUserByOtherIdOptions,
  DownloadFileOptions,
  UploadFileOptions,
  RefreshAccessTokenOptions,
  CollectMetricOptions,
  GetStickerPackOptions,
  GetStickerOptions,
  SendSmartappEventOptions,
  SendSmartappNotificationOptions,
  GetSmartappsListOptions,
  UploadStaticFileOptions,
  SendSmartappCustomNotificationOptions,
  SendSmartappUnreadCounterOptions,
  SendInternalBotNotificationOptions,
  CreateChatOptions,
  SendSmartappManifestOptions,
  UpdateUserProfileOptions,
  UsersAsCsvOptions,
  CreateStickerPackOptions,
  AddStickerOptions,
  DeleteStickerOptions,
  IterateByStickerPacksOptions,
  DeleteStickerPackOptions,
  EditStickerPackOptions
} from "@models/botMethodOptions";
import { parseBotAPICommand, parseBotAPISyncSmartAppEvent, parseBotXMethodCallback } from "@models/parsers";
import { HttpClient, createHttpClient, getToken } from '@client';
import { DirectNotificationMethod, BotXAPIDirectNotificationRequestPayload, InternalBotNotificationMethod, BotXAPIInternalBotNotificationRequestPayload } from '@client/api/notifications';
import { 
  EditEventMethod, 
  BotXAPIEditEventRequestPayload, 
  ReplyEventMethod, 
  BotXAPIReplyEventRequestPayload,
  TypingEventMethod,
  BotXAPITypingEventRequestPayload,
  StopTypingEventMethod,
  BotXAPIStopTypingEventRequestPayload,
  DeleteEventMethod,
  BotXAPIDeleteEventRequestPayload,
  MessageStatusMethod,
  BotXAPIMessageStatusRequestPayload
} from '@client/api/events';
import {
  ListChatsMethod,
  ChatInfoMethod,
  BotXAPIChatInfoRequestPayload,
  AddUserMethod,
  BotXAPIAddUserRequestPayload,
  RemoveUserMethod,
  BotXAPIRemoveUserRequestPayload,
  AddAdminMethod,
  BotXAPIAddAdminRequestPayload,
  SetStealthMethod,
  BotXAPISetStealthRequestPayload,
  DisableStealthMethod,
  BotXAPIDisableStealthRequestPayload,
  PinMessageMethod,
  BotXAPIPinMessageRequestPayload,
  UnpinMessageMethod,
  BotXAPIUnpinMessageRequestPayload,
  CreateChatMethod,
  BotXAPICreateChatRequestPayload
} from '@client/api/chats';
import {
  SearchUserByEmailsMethod,
  BotXAPISearchUserByEmailsRequestPayload,
  SearchUserByEmailMethod,
  BotXAPISearchUserByEmailRequestPayload,
  SearchUserByHUIDMethod,
  BotXAPISearchUserByHUIDRequestPayload,
  SearchUserByLoginMethod,
  BotXAPISearchUserByLoginRequestPayload,
  SearchUserByOtherIdMethod,
  BotXAPISearchUserByOtherIdRequestPayload,
  UpdateUsersProfileMethod,
  BotXAPIUpdateUserProfileRequestPayload,
  UsersAsCSVMethod,
  BotXAPIUsersAsCSVRequestPayload
} from '@client/api/users';
import {
  SmartAppEventMethod,
  BotXAPISmartAppEventRequestPayload,
  SmartAppNotificationMethod,
  BotXAPISmartAppNotificationRequestPayload,
  SmartAppsListMethod,
  BotXAPISmartAppsListRequestPayload,
  SmartAppUploadFileMethod,
  SmartAppCustomNotificationMethod,
  BotXAPISmartAppCustomNotificationRequestPayload,
  SmartAppUnreadCounterMethod,
  BotXAPISmartAppUnreadCounterRequestPayload,
  SmartAppManifestMethod,
  BotXAPISmartAppManifestRequestPayload
} from '@client/api/smartapps';
import {
  GetStickerPackMethod,
  BotXAPIGetStickerPackRequestPayload,
  GetStickerMethod,
  BotXAPIGetStickerRequestPayload,
  CreateStickerPackMethod,
  BotXAPICreateStickerPackRequestPayload,
  AddStickerMethod,
  BotXAPIAddStickerRequestPayload,
  DeleteStickerMethod,
  BotXAPIDeleteStickerRequestPayload,
  DeleteStickerPackMethod,
  BotXAPIDeleteStickerPackRequestPayload,
  EditStickerPackMethod,
  BotXAPIEditStickerPackRequestPayload,
  GetStickerPacksMethod,
  BotXAPIGetStickerPacksRequestPayload
} from '@client/api/stickers';
import {
  DownloadFileMethod,
  BotXAPIDownloadFileRequestPayload,
  UploadFileMethod,
  BotXAPIUploadFileRequestPayload
} from '@client/api/files';
import {
  RefreshAccessTokenMethod,
  BotXAPIRefreshAccessTokenRequestPayload
} from '@client/api/openid';
import {
  CollectBotFunctionMethod,
  BotXAPICollectBotFunctionRequestPayload
} from '@client/api/metrics';
import {
  BotsListMethod,
  BotXAPIBotsListRequestPayload
} from '@client/api/bots';
import { Undefined } from '@missing';
import { BOTX_DEFAULT_TIMEOUT } from '@constants';
import { botIdVar, chatIdVar } from './contextVars';
import { AnswerDestinationLookupError } from './exceptions';;
import { defaultLogger } from '@logger';
import { BotAccountsStorage } from './botAccountsStorage';
import { CallbackManager } from './callbacks/callbackManager';
import { CallbackMemoryRepo } from './callbacks/callbackMemoryRepo';

import { RequestHeadersNotProvidedError, UnverifiedRequestError } from './exceptions';
import { Middleware } from './handler';
import { HandlerCollector } from './handlerCollector';
import { ExceptionHandlersDict } from './middlewares/exceptionMiddleware';
import { AnswerMessageOptions } from '@models/message/outgoingMessage';


export class Bot {
  private _botAccountsStorage: BotAccountsStorage;
  private _callbacksManager: CallbackManager;
  private _httpClient: HttpClient;
  private _handlerCollector: HandlerCollector;
  private _defaultCallbackTimeout: number;
  public state: Record<string, any> = {};

  constructor({
    collectors,
    botAccounts,
    middlewares = [],
    httpClient,
    exceptionHandlers = new Map(),
    defaultCallbackTimeout = BOTX_DEFAULT_TIMEOUT,
    callbackRepo,
  }: BotConstructorOptions) {
    this._botAccountsStorage = new BotAccountsStorage(botAccounts);
    const repo = callbackRepo ?? new CallbackMemoryRepo();
    this._callbacksManager = new CallbackManager(repo);
    this._httpClient = httpClient ?? createHttpClient();
    this._defaultCallbackTimeout = defaultCallbackTimeout;
    this._handlerCollector = this.buildMainCollector(collectors, middlewares, exceptionHandlers);
  }

  private buildMainCollector(
    collectors: HandlerCollector[],
    middlewares: Middleware[],
    exceptionHandlers?: ExceptionHandlersDict,
  ): HandlerCollector {
    const mainCollector = new HandlerCollector(middlewares);
    mainCollector.insertExceptionMiddleware(exceptionHandlers);
    mainCollector.include(...collectors);
    return mainCollector;
  }

  private verifyRequest(
    headers?: Record<string, string>,
    trustedIssuers?: Set<string>,
  ): void {
    if (!headers) {
      throw new RequestHeadersNotProvidedError();
    }

    const authorizationHeader = headers.authorization;
    if (!authorizationHeader) {
      throw new UnverifiedRequestError("The authorization token was not provided.");
    }

    const token = authorizationHeader.split(' ').pop()!;

    let tokenPayload: JwtPayload;
    try {
      // First decode without signature verification (like Python with verify_signature: False)
      tokenPayload = decode(token) as JwtPayload;
    } catch (decodeExc: any) {
      throw new UnverifiedRequestError(decodeExc.message);
    }

    const audience = tokenPayload.aud;
    if (!audience || !Array.isArray(audience) || audience.length !== 1) {
      throw new UnverifiedRequestError("Invalid audience parameter was provided.");
    }

    let botAccount: BotAccountWithSecret;
    try {
      botAccount = this._botAccountsStorage.getBotAccount(audience[0]);
    } catch (unknownBotExc: any) {
      throw new UnverifiedRequestError(unknownBotExc.message);
    }

    try {
      // Second decode with signature verification (like Python with key and algorithms)
      verify(token, botAccount.secret_key, {
        algorithms: ['HS256'],
        issuer: botAccount.host,
        clockTolerance: 1,
        ignoreExpiration: false,
        ignoreNotBefore: false,
      });
    } catch (exc: any) {
      throw new UnverifiedRequestError(exc.message);
    }

    const issuer = tokenPayload.iss;
    if (!issuer) {
      throw new UnverifiedRequestError('Token is missing the "iss" claim');
    }

    if (issuer !== botAccount.host) {
      if (!trustedIssuers || !trustedIssuers.has(issuer)) {
        throw new UnverifiedRequestError("Invalid issuer");
      }
    }
  }

  async asyncExecuteRawBotCommand(
    rawBotCommand: Record<string, any>,
    verifyRequest = true,
    requestHeaders?: Record<string, string>,
    loggingCommand = true,
    trustedIssuers?: Set<string>,
  ): Promise<void> {
    if (loggingCommand) {
      defaultLogger.debug(`Got command: ${JSON.stringify(rawBotCommand, null, 2)}`);
    }

    if (verifyRequest) {
      this.verifyRequest(requestHeaders, trustedIssuers);
    }

    try {
      const command = parseBotAPICommand(rawBotCommand);
      const domainCommand = command.toDomain(rawBotCommand);
      this.asyncExecuteBotCommand(domainCommand);
    } catch (validationExc) {
      throw new Error("Bot command validation error");
    }
  }

  asyncExecuteBotCommand(botCommand: BotCommand): Promise<void> {
    this._botAccountsStorage.getBotAccount(botCommand.bot.id);
    return this._handlerCollector.asyncHandleBotCommand(this, botCommand);
  }

  /**
   * Получает токен доступа для указанного бота
   * @param botId - ID бота
   * @returns Promise<string> - токен доступа
   */
  async getToken(botId: string): Promise<string> {
    return getToken(
      botId,
      this._httpClient,
      this._botAccountsStorage
    );
  }

  /**
   * Получает список ботов с возможностью фильтрации по дате
   * @param options - параметры запроса
   * @param options.botId - ID бота
   * @param options.since - опциональная дата для фильтрации (получить ботов с этой даты)
   * @returns Promise<[any[], Date]> - кортеж из списка ботов и даты последнего обновления
   */
  async getBotsList(options: GetBotsListOptions): Promise<[any[], Date]> {
    const method = new BotsListMethod(
      options.botId,
      this._httpClient,
      this._botAccountsStorage
    );
    
    const payload = BotXAPIBotsListRequestPayload.fromDomain(options.since);

    const botxApiBotsList = await method.execute(payload);
    return botxApiBotsList.toDomain();
  }

  async syncExecuteRawSmartappEvent(
    rawSmartappEvent: Record<string, any>,
    verifyRequest = true,
    requestHeaders?: Record<string, string>,
    loggingCommand = true,
    trustedIssuers?: Set<string>,
  ): Promise<BotAPISyncSmartAppEventResponse> {
    if (loggingCommand) {
      defaultLogger.debug(`Got sync smartapp event: ${JSON.stringify(rawSmartappEvent, null, 2)}`);
    }

    if (verifyRequest) {
      this.verifyRequest(requestHeaders, trustedIssuers);
    }

    try {
      const smartappEvent = parseBotAPISyncSmartAppEvent(rawSmartappEvent);
      const domainSmartappEvent = smartappEvent.toDomain(rawSmartappEvent);
      return await this.syncExecuteSmartappEvent(domainSmartappEvent);
    } catch (validationExc) {
      throw new Error("Sync smartapp event validation error");
    }
  }

  async syncExecuteSmartappEvent(
    smartappEvent: SmartAppEvent,
  ): Promise<BotAPISyncSmartAppEventResponse> {
    this._botAccountsStorage.getBotAccount(smartappEvent.bot.id);
    return await this._handlerCollector.handleSyncSmartappEvent(this, smartappEvent);
  }

  async rawGetStatus(
    queryParams: Record<string, string>,
    verifyRequest = true,
    requestHeaders?: Record<string, string>,
    trustedIssuers?: Set<string>,
  ): Promise<Record<string, any>> {
    defaultLogger.debug(`Got status: ${JSON.stringify(queryParams, null, 2)}`);

    if (verifyRequest) {
      this.verifyRequest(requestHeaders, trustedIssuers);
    }

    try {
      const statusRecipient = BotAPIStatusRecipient.fromRaw({
        bot_id: queryParams.bot_id,
        user_huid: queryParams.user_huid,
        ad_login: queryParams.ad_login,
        ad_domain: queryParams.ad_domain,
        is_admin: queryParams.is_admin === 'true',
        chat_type: queryParams.chat_type,
      });
      const domainStatusRecipient = statusRecipient.toDomain();
      const botMenu = await this.getStatus(domainStatusRecipient);
      return buildBotStatusResponse(botMenu);
    } catch (validationExc) {
      throw new Error("Status request validation error");
    }
  }

  async getStatus(statusRecipient: StatusRecipient): Promise<BotMenu> {
    this._botAccountsStorage.getBotAccount(statusRecipient.bot_id);
    return await this._handlerCollector.getBotMenu(statusRecipient, this);
  }

  async setRawBotxMethodResult(
    rawBotxMethodResult: Record<string, any>,
    verifyRequest = true,
    requestHeaders?: Record<string, string>,
    trustedIssuers?: Set<string>,
  ): Promise<void> {
    defaultLogger.debug(`Got callback: ${JSON.stringify(rawBotxMethodResult, null, 2)}`);

    if (verifyRequest) {
      this.verifyRequest(requestHeaders, trustedIssuers);
    }

    try {
      const callback = parseBotXMethodCallback(rawBotxMethodResult);
      await this._callbacksManager.setBotxMethodCallbackResult(callback);
    } catch (validationExc) {
      throw new Error("BotX method callback validation error");
    }
  }



  async waitBotxMethodCallback(syncId: string): Promise<BotXMethodCallback> {
    const timeout = this._callbacksManager.cancelCallbackTimeoutAlarm(
      syncId,
      true // returnRemainingTime
    ) || this._defaultCallbackTimeout;

    return this._callbacksManager.waitBotxMethodCallback(syncId, timeout);
  }

  // ========================================
  // УВЕДОМЛЕНИЯ И СООБЩЕНИЯ
  // ========================================

  /**
   * Отправляет ответное сообщение в текущий чат (использует контекст)
   * @param body - текст сообщения
   * @param options - опциональные параметры сообщения
   * @returns Promise<string> - syncId отправленного сообщения
   * @throws {AnswerDestinationLookupError} - если не удается определить botId или chatId из контекста
   */
  async answerMessage(
    body: string,
    options: AnswerMessageOptions
  ): Promise<string> {
    const botId = botIdVar.get();
    const chatId = chatIdVar.get();
    if (!botId || !chatId) {
      throw new AnswerDestinationLookupError();
    }
    
    // Импортируем Undefined для правильной работы с Missing типами
    const { Undefined } = await import("@missing");
    
    return await this.sendMessage({
      botId,
      chatId,
      body,
      metadata: options.metadata,
      bubbles: options.bubbles,
      keyboard: options.keyboard,
      file: options.file,
      recipients: options.recipients,
      silentResponse: options.silentResponse,
      markupAutoAdjust: options.markupAutoAdjust,
      stealthMode: options.stealthMode,
      sendPush: options.sendPush,
      ignoreMute: options.ignoreMute,
      waitCallback: options.waitCallback === Undefined ? undefined : (options.waitCallback as boolean),
      callbackTimeout: options.callbackTimeout === Undefined ? undefined : (options.callbackTimeout as number),
    });
  }

  /**
   * Отправляет сообщение, используя объект OutgoingMessage
   * @param options - параметры отправки
   * @param options.message - объект сообщения для отправки
   * @param options.waitCallback - ожидать ли callback (по умолчанию true)
   * @param options.callbackTimeout - таймаут для callback в миллисекундах
   * @returns Promise<string> - syncId отправленного сообщения
   */
  async send(options: SendMessageOptions): Promise<string> {
    const { message, waitCallback = true, callbackTimeout } = options;
    return await this.sendMessage({
      botId: message.botId,
      chatId: message.chatId,
      body: message.body,
      metadata: message.metadata,
      bubbles: message.bubbles,
      keyboard: message.keyboard,
      file: message.file,
      recipients: message.recipients,
      silentResponse: message.silentResponse,
      markupAutoAdjust: message.markupAutoAdjust,
      stealthMode: message.stealthMode,
      sendPush: message.sendPush,
      ignoreMute: message.ignoreMute,
      waitCallback,
      callbackTimeout,
    });
  }

  /**
   * Отправляет сообщение с указанными параметрами
   * @param options - параметры сообщения
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @param options.body - текст сообщения
   * @param options.metadata - опциональные метаданные
   * @param options.bubbles - опциональная разметка пузырьков
   * @param options.keyboard - опциональная клавиатура
   * @param options.file - опциональный файл
   * @param options.recipients - опциональный список получателей
   * @param options.silentResponse - тихий ответ (по умолчанию false)
   * @param options.markupAutoAdjust - автоматическая настройка разметки
   * @param options.stealthMode - режим скрытности
   * @param options.sendPush - отправлять push-уведомления
   * @param options.ignoreMute - игнорировать режим "не беспокоить"
   * @param options.waitCallback - ожидать callback (по умолчанию true)
   * @param options.callbackTimeout - таймаут для callback
   * @returns Promise<string> - syncId отправленного сообщения
   */
  async sendMessage(options: SendMessageWithParamsOptions): Promise<string> {
    const method = new DirectNotificationMethod(
      options.botId,
      this._httpClient,
      this._botAccountsStorage,
      this._callbacksManager,
    );
    const payload = BotXAPIDirectNotificationRequestPayload.fromDomain(
      options.chatId,
      options.body,
      options.metadata,
      options.bubbles,
      options.keyboard,
      options.file,
      options.recipients,
      options.silentResponse,
      options.markupAutoAdjust,
      options.stealthMode,
      options.sendPush,
      options.ignoreMute,
    );
    const botxApiSyncId = await method.execute(
      payload,
      options.waitCallback ?? true,
      options.callbackTimeout || null,
      this._defaultCallbackTimeout,
    );
    return botxApiSyncId.toDomain();
  }

  // ========================================
  // РЕДАКТИРОВАНИЕ СООБЩЕНИЙ
  // ========================================

  /**
   * Редактирует сообщение, используя объект EditMessage
   * @param options - параметры редактирования
   * @param options.message - объект сообщения для редактирования
   * @returns Promise<void>
   */
  async edit(options: EditMessageOptions): Promise<void> {
    const { message } = options;
    
    return await this.editMessage({
      botId: message.botId,
      syncId: message.syncId,
      body: message.body,
      metadata: message.metadata,
      bubbles: message.bubbles,
      keyboard: message.keyboard,
      file: message.file,
      markupAutoAdjust: message.markupAutoAdjust,
    });
  }

  /**
   * Редактирует сообщение с указанными параметрами
   * @param options - параметры редактирования
   * @param options.botId - ID бота
   * @param options.syncId - syncId сообщения для редактирования
   * @param options.body - новый текст сообщения (опционально)
   * @param options.metadata - новые метаданные (опционально)
   * @param options.bubbles - новая разметка пузырьков (опционально)
   * @param options.keyboard - новая клавиатура (опционально)
   * @param options.file - новый файл (опционально)
   * @param options.markupAutoAdjust - автоматическая настройка разметки
   * @returns Promise<void>
   */
  async editMessage(options: EditMessageWithParamsOptions): Promise<void> {
    const {
      botId,
      syncId,
      body,
      metadata,
      bubbles,
      keyboard,
      file,
      markupAutoAdjust,
    } = options;

    const method = new EditEventMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPIEditEventRequestPayload.fromDomain(
      syncId,
      body || Undefined,
      metadata || Undefined,
      bubbles || Undefined,
      keyboard || Undefined,
      file || Undefined,
      markupAutoAdjust || Undefined,
    );

    await method.execute(payload);
  }

  // ========================================
  // ОТВЕТЫ НА СООБЩЕНИЯ
  // ========================================

  /**
   * Отвечает на сообщение, используя объект ReplyMessage
   * @param options - параметры ответа
   * @param options.message - объект сообщения для ответа
   * @returns Promise<void>
   */
  async reply(options: ReplyOptions): Promise<void> {
    const { message } = options;
    
    return await this.replyMessage({
      botId: message.botId,
      syncId: message.syncId,
      body: message.body,
      metadata: message.metadata,
      bubbles: message.bubbles,
      keyboard: message.keyboard,
      file: message.file,
      silentResponse: message.silentResponse,
      markupAutoAdjust: message.markupAutoAdjust,
      stealthMode: message.stealthMode,
      sendPush: message.sendPush,
      ignoreMute: message.ignoreMute,
    });
  }

  /**
   * Отвечает на сообщение с указанными параметрами
   * @param options - параметры ответа
   * @param options.botId - ID бота
   * @param options.syncId - syncId сообщения, на которое отвечаем
   * @param options.body - текст ответа
   * @param options.metadata - опциональные метаданные
   * @param options.bubbles - опциональная разметка пузырьков
   * @param options.keyboard - опциональная клавиатура
   * @param options.file - опциональный файл
   * @param options.silentResponse - тихий ответ
   * @param options.markupAutoAdjust - автоматическая настройка разметки
   * @param options.stealthMode - режим скрытности
   * @param options.sendPush - отправлять push-уведомления
   * @param options.ignoreMute - игнорировать режим "не беспокоить"
   * @returns Promise<void>
   */
  async replyMessage(options: ReplyMessageOptions): Promise<void> {
    const {
      botId,
      syncId,
      body,
      metadata,
      bubbles,
      keyboard,
      file,
      silentResponse,
      markupAutoAdjust,
      stealthMode,
      sendPush,
      ignoreMute,
    } = options;

    const payload = BotXAPIReplyEventRequestPayload.fromDomain(
      syncId,
      body,
      metadata || Undefined,
      bubbles || Undefined,
      keyboard || Undefined,
      file || Undefined,
      silentResponse || Undefined,
      markupAutoAdjust || Undefined,
      stealthMode || Undefined,
      sendPush || Undefined,
      ignoreMute || Undefined,
    );

    const method = new ReplyEventMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    await method.execute(payload);
  }

  // ========================================
  // УПРАВЛЕНИЕ СООБЩЕНИЯМИ
  // ========================================

  /**
   * Получает статус сообщения
   * @param options - параметры запроса
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @param options.syncId - syncId сообщения
   * @returns Promise<MessageStatus> - статус сообщения
   */
  async getMessageStatus(options: GetMessageStatusOptions): Promise<MessageStatus> {
    const { botId, syncId } = options;

    const payload = BotXAPIMessageStatusRequestPayload.fromDomain(syncId);

    const method = new MessageStatusMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const botxApiMessageStatus = await method.execute(payload);
    return botxApiMessageStatus.toDomain();
  }

  /**
   * Начинает показывать индикатор "печатает..."
   * @param options - параметры
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @returns Promise<void>
   */
  async startTyping(options: StartTypingOptions): Promise<void> {
    const { botId, chatId } = options;

    const payload: BotXAPITypingEventRequestPayload = {
      group_chat_id: chatId,
    };

    const method = new TypingEventMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    await method.execute(payload);
  }

  /**
   * Останавливает показывать индикатор "печатает..."
   * @param options - параметры
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @returns Promise<void>
   */
  async stopTyping(options: StopTypingOptions): Promise<void> {
    const { botId, chatId } = options;

    const payload: BotXAPIStopTypingEventRequestPayload = {
      group_chat_id: chatId,
    };

    const method = new StopTypingEventMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    await method.execute(payload);
  }

  /**
   * Удаляет сообщение
   * @param options - параметры
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @param options.syncId - syncId сообщения для удаления
   * @returns Promise<void>
   */
  async deleteMessage(options: DeleteMessageOptions): Promise<void> {
    const { botId, syncId } = options;

    const payload = BotXAPIDeleteEventRequestPayload.fromDomain(syncId);

    const method = new DeleteEventMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    await method.execute(payload);
  }

  // ========================================
  // УПРАВЛЕНИЕ ЧАТАМИ
  // ========================================

  /**
   * Получает список чатов бота
   * @param options - параметры запроса
   * @param options.botId - ID бота
   * @returns Promise<ChatListItem[]> - список чатов
   */
  async listChats(options: ListChatsOptions): Promise<ChatListItem[]> {
    const { botId } = options;

    const method = new ListChatsMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const botxApiListChat = await method.execute();
    return botxApiListChat.toDomain();
  }

  /**
   * Получает информацию о чате
   * @param options - параметры запроса
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @returns Promise<ChatInfo> - информация о чате
   */
  async chatInfo(options: ChatInfoOptions): Promise<ChatInfo> {
    const { botId, chatId } = options;

    const method = new ChatInfoMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPIChatInfoRequestPayload.fromDomain(chatId);

    const botxApiChatInfo = await method.execute(payload);
    return botxApiChatInfo.toDomain();
  }

  /**
   * Добавляет пользователей в чат
   * @param options - параметры
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @param options.huids - массив HUID пользователей для добавления
   * @returns Promise<void>
   */
  async addUsersToChat(options: AddUsersToChatOptions): Promise<void> {
    const { botId, chatId, huids } = options;

    const method = new AddUserMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPIAddUserRequestPayload.fromDomain(chatId, huids);

    await method.execute(payload);
  }

  /**
   * Удаляет пользователей из чата
   * @param options - параметры
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @param options.huids - массив HUID пользователей для удаления
   * @returns Promise<void>
   */
  async removeUsersFromChat(options: RemoveUsersFromChatOptions): Promise<void> {
    const { botId, chatId, huids } = options;

    const method = new RemoveUserMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPIRemoveUserRequestPayload.fromDomain(chatId, huids);

    await method.execute(payload);
  }

  /**
   * Назначает пользователей администраторами чата
   * @param options - параметры
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @param options.huids - массив HUID пользователей для назначения администраторами
   * @returns Promise<void>
   */
  async promoteToChatAdmins(options: PromoteToChatAdminsOptions): Promise<void> {
    const { botId, chatId, huids } = options;

    const method = new AddAdminMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPIAddAdminRequestPayload.fromDomain(chatId, huids);

    await method.execute(payload);
  }

  /**
   * Включает режим скрытности для чата
   * @param options - параметры
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @param options.disableWebClient - отключить веб-клиент (опционально)
   * @param options.ttlAfterRead - время жизни после прочтения в секундах (опционально)
   * @param options.totalTtl - общее время жизни в секундах (опционально)
   * @returns Promise<void>
   */
  async enableStealth(options: EnableStealthOptions): Promise<void> {
    const { botId, chatId, disableWebClient, ttlAfterRead, totalTtl } = options;

    const method = new SetStealthMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPISetStealthRequestPayload.fromDomain(
      chatId,
      disableWebClient || Undefined,
      ttlAfterRead || Undefined,
      totalTtl || Undefined
    );

    await method.execute(payload);
  }

  /**
   * Отключает режим скрытности для чата
   * @param options - параметры
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @returns Promise<void>
   */
  async disableStealth(options: DisableStealthOptions): Promise<void> {
    const { botId, chatId } = options;

    const method = new DisableStealthMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPIDisableStealthRequestPayload.fromDomain(chatId);

    await method.execute(payload);
  }

  /**
   * Закрепляет сообщение в чате
   * @param options - параметры
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @param options.syncId - syncId сообщения для закрепления
   * @returns Promise<void>
   */
  async pinMessage(options: PinMessageOptions): Promise<void> {
    const { botId, chatId, syncId } = options;

    const method = new PinMessageMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPIPinMessageRequestPayload.fromDomain(chatId, syncId);

    await method.execute(payload);
  }

  /**
   * Открепляет сообщение в чате
   * @param options - параметры
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @returns Promise<void>
   */
  async unpinMessage(options: UnpinMessageOptions): Promise<void> {
    const { botId, chatId } = options;

    const method = new UnpinMessageMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPIUnpinMessageRequestPayload.fromDomain(chatId);

    await method.execute(payload);
  }

  // ========================================
  // ПОИСК ПОЛЬЗОВАТЕЛЕЙ
  // ========================================

  /**
   * Ищет пользователей по email адресам
   * @param options - параметры поиска
   * @param options.botId - ID бота
   * @param options.emails - массив email адресов для поиска
   * @returns Promise<UserFromSearch[]> - массив найденных пользователей
   */
  async searchUserByEmails(options: SearchUserByEmailsOptions): Promise<UserFromSearch[]> {
    const { botId, emails } = options;

    const method = new SearchUserByEmailsMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPISearchUserByEmailsRequestPayload.fromDomain(emails);

    const botxApiUsersFromSearch = await method.execute(payload);
    return botxApiUsersFromSearch.toDomain();
  }

  /**
   * Ищет пользователя по email адресу
   * @param options - параметры поиска
   * @param options.botId - ID бота
   * @param options.email - email адрес для поиска
   * @returns Promise<UserFromSearch> - найденный пользователь
   */
  async searchUserByEmail(options: SearchUserByEmailOptions): Promise<UserFromSearch> {
    const { botId, email } = options;

    const method = new SearchUserByEmailMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPISearchUserByEmailRequestPayload.fromDomain(email);

    const botxApiUserFromSearch = await method.execute(payload);
    return botxApiUserFromSearch.toDomain();
  }

  /**
   * Ищет пользователя по HUID
   * @param options - параметры поиска
   * @param options.botId - ID бота
   * @param options.huid - HUID пользователя для поиска
   * @returns Promise<UserFromSearch> - найденный пользователь
   */
  async searchUserByHuid(options: SearchUserByHuidOptions): Promise<UserFromSearch> {
    const { botId, huid } = options;

    const method = new SearchUserByHUIDMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPISearchUserByHUIDRequestPayload.fromDomain(huid);

    const botxApiUserFromSearch = await method.execute(payload);
    return botxApiUserFromSearch.toDomain();
  }

  /**
   * Ищет пользователя по AD логину и домену
   * @param options - параметры поиска
   * @param options.botId - ID бота
   * @param options.adLogin - AD логин пользователя
   * @param options.adDomain - AD домен пользователя
   * @returns Promise<UserFromSearch> - найденный пользователь
   */
  async searchUserByAd(options: SearchUserByAdOptions): Promise<UserFromSearch> {
    const { botId, adLogin, adDomain } = options;

    const method = new SearchUserByLoginMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPISearchUserByLoginRequestPayload.fromDomain(adLogin, adDomain);

    const botxApiUserFromSearch = await method.execute(payload);
    return botxApiUserFromSearch.toDomain();
  }

  /**
   * Ищет пользователя по другому ID
   * @param options - параметры поиска
   * @param options.botId - ID бота
   * @param options.otherId - другой ID пользователя для поиска
   * @returns Promise<User> - найденный пользователь
   */
  async searchUserByOtherId(options: SearchUserByOtherIdOptions): Promise<any> {
    const { botId, otherId } = options;

    const method = new SearchUserByOtherIdMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPISearchUserByOtherIdRequestPayload.fromDomain(otherId);

    const botxApiUserFromSearch = await method.execute(payload);
    return botxApiUserFromSearch.toDomain();
  }

  // ========================================
  // РАБОТА С ФАЙЛАМИ
  // ========================================

  /**
   * Скачивает файл из чата
   * @param options - параметры скачивания
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @param options.fileId - ID файла для скачивания
   * @param options.asyncBuffer - буфер для записи файла
   * @returns Promise<void>
   */
  async downloadFile(options: DownloadFileOptions): Promise<void> {
    const { botId, chatId, fileId, asyncBuffer } = options;

    const method = new DownloadFileMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPIDownloadFileRequestPayload.fromDomain(chatId, fileId);

    await method.execute(payload, asyncBuffer);
  }

  /**
   * Загружает файл в чат
   * @param options - параметры загрузки
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @param options.asyncBuffer - буфер с данными файла
   * @param options.filename - имя файла
   * @param options.duration - длительность для аудио/видео файлов (опционально)
   * @param options.caption - подпись к файлу (опционально)
   * @returns Promise<FileAttachment> - информация о загруженном файле
   */
  async uploadFile(options: UploadFileOptions): Promise<any> {
    const { botId, chatId, asyncBuffer, filename, duration, caption } = options;

    const method = new UploadFileMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPIUploadFileRequestPayload.fromDomain(
      chatId,
      duration || Undefined,
      caption || Undefined
    );

    const botxApiAsyncFile = await method.execute(payload, asyncBuffer, filename);
    return botxApiAsyncFile.toDomain();
  }

  // ========================================
  // OPENID И МЕТРИКИ
  // ========================================

  /**
   * Обновляет токен доступа OpenID для пользователя
   * @param options - параметры обновления
   * @param options.botId - ID бота
   * @param options.huid - HUID пользователя
   * @param options.ref - опциональный ref параметр
   * @returns Promise<void>
   */
  async refreshAccessToken(options: RefreshAccessTokenOptions): Promise<void> {
    const { botId, huid, ref } = options;

    const method = new RefreshAccessTokenMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPIRefreshAccessTokenRequestPayload.fromDomain(huid, ref);

    await method.execute(payload);
  }

  /**
   * Собирает метрику использования функции бота
   * @param options - параметры сбора метрики
   * @param options.botId - ID бота
   * @param options.botFunction - название функции бота
   * @param options.huids - массив HUID пользователей
   * @param options.chatId - ID чата
   * @returns Promise<void>
   */
  async collectMetric(options: CollectMetricOptions): Promise<void> {
    const { botId, botFunction, huids, chatId } = options;

    const method = new CollectBotFunctionMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPICollectBotFunctionRequestPayload.fromDomain(
      botFunction,
      huids,
      chatId
    );

    await method.execute(payload);
  }

  // ========================================
  // СТИКЕРЫ
  // ========================================

  /**
   * Получает информацию о пачке стикеров
   * @param options - параметры запроса
   * @param options.botId - ID бота
   * @param options.stickerPackId - ID пачки стикеров
   * @returns Promise<StickerPack> - информация о пачке стикеров
   */
  async getStickerPack(options: GetStickerPackOptions): Promise<any> {
    const { botId, stickerPackId } = options;

    const method = new GetStickerPackMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPIGetStickerPackRequestPayload.fromDomain(stickerPackId);

    const botxApiStickerPack = await method.execute(payload);
    return botxApiStickerPack.toDomain();
  }

  /**
   * Получает информацию о стикере
   * @param options - параметры запроса
   * @param options.botId - ID бота
   * @param options.stickerPackId - ID пачки стикеров
   * @param options.stickerId - ID стикера
   * @returns Promise<Sticker> - информация о стикере
   */
  async getSticker(options: GetStickerOptions): Promise<any> {
    const { botId, stickerPackId, stickerId } = options;

    const method = new GetStickerMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPIGetStickerRequestPayload.fromDomain(stickerPackId, stickerId);

    const botxApiSticker = await method.execute(payload);
    return botxApiSticker.toDomain(stickerPackId);
  }

  // ========================================
  // SMARTAPPS
  // ========================================

  /**
   * Отправляет событие в SmartApp
   * @param options - параметры события
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @param options.data - данные события
   * @param options.encrypted - шифровать ли данные (по умолчанию true)
   * @param options.ref - опциональный ref параметр
   * @param options.opts - опциональные параметры
   * @param options.files - опциональный массив файлов
   * @returns Promise<void>
   */
  async sendSmartappEvent(options: SendSmartappEventOptions): Promise<void> {
    const { botId, chatId, data, encrypted = true, ref, opts, files } = options;

    const method = new SmartAppEventMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPISmartAppEventRequestPayload.fromDomain(
      ref || Undefined,
      botId,
      chatId,
      data,
      opts || Undefined,
      files || Undefined,
      encrypted
    );

    await method.execute(payload);
  }

  /**
   * Отправляет уведомление в SmartApp
   * @param options - параметры уведомления
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @param options.smartappCounter - счетчик SmartApp
   * @param options.body - опциональный текст уведомления
   * @param options.opts - опциональные параметры
   * @param options.meta - опциональные метаданные
   * @returns Promise<void>
   */
  async sendSmartappNotification(options: SendSmartappNotificationOptions): Promise<void> {
    const { botId, chatId, smartappCounter, body, opts, meta } = options;

    const method = new SmartAppNotificationMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPISmartAppNotificationRequestPayload.fromDomain(
      chatId,
      smartappCounter,
      body ?? Undefined,
      opts ?? Undefined,
      meta ?? Undefined
    );

    await method.execute(payload);
  }

  /**
   * Получает список SmartApps
   * @param options - параметры запроса
   * @param options.botId - ID бота
   * @param options.version - опциональная версия API
   * @returns Promise<[SmartApp[], number]> - кортеж из списка SmartApps и версии API
   */
  async getSmartappsList(options: GetSmartappsListOptions): Promise<[any[], number]> {
    const { botId, version } = options;

    const method = new SmartAppsListMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPISmartAppsListRequestPayload.fromDomain(
      version ?? Undefined
    );

    const botxApiSmartappsList = await method.execute(payload);
    return botxApiSmartappsList.toDomain();
  }

  /**
   * Загружает статический файл для SmartApp
   * @param options - параметры загрузки
   * @param options.botId - ID бота
   * @param options.asyncBuffer - буфер с данными файла
   * @param options.filename - имя файла
   * @returns Promise<string> - URL загруженного файла
   */
  async uploadStaticFile(options: UploadStaticFileOptions): Promise<string> {
    const { botId, asyncBuffer, filename } = options;

    const method = new SmartAppUploadFileMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const botxApiStaticFile = await method.execute(asyncBuffer, filename);
    return botxApiStaticFile.toDomain();
  }

  /**
   * Отправляет кастомное уведомление в SmartApp
   * @param options - параметры уведомления
   * @param options.botId - ID бота
   * @param options.groupChatId - ID группового чата
   * @param options.title - заголовок уведомления
   * @param options.body - текст уведомления
   * @param options.meta - опциональные метаданные
   * @param options.waitCallback - ожидать ли callback (по умолчанию true)
   * @param options.callbackTimeout - таймаут для callback
   * @returns Promise<string> - syncId уведомления
   */
  async sendSmartappCustomNotification(options: SendSmartappCustomNotificationOptions): Promise<string> {
    const { botId, groupChatId, title, body, meta, waitCallback = true, callbackTimeout } = options;

    const method = new SmartAppCustomNotificationMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPISmartAppCustomNotificationRequestPayload.fromDomain(
      groupChatId,
      title,
      body,
      meta ?? Undefined
    );

    const botxApiSyncId = await method.execute(
      payload,
      waitCallback,
      callbackTimeout,
      this._defaultCallbackTimeout
    );

    return botxApiSyncId.toDomain();
  }

  /**
   * Отправляет счетчик непрочитанных сообщений в SmartApp
   * @param options - параметры счетчика
   * @param options.botId - ID бота
   * @param options.groupChatId - ID группового чата
   * @param options.counter - количество непрочитанных сообщений
   * @param options.waitCallback - ожидать ли callback (по умолчанию true)
   * @param options.callbackTimeout - таймаут для callback
   * @returns Promise<string> - syncId счетчика
   */
  async sendSmartappUnreadCounter(options: SendSmartappUnreadCounterOptions): Promise<string> {
    const { botId, groupChatId, counter, waitCallback = true, callbackTimeout } = options;

    const method = new SmartAppUnreadCounterMethod(
      botId,
      this._httpClient,
      this._botAccountsStorage,
    );

    const payload = BotXAPISmartAppUnreadCounterRequestPayload.fromDomain(
      groupChatId,
      counter
    );

    const botxApiSyncId = await method.execute(
      payload,
      waitCallback,
      callbackTimeout,
      this._defaultCallbackTimeout
    );

    return botxApiSyncId.toDomain();
  }

  /**
   * Отправляет внутреннее уведомление бота
   * @param options - параметры уведомления
   * @param options.botId - ID бота
   * @param options.chatId - ID чата
   * @param options.data - данные уведомления
   * @param options.opts - опциональные параметры
   * @param options.recipients - список получателей (пустой для всех в чате)
   * @param options.waitCallback - ожидать ли callback (по умолчанию true)
   * @param options.callbackTimeout - таймаут для callback
   * @returns Promise<string> - syncId уведомления
   */
  async sendInternalBotNotification(options: SendInternalBotNotificationOptions): Promise<string> {
    const method = new InternalBotNotificationMethod(
      options.botId,
      this._httpClient,
      this._botAccountsStorage
    );
    const payload = BotXAPIInternalBotNotificationRequestPayload.fromDomain(
      options.chatId,
      options.data,
      options.opts ?? Undefined,
      options.recipients ?? Undefined
    );
    const response = await method.execute(
      payload,
      options.waitCallback ?? true,
      options.callbackTimeout,
      this._defaultCallbackTimeout
    );
    return response.toDomain();
  }

  /**
   * Создает новый чат
   * @param options - параметры создания чата
   * @param options.botId - ID бота
   * @param options.name - видимое имя чата
   * @param options.chatType - тип чата
   * @param options.huids - список ID аккаунтов eXpress
   * @param options.description - описание чата
   * @param options.sharedHistory - открывать ли старую историю чата для новых пользователей (по умолчанию false)
   * @returns Promise<string> - UUID созданного чата
   */
  async createChat(options: CreateChatOptions): Promise<string> {
    const method = new CreateChatMethod(
      options.botId,
      this._httpClient,
      this._botAccountsStorage
    );
    const payload = BotXAPICreateChatRequestPayload.fromDomain(
      options.name,
      options.chatType,
      options.huids,
      options.sharedHistory ?? Undefined,
      options.description
    );
    const botxApiChatId = await method.execute(payload);
    return botxApiChatId.toDomain();
  }

  /**
   * Отправляет манифест SmartApp с заданными параметрами
   * @param options - параметры манифеста
   * @param options.botId - ID бота
   * @param options.ios - макет SmartApp для iOS клиентов
   * @param options.android - макет SmartApp для Android клиентов
   * @param options.webLayout - макет SmartApp для веб-клиентов
   * @param options.unreadCounter - сущности, на которые можно подписаться в счетчике непрочитанных
   * @returns Promise<any> - манифест SmartApp с установленными параметрами
   */
  async sendSmartappManifest(options: SendSmartappManifestOptions): Promise<any> {
    const method = new SmartAppManifestMethod(
      options.botId,
      this._httpClient,
      this._botAccountsStorage
    );
    const payload = BotXAPISmartAppManifestRequestPayload.fromDomain(
      options.ios ?? Undefined,
      options.android ?? Undefined,
      options.webLayout ?? Undefined,
      options.unreadCounter ?? Undefined
    );
    const smartappManifestResponse = await method.execute(payload);
    return smartappManifestResponse.toDomain();
  }

  /**
   * Обновляет профиль пользователя
   * @param options - параметры обновления профиля
   * @param options.botId - ID бота
   * @param options.userHuid - HUID пользователя, чей профиль нужно обновить
   * @param options.avatar - новый аватар пользователя
   * @param options.name - новое имя пользователя
   * @param options.publicName - новое публичное имя пользователя
   * @param options.company - новая компания пользователя
   * @param options.companyPosition - новая должность пользователя
   * @param options.description - новое описание пользователя
   * @param options.department - новый отдел пользователя
   * @param options.office - новый офис пользователя
   * @param options.manager - новый менеджер пользователя
   * @returns Promise<void>
   */
  async updateUserProfile(options: UpdateUserProfileOptions): Promise<void> {
    const method = new UpdateUsersProfileMethod(
      options.botId,
      this._httpClient,
      this._botAccountsStorage
    );
    const payload = BotXAPIUpdateUserProfileRequestPayload.fromDomain(
      options.userHuid,
      options.avatar ?? Undefined,
      options.name ?? Undefined,
      options.publicName ?? Undefined,
      options.company ?? Undefined,
      options.companyPosition ?? Undefined,
      options.description ?? Undefined,
      options.department ?? Undefined,
      options.office ?? Undefined,
      options.manager ?? Undefined
    );
    await method.execute(payload);
  }

  /**
   * Получает список пользователей в формате CSV
   * @param options - параметры запроса
   * @param options.botId - ID бота
   * @param options.ctsUser - включать ли CTS пользователей в список (по умолчанию true)
   * @param options.unregistered - включать ли незарегистрированных пользователей в список (по умолчанию true)
   * @param options.botx - включать ли ботов в список (по умолчанию false)
   * @returns Promise<UserFromCSV[]> - список пользователей
   */
  async usersAsCsv(options: UsersAsCsvOptions): Promise<UserFromCSV[]> {
    const method = new UsersAsCSVMethod(
      options.botId,
      this._httpClient,
      this._botAccountsStorage
    );
    const payload = BotXAPIUsersAsCSVRequestPayload.fromDomain(
      options.ctsUser ?? true,
      options.unregistered ?? true,
      options.botx ?? false
    );
    const { SpooledAsyncBuffer } = await import("@asyncBuffer");
    const writeBuffer = new SpooledAsyncBuffer();
    await method.execute(payload, writeBuffer);
    await writeBuffer.seek(0);
    const csvData = await writeBuffer.read();
    const csvString = Buffer.from(csvData).toString('utf-8');
    const lines = csvString.split('\n').filter(line => line.trim());
    const users: UserFromCSV[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = this.parseCsvLine(line);
      if (values.length >= 8) {
        const user = new UserFromCSV(
          values[0] || '',
          values[1] || '',
          values[2] || '',
          values[3] || '',
          values[4] as any || 'ADMIN',
          values[5] === 'true',
          values[6] as any || 'CTS_USER',
          values[7] || null,
          values[8] || null,
          values[9] || null,
          values[10] || null,
          values[11] || null,
          values[12] || null,
          values[13] || null,
          values[14] || null,
          values[15] || null,
          values[16] || null,
          values[17] || null,
          values[18] || null,
          values[19] || null,
          values[20] || null,
          values[21] || null
        );
        users.push(user);
      }
    }
    return users;
  }

  /**
   * Парсит строку CSV с учетом кавычек
   * @param line - строка CSV
   * @returns string[] - массив значений
   */
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  // ========================================
  // МЕТОДЫ ДЛЯ РАБОТЫ СО СТИКЕРАМИ
  // ========================================

  /**
   * Создает пустой пак стикеров
   * @param options - параметры создания пака
   * @param options.botId - ID бота
   * @param options.name - имя пака стикеров
   * @param options.huid - создатель пака стикеров
   * @returns Promise<any> - созданный пак стикеров
   */
  async createStickerPack(options: CreateStickerPackOptions): Promise<any> {
    const method = new CreateStickerPackMethod(
      options.botId,
      this._httpClient,
      this._botAccountsStorage
    );
    const payload = BotXAPICreateStickerPackRequestPayload.fromDomain(
      options.name,
      options.huid ?? Undefined
    );
    const botxApiStickerPack = await method.execute(payload);
    return botxApiStickerPack.toDomain();
  }

  /**
   * Добавляет стикер в пак стикеров
   * @param options - параметры добавления стикера
   * @param options.botId - ID бота
   * @param options.stickerPackId - ID пака стикеров, куда добавить
   * @param options.emoji - эмодзи стикера
   * @param options.asyncBuffer - файл изображения стикера (только PNG)
   * @returns Promise<any> - добавленный стикер
   */
  async addSticker(options: AddStickerOptions): Promise<any> {
    const method = new AddStickerMethod(
      options.botId,
      this._httpClient,
      this._botAccountsStorage
    );
    const payload = await BotXAPIAddStickerRequestPayload.fromDomain(
      options.stickerPackId,
      options.emoji,
      options.asyncBuffer
    );
    const botxApiSticker = await method.execute(payload);
    return botxApiSticker.toDomain(options.stickerPackId);
  }

  /**
   * Удаляет стикер из пака стикеров
   * @param options - параметры удаления стикера
   * @param options.botId - ID бота
   * @param options.stickerPackId - ID пака стикеров
   * @param options.stickerId - ID стикера для удаления
   * @returns Promise<void>
   */
  async deleteSticker(options: DeleteStickerOptions): Promise<void> {
    const method = new DeleteStickerMethod(
      options.botId,
      this._httpClient,
      this._botAccountsStorage
    );
    const payload = await BotXAPIDeleteStickerRequestPayload.fromDomain(
      options.stickerId,
      options.stickerPackId
    );
    await method.execute(payload);
  }

  /**
   * Итерируется по пакам стикеров пользователя
   * @param options - параметры итерации
   * @param options.botId - ID бота
   * @param options.userHuid - HUID пользователя
   * @returns AsyncIterable<any> - итератор по пакам стикеров
   */
  async *iterateByStickerPacks(options: IterateByStickerPacksOptions): AsyncIterable<any> {
    let after: string | undefined = undefined;
    const STICKER_PACKS_PER_PAGE = 50;
    const method = new GetStickerPacksMethod(
      options.botId,
      this._httpClient,
      this._botAccountsStorage
    );
    while (true) {
      const payload = BotXAPIGetStickerPacksRequestPayload.fromDomain(
        options.userHuid,
        STICKER_PACKS_PER_PAGE,
        after
      );
      const botxApiStickerPackList = await method.execute(payload);
      const stickerPackPage = botxApiStickerPackList.toDomain();
      after = stickerPackPage.after;
      for (const stickerPack of stickerPackPage.sticker_packs) {
        yield stickerPack;
      }
      if (!after) {
        break;
      }
    }
  }

  /**
   * Удаляет существующий пак стикеров
   * @param options - параметры удаления пака
   * @param options.botId - ID бота
   * @param options.stickerPackId - ID пака стикеров для удаления
   * @returns Promise<void>
   */
  async deleteStickerPack(options: DeleteStickerPackOptions): Promise<void> {
    const method = new DeleteStickerPackMethod(
      options.botId,
      this._httpClient,
      this._botAccountsStorage
    );
    const payload = BotXAPIDeleteStickerPackRequestPayload.fromDomain(
      options.stickerPackId
    );
    await method.execute(payload);
  }

  /**
   * Редактирует пак стикеров
   * @param options - параметры редактирования
   * @param options.botId - ID бота
   * @param options.stickerPackId - ID пака стикеров
   * @param options.name - новое имя пака
   * @param options.preview - ID превью стикера
   * @param options.stickersOrder - порядок стикеров
   * @returns Promise<any> - отредактированный пак стикеров
   */
  async editStickerPack(options: EditStickerPackOptions): Promise<any> {
    const method = new EditStickerPackMethod(
      options.botId,
      this._httpClient,
      this._botAccountsStorage
    );
    const payload = BotXAPIEditStickerPackRequestPayload.fromDomain(
      options.stickerPackId,
      options.name,
      options.preview,
      options.stickersOrder
    );
    const botxApiStickerPack = await method.execute(payload);
    return botxApiStickerPack.toDomain();
  }

  // ========================================
  // ГЕТТЕРЫ И ЖИЗНЕННЫЙ ЦИКЛ
  // ========================================

  /**
   * Получает итератор по аккаунтам ботов
   * @returns IterableIterator<BotAccountWithSecret> - итератор по аккаунтам ботов
   */
  get botAccounts(): IterableIterator<BotAccountWithSecret> {
    return this._botAccountsStorage.iterBotAccounts();
  }

  /**
   * Обновляет токены для всех аккаунтов ботов
   * @returns Promise<void>
   */
  async fetchTokens(): Promise<void> {
    for (const botAccount of this.botAccounts) {
      try {
        const token = await this.getToken(botAccount.id);
        this._botAccountsStorage.setToken(botAccount.id, token);
      } catch (error) {
        defaultLogger.warn(
          `Can't get token for bot account: host - ${botAccount.host}, bot_id - ${botAccount.id}`,
          error
        );
      }
    }
  }

  /**
   * Запускает бота
   * @param fetchTokens - обновлять ли токены при запуске (по умолчанию true)
   * @returns Promise<void>
   */
  async startup(fetchTokens = true): Promise<void> {
    if (fetchTokens) {
      await this.fetchTokens();
    }
  }

  /**
   * Останавливает бота
   * @returns Promise<void>
   */
  async shutdown(): Promise<void> {
    await this._callbacksManager.stopCallbacksWaiting();
    await this._handlerCollector.waitActiveTasks();
    // HttpClient не имеет метода close, поэтому просто завершаем работу
  }
} 