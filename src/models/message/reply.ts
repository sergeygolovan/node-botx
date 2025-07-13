import { BotAPIEntityTypes } from "../enums";
import { MentionList } from "./mentions";

export class Reply {
  constructor(
    public authorId: string,
    public syncId: string,
    public body: string,
    public mentions: MentionList
  ) {}
}

// Импортируем типы из mentions.ts
import { 
  BotAPINestedPersonalMentionData, 
  BotAPINestedGroupMentionData, 
  BotAPINestedMentionData, 
  BotAPIMentionData 
} from "./mentions";

export class BotAPIReplyData {
  constructor(
    public sourceSyncId: string,
    public sender: string,
    public body: string,
    public mentions: BotAPIMentionData[]
  ) {}
}

export class BotAPIReply {
  constructor(
    public type: BotAPIEntityTypes.REPLY,
    public data: BotAPIReplyData
  ) {}
}
