
import * as jwt from 'jsonwebtoken';
import { BotAccountWithSecret, BotAPIMethodFailedCallback, BotAPIMethodSuccessfulCallback, BotAPISmartAppEvent, BotAPIStatusRecipient, BotAPISyncSmartAppEventResponse, BotCommand, BotMenu, BotXMethodCallback, buildBotStatusResponse, IncomingFileAttachment, OutgoingAttachment, parseBotAPICommand, SmartAppEvent, StatusRecipient } from "@models";
import { HttpClient, createHttpClient, getToken } from '@client';
import { BOTX_DEFAULT_TIMEOUT } from '@constants';
import { defaultLogger, ILogger } from '@logger';
import { BotAccountsStorage } from './botAccountsStorage';
import { CallbackManager } from './callbacks/callbackManager';
import { CallbackMemoryRepo } from './callbacks/callbackMemoryRepo';
import { CallbackRepoProto } from './callbacks/callbackRepoProto';
import { RequestHeadersNotProvidedError, UnverifiedRequestError } from './exceptions';
import { Middleware } from './handler';
import { HandlerCollector } from './handlerCollector';
import { ExceptionHandlersDict } from './middlewares/exceptionMiddleware';

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
    logger = defaultLogger,
  }: {
    collectors: HandlerCollector[],
    botAccounts: BotAccountWithSecret[],
    middlewares?: Middleware[],
    httpClient?: HttpClient,
    exceptionHandlers?: ExceptionHandlersDict,
    defaultCallbackTimeout?: number,
    callbackRepo?: CallbackRepoProto,
    logger?: ILogger,
  }) {
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

    let tokenPayload: jwt.JwtPayload;
    try {
      // First decode without signature verification (like Python with verify_signature: False)
      tokenPayload = jwt.decode(token) as jwt.JwtPayload;
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
      jwt.verify(token, botAccount.secretKey, {
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
      const domainCommand = (command as any).toDomain(rawBotCommand);
      this.asyncExecuteBotCommand(domainCommand);
    } catch (validationExc) {
      throw new Error("Bot command validation error");
    }
  }

  asyncExecuteBotCommand(botCommand: BotCommand): Promise<void> {
    this._botAccountsStorage.getBotAccount(botCommand.bot.id);
    return this._handlerCollector.asyncHandleBotCommand(this, botCommand);
  }

  async getToken(botId: string): Promise<string> {
    return getToken(
      botId,
      this._httpClient,
      this._botAccountsStorage
    );
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
      const smartappEvent = parseBotAPICommand(rawSmartappEvent);
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
        botId: queryParams.bot_id,
        userHuid: queryParams.user_huid,
        adLogin: queryParams.ad_login,
        adDomain: queryParams.ad_domain,
        isAdmin: queryParams.is_admin === 'true',
        chatType: queryParams.chat_type,
      });
      const domainStatusRecipient = statusRecipient.toDomain();
      const botMenu = await this.getStatus(domainStatusRecipient);
      return buildBotStatusResponse(botMenu);
    } catch (validationExc) {
      throw new Error("Status request validation error");
    }
  }

  async getStatus(statusRecipient: StatusRecipient): Promise<BotMenu> {
    this._botAccountsStorage.getBotAccount(statusRecipient.botId);
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
      const callback = this.parseBotXMethodCallback(rawBotxMethodResult);
      await this._callbacksManager.setBotxMethodCallbackResult(callback);
    } catch (validationExc) {
      throw new Error("BotX method callback validation error");
    }
  }

  private parseBotXMethodCallback(data: Record<string, any>): BotXMethodCallback {
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

  async waitBotxMethodCallback(syncId: string): Promise<BotXMethodCallback> {
    const timeout = this._callbacksManager.cancelCallbackTimeoutAlarm(
      syncId,
      true // returnRemainingTime
    ) || this._defaultCallbackTimeout;

    return this._callbacksManager.waitBotxMethodCallback(syncId, timeout);
  }

  get botAccounts(): IterableIterator<BotAccountWithSecret> {
    return this._botAccountsStorage.iterBotAccounts();
  }

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

  async startup(fetchTokens = true): Promise<void> {
    if (fetchTokens) {
      await this.fetchTokens();
    }
  }

  async shutdown(): Promise<void> {
    await this._callbacksManager.stopCallbacksWaiting();
    await this._handlerCollector.waitActiveTasks();
    // HttpClient не имеет метода close, поэтому просто завершаем работу
  }

  // ... all other methods from pybotx Bot class will be implemented here ...
} 