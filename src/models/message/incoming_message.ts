import { Missing, Undefined } from "../../missing";
import { File } from "../asyncFiles";
import { IncomingAttachment } from "../attachments";
import { BotAccount } from "../botAccount";
import { Chat } from "../chats";
import { BotAPICommandTypes, ChatTypes } from "../enums";
import { Forward } from "./forward";
import { Mention } from "./mentions";
import { Reply } from "./reply";

export interface MessageEntity {
  type: string;
}

export interface MessageEntities {
  mentions?: Mention[];
  forward?: Forward;
  reply?: Reply;
}

export class BotAPIMessage {
  constructor(
    public bot_id: string,
    public chat_id: string,
    public message_id: string,
    public body: string,
    public data: Record<string, any> = {},
    public metadata: Record<string, any> = {},
    public command_type: BotAPICommandTypes = BotAPICommandTypes.USER,
    public entities: MessageEntities = {},
    public attachments: IncomingAttachment[] = [],
    public async_files: File[] = [],
    public raw_command: Record<string, any> = {}
  ) {}
}

export class IncomingMessage {
  constructor(
    public bot: BotAccount,
    public chat: Chat,
    public message_id: string,
    public body: string,
    public data: Record<string, any> = {},
    public metadata: Record<string, any> = {},
    public command_type: BotAPICommandTypes = BotAPICommandTypes.USER,
    public entities: MessageEntities = {},
    public attachments: IncomingAttachment[] = [],
    public async_files: Missing<File[]> = Undefined,
    public raw_command: Record<string, any> = {}
  ) {}

  static fromAPI(apiMessage: BotAPIMessage): IncomingMessage {
    return new IncomingMessage(
      new BotAccount(apiMessage.bot_id, null),
      new Chat(apiMessage.chat_id, ChatTypes.PERSONAL_CHAT),
      apiMessage.message_id,
      apiMessage.body,
      apiMessage.data,
      apiMessage.metadata,
      apiMessage.command_type,
      apiMessage.entities,
      apiMessage.attachments,
      apiMessage.async_files,
      apiMessage.raw_command
    );
  }
}
