import { BotAccount, Chat, APIChatTypes, APIUserKinds, BotAPISystemEventTypes, UserKinds, convertChatTypeToDomain, convertUserKindToDomain } from "@models";

export class ChatCreatedMember {
  constructor(
    public is_admin: boolean,
    public huid: string,
    public username: string | null,
    public kind: UserKinds
  ) {}
}

export class ChatCreatedEvent {
  constructor(
    public chat: Chat,
    public sync_id: string,
    public chat_name: string,
    public creator_id: string,
    public members: ChatCreatedMember[],
    public bot: BotAccount,
    public rawCommand: Record<string, any>
  ) {}
}

export class BotAPIChatMember {
  constructor(
    public is_admin: boolean,
    public huid: string,
    public name: string | null,
    public user_kind: APIUserKinds
  ) {}
}

export class BotAPIChatCreatedData {
  constructor(
    public chat_type: APIChatTypes,
    public creator: string,
    public group_chat_id: string,
    public members: BotAPIChatMember[],
    public name: string
  ) {}
}

export class BotAPIChatCreatedPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public data: BotAPIChatCreatedData
  ) {}
}

export class BotAPIChatCreated {
  constructor(
    public sync_id: string,
    public bot_id: string,
    public payload: BotAPIChatCreatedPayload,
    public sender: { group_chat_id: string; chat_type: string; host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): ChatCreatedEvent {
    const members = this.payload.data.members.map(
      (member) => new ChatCreatedMember(
        member.is_admin,
        member.huid,
        member.name ?? null,
        convertUserKindToDomain(member.user_kind)
      )
    );
    const chat = new Chat(
      this.payload.data.group_chat_id,
      convertChatTypeToDomain(this.payload.data.chat_type)
    );
    return new ChatCreatedEvent(
      chat,
      this.sync_id,
      this.payload.data.name,
      this.payload.data.creator,
      members,
      new BotAccount(this.bot_id, this.sender.host),
      rawCommand
    );
  }
} 