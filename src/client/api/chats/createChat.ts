import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { ChatTypes, UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel, convertChatTypeFromDomain } from "@models";
import { Missing } from "@missing";
import { ChatCreationError, ChatCreationProhibitedError } from "@client/exceptions/chats";

export class BotXAPICreateChatRequestPayload extends UnverifiedPayloadBaseModel {
  name!: string;
  description?: string;
  chat_type!: string;
  members!: string[];
  shared_history!: Missing<boolean>;

  static fromDomain(
    name: string,
    chat_type: ChatTypes,
    huids: string[],
    sharedHistory: Missing<boolean>,
    description?: string
  ): BotXAPICreateChatRequestPayload {
    return new BotXAPICreateChatRequestPayload({
      name,
      chat_type: convertChatTypeFromDomain(chat_type),
      members: huids,
      description,
      shared_history: sharedHistory,
    });
  }
}

export class BotXAPIChatIdResult extends VerifiedPayloadBaseModel {
  chat_id!: string;
}

export class BotXAPICreateChatResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: BotXAPIChatIdResult;

  toDomain(): string {
    return this.result.chat_id;
  }
}

export class CreateChatMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    this.statusHandlers = {
      ...this.statusHandlers,
      403: responseExceptionThrower(ChatCreationProhibitedError),
      422: responseExceptionThrower(ChatCreationError),
    };
  }

  async execute(payload: BotXAPICreateChatRequestPayload): Promise<BotXAPICreateChatResponsePayload> {
    const path = "/api/v3/botx/chats/create";

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json: payload.jsonableDict() }
    );

    return this.verifyAndExtractApiModel(BotXAPICreateChatResponsePayload, response);
  }
} 