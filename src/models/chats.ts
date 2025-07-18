import { ChatTypes, IncomingChatTypes, UserKinds } from "./enums";
import { IsString, IsEnum, IsOptional, IsBoolean, IsArray, IsDate, ValidateNested, IsUUID } from "class-validator";
import { Type } from "class-transformer";

export class Chat {
  @IsUUID()
  id: string;

  type: IncomingChatTypes;

  constructor(id: string, type: IncomingChatTypes) {
    this.id = id;
    this.type = type;
  }
}

export class ChatListItem {
  @IsUUID()
  chat_id: string;

  @IsEnum(ChatTypes)
  chat_type: ChatTypes;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string | null | undefined;

  @IsArray()
  @IsUUID(undefined, { each: true })
  members: string[]; // UUID как строки

  @IsDate()
  @Type(() => Date)
  created_at: Date;

  @IsDate()
  @Type(() => Date)
  updated_at: Date;

  @IsBoolean()
  shared_history: boolean;

  constructor(
    chat_id: string,
    chat_type: ChatTypes,
    name: string,
    description: string | null | undefined,
    members: string[],
    created_at: Date,
    updated_at: Date,
    shared_history: boolean
  ) {
    this.chat_id = chat_id;
    this.chat_type = chat_type;
    this.name = name;
    this.description = description;
    this.members = members;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.shared_history = shared_history;
  }
}

export class ChatInfoMember {
  @IsBoolean()
  is_admin: boolean;

  @IsUUID()
  huid: string;

  @IsEnum(UserKinds)
  kind: UserKinds;

  constructor(is_admin: boolean, huid: string, kind: UserKinds) {
    this.is_admin = is_admin;
    this.huid = huid;
    this.kind = kind;
  }
}

export class ChatInfo {
  @IsEnum(ChatTypes)
  chat_type: ChatTypes;

  @IsOptional()
  @IsString()
  creator_id: string | null | undefined;

  @IsOptional()
  @IsString()
  description: string | null | undefined;

  @IsUUID()
  chat_id: string;

  @IsDate()
  @Type(() => Date)
  created_at: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatInfoMember)
  members: ChatInfoMember[];

  @IsString()
  name: string;

  @IsBoolean()
  shared_history: boolean;

  constructor(
    chat_type: ChatTypes,
    creator_id: string | null | undefined,
    description: string | null | undefined,
    chat_id: string,
    created_at: Date,
    members: ChatInfoMember[],
    name: string,
    shared_history: boolean
  ) {
    this.chat_type = chat_type;
    this.creator_id = creator_id;
    this.description = description;
    this.chat_id = chat_id;
    this.created_at = created_at;
    this.members = members;
    this.name = name;
    this.shared_history = shared_history;
  }
}
