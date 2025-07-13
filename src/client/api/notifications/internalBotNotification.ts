import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower, callbackExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { Missing, MissingOptional } from "@missing";
import { ChatNotFoundError, RateLimitReachedError, BotIsNotChatMemberError, FinalRecipientsListEmptyError } from "@client/exceptions";

// Исключения (пока заглушки)
class ChatNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatNotFoundError";
  }
}

class RateLimitReachedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitReachedError";
  }
}

class BotIsNotChatMemberError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BotIsNotChatMemberError";
  }
}

class FinalRecipientsListEmptyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FinalRecipientsListEmptyError";
  }
}

export interface BotXAPIInternalBotNotificationRequestPayload {
  groupChatId: string;
  data: Record<string, any>;
  opts?: Record<string, any>;
  recipients?: string[];
}

export interface BotXAPISyncIdResult {
  syncId: string;
}

export interface BotXAPIInternalBotNotificationResponsePayload {
  status: "ok";
  result: BotXAPISyncIdResult;
  toDomain(): string;
}

export class InternalBotNotificationMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    (this.statusHandlers as any) = {
      ...this.statusHandlers,
      429: responseExceptionThrower(RateLimitReachedError),
    };
    (this.errorCallbackHandlers as any) = {
      ...this.errorCallbackHandlers,
      "chat_not_found": callbackExceptionThrower(ChatNotFoundError),
      "bot_is_not_a_chat_member": callbackExceptionThrower(BotIsNotChatMemberError),
      "event_recipients_list_is_empty": callbackExceptionThrower(FinalRecipientsListEmptyError),
    };
  }

  async execute(
    payload: BotXAPIInternalBotNotificationRequestPayload,
    waitCallback: boolean,
    callbackTimeout?: number,
    defaultCallbackTimeout: number = 30
  ): Promise<BotXAPIInternalBotNotificationResponsePayload> {
    const path = "/api/v4/botx/notifications/internal";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload }
    );

    const responseData = await response.json();
    const result: BotXAPIInternalBotNotificationResponsePayload = {
      status: responseData.status,
      result: responseData.result,
      toDomain() {
        return this.result.syncId;
      }
    };

    // Обработка callback (упрощенная версия)
    if (waitCallback) {
      await this.processCallback(
        result.result.syncId,
        waitCallback,
        callbackTimeout || null,
        defaultCallbackTimeout
      );
    }

    return result;
  }

  protected async processCallback(
    syncId: string,
    waitCallback: boolean,
    callbackTimeout: number | null,
    defaultCallbackTimeout: number
  ): Promise<any> {
    // Упрощенная реализация обработки callback
    // В реальной реализации здесь должна быть логика ожидания callback
    console.log(`Processing callback for syncId: ${syncId}`);
    return null;
  }
} 