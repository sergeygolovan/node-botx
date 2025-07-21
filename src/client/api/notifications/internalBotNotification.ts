import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower, callbackExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { Missing, MissingOptional } from "@missing";
import { ChatNotFoundError, RateLimitReachedError, BotIsNotChatMemberError, FinalRecipientsListEmptyError } from "@client/exceptions";

export class BotXAPIInternalBotNotificationRequestPayload extends UnverifiedPayloadBaseModel {
  group_chat_id!: string;
  data!: Record<string, any>;
  opts!: Missing<Record<string, any>>;
  recipients!: MissingOptional<string[]>;

  static fromDomain(
    chatId: string,
    data: Record<string, any>,
    opts: Missing<Record<string, any>>,
    recipients: MissingOptional<string[]>
  ): BotXAPIInternalBotNotificationRequestPayload {
    return new BotXAPIInternalBotNotificationRequestPayload({
      group_chat_id: chatId,
      data,
      opts,
      recipients,
    });
  }
}

export class BotXAPISyncIdResult extends VerifiedPayloadBaseModel {
  sync_id!: string;
}

export class BotXAPIInternalBotNotificationResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: BotXAPISyncIdResult;

  toDomain(): string {
    return this.result.sync_id;
  }
}

export class InternalBotNotificationMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    this.statusHandlers = {
      ...this.statusHandlers,
      429: responseExceptionThrower(RateLimitReachedError),
    };
    this.errorCallbackHandlers = {
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
      {
        headers: { "Content-Type": "application/json" },
        data: payload.jsonableDict()
      }
    );

    const apiModel = await this.verifyAndExtractApiModel(BotXAPIInternalBotNotificationResponsePayload, response);

    await this.processCallback(
      apiModel.result.sync_id,
      waitCallback,
      callbackTimeout || null,
      defaultCallbackTimeout
    );

    return apiModel;
  }
} 