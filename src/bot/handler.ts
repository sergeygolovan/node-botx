import { Bot } from './bot';
import { IncomingMessage } from '../models/message/incomingMessage';
import { BotCommand } from '../models/commands';
import { StatusRecipient } from '../models/status';
import { BotAPISyncSmartAppEventResponse } from '../models/syncSmartappEvent';
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

// Type definitions
export type TBotCommand<T extends BotCommand = BotCommand> = T;
export type HandlerFunc<T extends BotCommand = BotCommand> = (command: T, bot: Bot) => Promise<void>;

export type SyncSmartAppEventHandlerFunc = (
  event: SmartAppEvent,
  bot: Bot
) => Promise<BotAPISyncSmartAppEventResponse>;

export type IncomingMessageHandlerFunc = HandlerFunc<IncomingMessage>;

export type SystemEventHandlerFunc =
  | HandlerFunc<AddedToChatEvent>
  | HandlerFunc<ChatCreatedEvent>
  | HandlerFunc<ChatDeletedByUserEvent>
  | HandlerFunc<DeletedFromChatEvent>
  | HandlerFunc<LeftFromChatEvent>
  | HandlerFunc<CTSLoginEvent>
  | HandlerFunc<CTSLogoutEvent>
  | HandlerFunc<InternalBotNotificationEvent>
  | HandlerFunc<SmartAppEvent>
  | HandlerFunc<EventEdit>
  | HandlerFunc<JoinToChatEvent>
  | HandlerFunc<ConferenceChangedEvent>
  | HandlerFunc<ConferenceCreatedEvent>
  | HandlerFunc<ConferenceDeletedEvent>;

export type VisibleFunc = (recipient: StatusRecipient, bot: Bot) => Promise<boolean>;

export type Middleware = (
  message: IncomingMessage,
  bot: Bot,
  callNext: IncomingMessageHandlerFunc
) => Promise<void>;

// Base class for incoming message handlers
export class BaseIncomingMessageHandler {
  constructor(
    public handlerFunc: IncomingMessageHandlerFunc,
    public middlewares: Middleware[] = []
  ) {}

  async call(message: IncomingMessage, bot: Bot): Promise<void> {
    let handlerFunc = this.handlerFunc;

    // Apply middlewares in reverse order
    for (const middleware of [...this.middlewares].reverse()) {
      const nextHandler = handlerFunc;
      handlerFunc = async (msg: IncomingMessage, b: Bot) => {
        await middleware(msg, b, nextHandler);
      };
    }

    await handlerFunc(message, bot);
  }

  addMiddlewares(middlewares: Middleware[]): void {
    this.middlewares = [...middlewares, ...this.middlewares];
  }
}

// Hidden command handler
export class HiddenCommandHandler extends BaseIncomingMessageHandler {
  readonly visible: false = false;

  constructor(handlerFunc: IncomingMessageHandlerFunc, middlewares: Middleware[] = []) {
    super(handlerFunc, middlewares);
  }
}

// Visible command handler
export class VisibleCommandHandler extends BaseIncomingMessageHandler {
  constructor(
    handlerFunc: IncomingMessageHandlerFunc,
    public description: string,
    public visible: true | VisibleFunc = true,
    middlewares: Middleware[] = []
  ) {
    super(handlerFunc, middlewares);
  }
}

// Default message handler
export class DefaultMessageHandler extends BaseIncomingMessageHandler {
  constructor(handlerFunc: IncomingMessageHandlerFunc, middlewares: Middleware[] = []) {
    super(handlerFunc, middlewares);
  }
}

export type CommandHandler = HiddenCommandHandler | VisibleCommandHandler; 