import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";
import { ChatListItem, ChatTypes } from "@models";

export interface BotXAPIChatEntity {
  groupChatId: string;
  name: string;
  description?: string;
  avatar?: string;
  chatType: string;
  membersCount: number;
  members: BotXAPIChatMember[];
  insertedAt: string;
  updatedAt: string;
  sharedHistory: boolean;
}

export interface BotXAPIChatMember {
  huid: string;
  name: string;
  avatar?: string;
}

export interface BotXAPIChatsListResult {
  chats: BotXAPIChatEntity[];
}

export interface BotXAPIChatsListResponsePayload {
  status: "ok";
  result: BotXAPIChatsListResult;
  toDomain(): ChatListItem[];
}

export class ListChatsMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(): Promise<BotXAPIChatsListResponsePayload> {
    const path = "/api/v3/botx/chats/list";

    const response = await this.botxMethodCall(
      "GET",
      this.buildUrl(path)
    );

    const responseData = await response.json();
    const result: BotXAPIChatsListResponsePayload = {
      status: responseData.status,
      result: responseData.result,
      toDomain(): ChatListItem[] {
        return this.result.chats.map(chatItem => new ChatListItem(
          chatItem.groupChatId,
          chatItem.chatType as ChatTypes,
          chatItem.name,
          chatItem.description,
          chatItem.members.map(member => member.huid),
          new Date(chatItem.insertedAt),
          new Date(chatItem.updatedAt),
          chatItem.sharedHistory
        ));
      }
    };
    return result;
  }
} 