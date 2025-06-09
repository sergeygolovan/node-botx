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

export interface BotAPIReplyData {
  message_id: string;
  sender_huid: string;
  sender_name: string;
  body: string;
}

export interface BotAPIReply {
  type: BotAPIEntityTypes.REPLY;
  data: BotAPIReplyData;
}
