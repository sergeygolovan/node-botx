import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";
import { APIChatTypes, ChatListItem, VerifiedPayloadBaseModel, convertChatTypeToDomain } from "@models";
import { logger } from "@logger";

export class BotXAPIListChatResult extends VerifiedPayloadBaseModel {
  group_chat_id!: string;
  chat_type!: APIChatTypes;
  name!: string;
  description?: string;
  members!: string[];
  inserted_at!: string;
  updated_at!: string;
  shared_history!: boolean;
}

export class BotXAPIListChatResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: (BotXAPIListChatResult | Record<string, any>)[];

  toDomain(): ChatListItem[] {
    const chatsList = this.result
      .filter(chatItem => chatItem instanceof BotXAPIListChatResult)
      .map(chatItem => {
        const chat = chatItem as BotXAPIListChatResult;
        const chatType = convertChatTypeToDomain(chat.chat_type);
        
        // Проверяем, что тип чата поддерживается (как в Python оригинале)
        if (chatType === "UNSUPPORTED") {
          return null;
        }
        
        return new ChatListItem(
          chat.group_chat_id,
          chatType,
          chat.name,
          chat.description,
          chat.members,
          new Date(chat.inserted_at),
          new Date(chat.updated_at),
          chat.shared_history
        );
      })
      .filter((item): item is ChatListItem => item !== null);

    // Логирование как в Python оригинале
    if (chatsList.length !== this.result.length) {
      logger.warn("One or more unsupported chat types skipped");
    }

    return chatsList;
  }
}

export class ListChatsMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(): Promise<BotXAPIListChatResponsePayload> {
    const path = "/api/v3/botx/chats/list";

    const response = await this.botxMethodCall(
      "GET",
      this.buildUrl(path)
    );

    return this.verifyAndExtractApiModel(BotXAPIListChatResponsePayload, response);
  }
} 