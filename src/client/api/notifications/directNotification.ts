import { AuthorizedBotXMethod, HttpClient, callbackExceptionThrower } from "@client";
import { BotAccountsStorage, CallbackManager } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel } from "@models";
import { Missing } from "@missing";
import { ChatNotFoundError, BotIsNotChatMemberError, FinalRecipientsListEmptyError, StealthModeDisabledError } from "@client/exceptions";

export class BotXAPIDirectNotificationMessageOpts extends UnverifiedPayloadBaseModel {
  silent_response!: Missing<boolean>;
  buttons_auto_adjust!: Missing<boolean>;
}

export class BotXAPIDirectNotificationNestedOpts extends UnverifiedPayloadBaseModel {
  send!: Missing<boolean>;
  force_dnd!: Missing<boolean>;
}

export class BotXAPIDirectNotificationOpts extends UnverifiedPayloadBaseModel {
  stealth_mode!: Missing<boolean>;
  notification_opts!: Missing<BotXAPIDirectNotificationNestedOpts>;
}

export class BotXAPIDirectNotification extends UnverifiedPayloadBaseModel {
  status!: "ok";
  body!: string;
  metadata!: Missing<Record<string, any>>;
  opts!: Missing<BotXAPIDirectNotificationMessageOpts>;
  bubble!: Missing<any>;
  keyboard!: Missing<any>;
  mentions!: Missing<any[]>;
}

export class BotXAPIDirectNotificationRequestPayload extends UnverifiedPayloadBaseModel {
  group_chat_id!: string;
  notification!: BotXAPIDirectNotification;
  file!: Missing<any>;
  recipients!: Missing<string[]>;
  opts!: Missing<BotXAPIDirectNotificationOpts>;

  static fromDomain(
    chatId: string,
    body: string,
    metadata: Missing<Record<string, any>>,
    bubbles: Missing<any>,
    keyboard: Missing<any>,
    file: Missing<any>,
    recipients: Missing<string[]>,
    silentResponse: Missing<boolean>,
    markupAutoAdjust: Missing<boolean>,
    stealthMode: Missing<boolean>,
    sendPush: Missing<boolean>,
    ignoreMute: Missing<boolean>,
  ): BotXAPIDirectNotificationRequestPayload {
    // TODO: Добавить валидацию длины body
    // TODO: Добавить обработку mentions
    // TODO: Добавить конвертацию file attachment

    return new BotXAPIDirectNotificationRequestPayload({
      group_chat_id: chatId,
      notification: new BotXAPIDirectNotification({
        status: "ok",
        body,
        metadata,
        opts: new BotXAPIDirectNotificationMessageOpts({
          silent_response: silentResponse,
          buttons_auto_adjust: markupAutoAdjust,
        }),
        bubble: bubbles,
        keyboard,
        mentions: undefined,
      }),
      file,
      recipients,
      opts: new BotXAPIDirectNotificationOpts({
        stealth_mode: stealthMode,
        notification_opts: new BotXAPIDirectNotificationNestedOpts({
          send: sendPush,
          force_dnd: ignoreMute,
        }),
      }),
    });
  }
}

export class BotXAPISyncIdResult extends VerifiedPayloadBaseModel {
  sync_id!: string;
}

export class BotXAPIDirectNotificationResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: BotXAPISyncIdResult;

  toDomain(): string {
    return this.result.sync_id;
  }
}

export class DirectNotificationMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage,
    callbacksManager?: CallbackManager
  ) {
    super(senderBotId, httpClient, botAccountsStorage, callbacksManager);
    this.errorCallbackHandlers = {
      ...this.errorCallbackHandlers,
      "chat_not_found": callbackExceptionThrower(ChatNotFoundError),
      "bot_is_not_a_chat_member": callbackExceptionThrower(BotIsNotChatMemberError),
      "event_recipients_list_is_empty": callbackExceptionThrower(FinalRecipientsListEmptyError),
      "stealth_mode_disabled": callbackExceptionThrower(StealthModeDisabledError),
    };
  }

  async execute(
    payload: BotXAPIDirectNotificationRequestPayload,
    waitCallback: boolean,
    callbackTimeout: number | null,
    defaultCallbackTimeout: number
  ): Promise<BotXAPIDirectNotificationResponsePayload> {
    const path = "/api/v4/botx/notifications/direct";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      {
        headers: { "Content-Type": "application/json" },
        data: payload.jsonableDict()
      }
    );

    const apiModel = await this.verifyAndExtractApiModel(BotXAPIDirectNotificationResponsePayload, response);

    await this.processCallback(
      apiModel.result.sync_id,
      waitCallback,
      callbackTimeout,
      defaultCallbackTimeout,
    );
    return apiModel;
  }
} 