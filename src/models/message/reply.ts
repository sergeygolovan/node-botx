import { BotAPIEntityTypes } from "../enums";
import { MentionList } from "./mentions";
import { IsString, IsEnum, ValidateNested, IsArray } from "class-validator";
import { Type } from "class-transformer";
import {
  BotAPIMentionData
} from "./mentions";

export class Reply {
  @IsString()
  authorId: string;

  @IsString()
  syncId: string;

  @IsString()
  body: string;

  @ValidateNested()
  @Type(() => MentionList)
  mentions: MentionList;

  constructor(
    authorId: string,
    syncId: string,
    body: string,
    mentions: MentionList
  ) {
    this.authorId = authorId;
    this.syncId = syncId;
    this.body = body;
    this.mentions = mentions;
  }
}

export class BotAPIReplyData {
  @IsString()
  sourceSyncId: string;

  @IsString()
  sender: string;

  @IsString()
  body: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BotAPIMentionData)
  mentions: BotAPIMentionData[];

  constructor(
    sourceSyncId: string,
    sender: string,
    body: string,
    mentions: BotAPIMentionData[]
  ) {
    this.sourceSyncId = sourceSyncId;
    this.sender = sender;
    this.body = body;
    this.mentions = mentions;
  }
}

export class BotAPIReply {
  @IsEnum(BotAPIEntityTypes)
  type: BotAPIEntityTypes.REPLY;

  @ValidateNested()
  @Type(() => BotAPIReplyData)
  data: BotAPIReplyData;

  constructor(
    type: BotAPIEntityTypes.REPLY,
    data: BotAPIReplyData
  ) {
    this.type = type;
    this.data = data;
  }
}
