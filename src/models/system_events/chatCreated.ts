import { BotAccount, Chat, APIChatTypes, APIUserKinds, BotAPISystemEventTypes, UserKinds, convertChatTypeToDomain, convertUserKindToDomain } from "@models";

export class ChatCreatedMember {
  constructor(
    public isAdmin: boolean,
    public huid: string,
    public username: string | null,
    public kind: UserKinds
  ) {}
}

export class ChatCreatedEvent {
  constructor(
    public chat: Chat,
    public syncId: string,
    public chatName: string,
    public creatorId: string,
    public members: ChatCreatedMember[],
    public bot: BotAccount,
    public rawCommand: Record<string, any>
  ) {}
}

export class BotAPIChatMember {
  constructor(
    public admin: boolean,
    public huid: string,
    public name: string | null,
    public userKind: APIUserKinds
  ) {}
}

export class BotAPIChatCreatedData {
  constructor(
    public chatType: APIChatTypes,
    public creator: string,
    public groupChatId: string,
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
    public syncId: string,
    public botId: string,
    public payload: BotAPIChatCreatedPayload,
    public sender: { groupChatId: string; chatType: string; host?: string }
  ) {}

  toDomain(rawCommand: Record<string, any>): ChatCreatedEvent {
    const members = this.payload.data.members.map(
      (member) => new ChatCreatedMember(
        member.admin,
        member.huid,
        member.name ?? null,
        convertUserKindToDomain(member.userKind)
      )
    );
    const chat = new Chat(
      this.payload.data.groupChatId,
      convertChatTypeToDomain(this.payload.data.chatType)
    );
    return new ChatCreatedEvent(
      chat,
      this.syncId,
      this.payload.data.name,
      this.payload.data.creator,
      members,
      new BotAccount(this.botId, this.sender.host),
      rawCommand
    );
  }
} 