import { Bot } from './bot';
import { BotCommand } from '../models/commands';
import { StatusRecipient } from '../models/status';
import { BotMenu } from '../models/status';
import { IncomingMessage } from '../models/message/incomingMessage';
import { SmartAppEvent } from '../models/system_events/smartappEvent';
import { AddedToChatEvent } from '../models/system_events/addedToChat';
import { ChatCreatedEvent } from '../models/system_events/chatCreated';
import { ChatDeletedByUserEvent } from '../models/system_events/chatDeletedByUser';
import { DeletedFromChatEvent } from '../models/system_events/deletedFromChat';
import { LeftFromChatEvent } from '../models/system_events/leftFromChat';
import { CTSLoginEvent } from '../models/system_events/ctsLogin';
import { CTSLogoutEvent } from '../models/system_events/ctsLogout';
import { InternalBotNotificationEvent } from '../models/system_events/internalBotNotification';
import { EventEdit } from '../models/system_events/eventEdit';
import { JoinToChatEvent } from '../models/system_events/userJoinedToChat';
import { ConferenceChangedEvent } from '../models/system_events/conferenceChanged';
import { ConferenceCreatedEvent } from '../models/system_events/conferenceCreated';
import { ConferenceDeletedEvent } from '../models/system_events/conferenceDeleted';
import { BotAPISyncSmartAppEventResponse } from '../models/syncSmartappEvent';
import {
  HandlerFunc,
  BaseSystemEventHandlerFunc,
  SyncSmartAppEventHandlerFunc,
  IncomingMessageHandlerFunc,
  VisibleFunc,
  Middleware,
  CommandHandler,
  DefaultMessageHandler,
  HiddenCommandHandler,
  VisibleCommandHandler,
} from './handler';
import { ExceptionMiddleware, ExceptionHandlersDict } from './middlewares/exceptionMiddleware';
import { botVar, botIdVar, chatIdVar } from './contextVars';
import { logger } from '@logger';

export type MessageHandlerDecorator = (handlerFunc: IncomingMessageHandlerFunc) => IncomingMessageHandlerFunc;

export class HandlerCollector {
  private static readonly VALID_COMMAND_NAME_RE = /^\/[^\s\/]+$/u;

  private userCommandsHandlers: Map<string, CommandHandler> = new Map();
  private _defaultMessageHandler?: DefaultMessageHandler;
  private systemEventsHandlers: Map<new (...args: any[]) => BotCommand, BaseSystemEventHandlerFunc> = new Map();
  private syncSmartappEventHandler: Map<new (...args: any[]) => SmartAppEvent, SyncSmartAppEventHandlerFunc> = new Map();
  private middlewares: Middleware[] = [];
  private tasks: Set<Promise<void>> = new Set();

  constructor(middlewares?: Middleware[]) {
    if (middlewares) {
      this.middlewares = [...middlewares];
    }
  }

  include(...others: HandlerCollector[]): void {
    for (const collector of others) {
      this.includeCollector(collector);
    }
  }

  asyncHandleBotCommand(bot: Bot, botCommand: BotCommand): Promise<void> {
    const task = this.handleBotCommand(botCommand, bot);
    this.tasks.add(task);
    return task;
  }

  async handleIncomingMessageByCommand(message: IncomingMessage, bot: Bot, command: string): Promise<void> {
    const messageHandler = this.getCommandHandler(command);
    if (messageHandler) {
      this.fillContextVars(message, bot);
      await messageHandler.call(message, bot);
    }
  }

  async handleBotCommand(botCommand: BotCommand, bot: Bot): Promise<void> {
    if (botCommand instanceof IncomingMessage) {
      const messageHandler = this.getIncomingMessageHandler(botCommand);
      if (messageHandler) {
        this.fillContextVars(botCommand, bot);
        await messageHandler.call(botCommand, bot);
      }
    } else if (this.isSystemEvent(botCommand)) {
      const eventHandler = this.getSystemEventHandlerOrNone(botCommand);
      if (eventHandler) {
        this.fillContextVars(botCommand, bot);
        await eventHandler(botCommand, bot);
      }
    } else {
      throw new Error(`Unsupported event type: ${botCommand}`);
    }
  }

  async handleSyncSmartappEvent(bot: Bot, smartappEvent: SmartAppEvent): Promise<BotAPISyncSmartAppEventResponse> {
    if (!(smartappEvent instanceof SmartAppEvent)) {
      throw new Error(`Unsupported event type for sync smartapp event: ${smartappEvent}`);
    }

    const eventHandler = this.getSyncSmartappEventHandlerOrNone(smartappEvent);
    if (!eventHandler) {
      throw new Error('Handler for sync smartapp event not found');
    }

    this.fillContextVars(smartappEvent, bot);
    return await eventHandler(smartappEvent, bot);
  }

  async getBotMenu(statusRecipient: StatusRecipient, bot: Bot): Promise<BotMenu> {
    const botMenu: Record<string, string> = {};

    for (const [commandName, handler] of this.userCommandsHandlers) {
      if (handler.visible === true || (
        typeof handler.visible === 'function' &&
        await handler.visible(statusRecipient, bot)
      )) {
        if ('description' in handler) {
          botMenu[commandName] = handler.description;
        }
      }
    }

    return botMenu;
  }

  command(
    commandName: string,
    visible: boolean | VisibleFunc = true,
    description?: string,
    middlewares?: Middleware[]
  ): (handlerFunc: IncomingMessageHandlerFunc) => IncomingMessageHandlerFunc {
    if (!HandlerCollector.VALID_COMMAND_NAME_RE.test(commandName)) {
      throw new Error("Command should start with '/' and doesn't include spaces");
    }

    return (handlerFunc: IncomingMessageHandlerFunc): IncomingMessageHandlerFunc => {
      if (this.userCommandsHandlers.has(commandName)) {
        throw new Error(`Handler for command \`${commandName}\` already registered`);
      }

      const allMiddlewares = [...this.middlewares, ...(middlewares || [])];
      this.userCommandsHandlers.set(
        commandName,
        this.buildCommandHandler(handlerFunc, visible, description, allMiddlewares)
      );

      return handlerFunc;
    };
  }

  defaultMessageHandler(
    handlerFuncOrOptions?: IncomingMessageHandlerFunc | { middlewares?: Middleware[] },
    options?: { middlewares?: Middleware[] }
  ): IncomingMessageHandlerFunc | MessageHandlerDecorator {
    if (this._defaultMessageHandler) {
      throw new Error("Default command handler already registered");
    }

    const decorator = (handlerFunc: IncomingMessageHandlerFunc): IncomingMessageHandlerFunc => {
      const middlewares = options?.middlewares || [];
      const allMiddlewares = [...this.middlewares, ...middlewares];

      this._defaultMessageHandler = new DefaultMessageHandler(handlerFunc, allMiddlewares);
      return handlerFunc;
    };

    if (typeof handlerFuncOrOptions === 'function') {
      return decorator(handlerFuncOrOptions);
    }

    return decorator;
  }

  // System event handlers
  chatCreated(handlerFunc: HandlerFunc<ChatCreatedEvent>): HandlerFunc<ChatCreatedEvent> {
    this.systemEvent(ChatCreatedEvent, handlerFunc);
    return handlerFunc;
  }

  chatDeletedByUser(handlerFunc: HandlerFunc<ChatDeletedByUserEvent>): HandlerFunc<ChatDeletedByUserEvent> {
    this.systemEvent(ChatDeletedByUserEvent, handlerFunc);
    return handlerFunc;
  }

  addedToChat(handlerFunc: HandlerFunc<AddedToChatEvent>): HandlerFunc<AddedToChatEvent> {
    this.systemEvent(AddedToChatEvent, handlerFunc);
    return handlerFunc;
  }

  deletedFromChat(handlerFunc: HandlerFunc<DeletedFromChatEvent>): HandlerFunc<DeletedFromChatEvent> {
    this.systemEvent(DeletedFromChatEvent, handlerFunc);
    return handlerFunc;
  }

  leftFromChat(handlerFunc: HandlerFunc<LeftFromChatEvent>): HandlerFunc<LeftFromChatEvent> {
    this.systemEvent(LeftFromChatEvent, handlerFunc);
    return handlerFunc;
  }

  userJoinedToChat(handlerFunc: HandlerFunc<JoinToChatEvent>): HandlerFunc<JoinToChatEvent> {
    this.systemEvent(JoinToChatEvent, handlerFunc);
    return handlerFunc;
  }

  internalBotNotification(handlerFunc: HandlerFunc<InternalBotNotificationEvent>): HandlerFunc<InternalBotNotificationEvent> {
    this.systemEvent(InternalBotNotificationEvent, handlerFunc);
    return handlerFunc;
  }

  ctsLogin(handlerFunc: HandlerFunc<CTSLoginEvent>): HandlerFunc<CTSLoginEvent> {
    this.systemEvent(CTSLoginEvent, handlerFunc);
    return handlerFunc;
  }

  ctsLogout(handlerFunc: HandlerFunc<CTSLogoutEvent>): HandlerFunc<CTSLogoutEvent> {
    this.systemEvent(CTSLogoutEvent, handlerFunc);
    return handlerFunc;
  }

  eventEdit(handlerFunc: HandlerFunc<EventEdit>): HandlerFunc<EventEdit> {
    this.systemEvent(EventEdit, handlerFunc);
    return handlerFunc;
  }

  conferenceChanged(handlerFunc: HandlerFunc<ConferenceChangedEvent>): HandlerFunc<ConferenceChangedEvent> {
    this.systemEvent(ConferenceChangedEvent, handlerFunc);
    return handlerFunc;
  }

  conferenceCreated(handlerFunc: HandlerFunc<ConferenceCreatedEvent>): HandlerFunc<ConferenceCreatedEvent> {
    this.systemEvent(ConferenceCreatedEvent, handlerFunc);
    return handlerFunc;
  }

  conferenceDeleted(handlerFunc: HandlerFunc<ConferenceDeletedEvent>): HandlerFunc<ConferenceDeletedEvent> {
    this.systemEvent(ConferenceDeletedEvent, handlerFunc);
    return handlerFunc;
  }

  smartappEvent(handlerFunc: HandlerFunc<SmartAppEvent>): HandlerFunc<SmartAppEvent> {
    this.systemEvent(SmartAppEvent, handlerFunc);
    return handlerFunc;
  }

  syncSmartappEvent(handlerFunc: SyncSmartAppEventHandlerFunc): SyncSmartAppEventHandlerFunc {
    if (this.syncSmartappEventHandler.has(SmartAppEvent as new (...args: any[]) => SmartAppEvent)) {
      throw new Error("Handler for sync smartapp event already registered");
    }

    this.syncSmartappEventHandler.set(SmartAppEvent as new (...args: any[]) => SmartAppEvent, handlerFunc);
    return handlerFunc;
  }

  insertExceptionMiddleware(exceptionHandlers?: ExceptionHandlersDict): void {
    const exceptionMiddleware = new ExceptionMiddleware(exceptionHandlers || new Map());
    this.middlewares.unshift(exceptionMiddleware.dispatch.bind(exceptionMiddleware));
  }

  async waitActiveTasks(): Promise<void> {
    if (this.tasks.size > 0) {
      await Promise.all(this.tasks);
    }
  }

  private includeCollector(other: HandlerCollector): void {
    // Check for command duplicates
    const commandDuplicates = new Set<string>();
    for (const command of this.userCommandsHandlers.keys()) {
      if (other.userCommandsHandlers.has(command)) {
        commandDuplicates.add(command);
      }
    }
    if (commandDuplicates.size > 0) {
      throw new Error(`Handlers for ${Array.from(commandDuplicates)} commands already registered`);
    }

    // Include message handlers
    for (const [command, handler] of other.userCommandsHandlers) {
      handler.addMiddlewares(this.middlewares);
      this.userCommandsHandlers.set(command, handler);
    }

    // Include default handler
    if (this._defaultMessageHandler && other._defaultMessageHandler) {
      throw new Error("Default message handler already registered");
    }
    if (!this._defaultMessageHandler && other._defaultMessageHandler) {
      other._defaultMessageHandler.addMiddlewares(this.middlewares);
      this._defaultMessageHandler = other._defaultMessageHandler;
    }

    // Check for system event duplicates
    const eventsDuplicates = new Set<string>();
    for (const eventType of this.systemEventsHandlers.keys()) {
      if (other.systemEventsHandlers.has(eventType)) {
        eventsDuplicates.add(eventType.name);
      }
    }
    if (eventsDuplicates.size > 0) {
      throw new Error(`Handlers for ${Array.from(eventsDuplicates)} events already registered`);
    }

    // Include system event handlers
    for (const [eventType, handler] of other.systemEventsHandlers) {
      this.systemEventsHandlers.set(eventType, handler);
    }

    // Check for sync smartapp event duplicates
    const syncEventsDuplicates = new Set<string>();
    for (const eventType of this.syncSmartappEventHandler.keys()) {
      if (other.syncSmartappEventHandler.has(eventType)) {
        syncEventsDuplicates.add(eventType.name);
      }
    }
    if (syncEventsDuplicates.size > 0) {
      throw new Error("Handler for sync smartapp event already registered");
    }

    // Include sync smartapp event handlers
    for (const [eventType, handler] of other.syncSmartappEventHandler) {
      this.syncSmartappEventHandler.set(eventType, handler);
    }
  }

  private getIncomingMessageHandler(message: IncomingMessage): CommandHandler | DefaultMessageHandler | undefined {
    return this.getCommandHandler(message.body);
  }

  private getCommandHandler(command: string): CommandHandler | DefaultMessageHandler | undefined {
    let handler: CommandHandler | DefaultMessageHandler | undefined;

    const commandName = this.getCommandName(command);
    if (commandName) {
      handler = this.userCommandsHandlers.get(commandName);
      if (handler) {
        logger.info(`Found handler for command \`${commandName}\``);
        return handler;
      }
    }

    if (this._defaultMessageHandler) {
      this.logDefaultHandlerCall(commandName);
      return this._defaultMessageHandler;
    }

    logger.warn(`Handler for message text \`${command}\` not found`);
    return undefined;
  }

  private getSystemEventHandlerOrNone(event: BotCommand): BaseSystemEventHandlerFunc | undefined {
    const eventCls = event.constructor as new (...args: any[]) => BotCommand;
    const handler = this.systemEventsHandlers.get(eventCls);
    this.logSystemEventHandlerCall(eventCls.name, handler);
    return handler as BaseSystemEventHandlerFunc | undefined;
  }

  private getSyncSmartappEventHandlerOrNone(event: SmartAppEvent): SyncSmartAppEventHandlerFunc | undefined {
    const eventCls = event.constructor as new (...args: any[]) => SmartAppEvent;
    const handler = this.syncSmartappEventHandler.get(eventCls);
    this.logSystemEventHandlerCall(eventCls.name, handler);
    return handler;
  }

  private getCommandName(body: string): string | undefined {
    if (!body) {
      return undefined;
    }

    const commandName = body.split(' ')[0];
    if (HandlerCollector.VALID_COMMAND_NAME_RE.test(commandName)) {
      return commandName;
    }

    return undefined;
  }

  private buildCommandHandler(
    handlerFunc: IncomingMessageHandlerFunc,
    visible: boolean | VisibleFunc,
    description: string | undefined,
    middlewares: Middleware[]
  ): CommandHandler {
    if (visible === true || typeof visible === 'function') {
      if (!description) {
        throw new Error('Description is required for visible command');
      }

      return new VisibleCommandHandler(handlerFunc, description, visible, middlewares);
    }

    return new HiddenCommandHandler(handlerFunc, middlewares);
  }

  private systemEvent<T extends BotCommand>(
    eventClsName: new (...args: any[]) => T,
    handlerFunc: HandlerFunc<T>
  ): HandlerFunc<T> {
    if (this.systemEventsHandlers.has(eventClsName as new (...args: any[]) => BotCommand)) {
      throw new Error(`Handler for ${eventClsName.name} already registered`);
    }

    this.systemEventsHandlers.set(eventClsName as new (...args: any[]) => BotCommand, handlerFunc as BaseSystemEventHandlerFunc);
    return handlerFunc;
  }

  private fillContextVars(botCommand: BotCommand, bot: Bot): void {
    botVar.set(bot);

    if (botCommand instanceof IncomingMessage) {
      botIdVar.set(botCommand.bot.id);
      chatIdVar.set(botCommand.chat.id);
    } else {
      // For system events, try to get bot.id and chat.id
      const botId = botCommand.bot?.id || '';
      botIdVar.set(botId);

      const chat = (botCommand as any).chat;
      if (chat) {
        chatIdVar.set(chat.id);
      }
    }
  }

  private logSystemEventHandlerCall(eventClsName: string, handler: any): void {
    if (handler) {
      logger.info(`Found handler for \`${eventClsName}\``);
    } else {
      logger.info(`Handler for \`${eventClsName}\` not found`);
    }
  }

  private logDefaultHandlerCall(commandName?: string): void {
    if (commandName) {
      logger.info(`Handler for command \`${commandName}\` not found, using default handler`);
    } else {
      logger.info("No command found, using default handler");
    }
  }

  private isSystemEvent(command: BotCommand): boolean {
    // Check if command is a system event by checking its constructor
    const systemEventTypes = [
      AddedToChatEvent, ChatCreatedEvent, ChatDeletedByUserEvent, DeletedFromChatEvent,
      LeftFromChatEvent, CTSLoginEvent, CTSLogoutEvent, InternalBotNotificationEvent,
      EventEdit, JoinToChatEvent, ConferenceChangedEvent, ConferenceCreatedEvent,
      ConferenceDeletedEvent, SmartAppEvent
    ];

    return systemEventTypes.some(type => command instanceof type);
  }
} 