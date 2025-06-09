import { ChatTypes, IncomingChatTypes, UserKinds } from "./enums";

export class Chat {
  constructor(public id: string, public type: IncomingChatTypes) {}
}

export class ChatListItem {
  constructor(
    public chatId: string,
    public chatType: ChatTypes,
    public name: string,
    public description: string | null | undefined,
    public members: string[],
    public createdAt: Date,
    public updatedAt: Date,
    public sharedHistory: boolean
  ) {}
}

export class ChatInfoMember {
  constructor(
    public isAdmin: boolean,
    public huid: string,
    public kind: UserKinds
  ) {}
}

export class ChatInfo {
  constructor(
    public chatType: ChatTypes,
    public creatorId: string | null | undefined,
    public description: string | null | undefined,
    public chatId: string,
    public createdAt: Date,
    public members: ChatInfoMember[],
    public name: string,
    public sharedHistory: boolean
  ) {}
}
