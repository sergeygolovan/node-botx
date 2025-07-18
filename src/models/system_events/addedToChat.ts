import { BotAccount, Chat, BotAPISystemEventTypes, BotAPICommandTypes, convertChatTypeToDomain, BotAPIBaseCommandModel, BotAPIBaseSystemEventPayloadModel, BotAPIUserContextModel, BotAPIChatContextModel } from "@models";
import { IsArray, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class AddedToChatEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, unknown>,
    public huids: string[],
    public chat: Chat
  ) {}
}

export class BotAPIAddedToChatData {
  @IsArray()
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  added_members!: string[];

  constructor(added_members: string[]) {
    this.added_members = added_members;
  }
}

export class BotAPIAddedToChatPayload extends BotAPIBaseSystemEventPayloadModel {
  @ValidateNested()
  @Type(() => BotAPIAddedToChatData)
  data!: BotAPIAddedToChatData;

  constructor(body: BotAPISystemEventTypes, data: BotAPIAddedToChatData) {
    super(BotAPICommandTypes.SYSTEM, body);
    this.data = data;
  }
}

export class BotAPIAddedToChat extends BotAPIBaseCommandModel {
  @ValidateNested()
  @Type(() => BotAPIAddedToChatPayload)
  payload!: BotAPIAddedToChatPayload;

  @ValidateNested()
  @Type(() => BotAPIUserContextModel)
  from!: BotAPIUserContextModel & BotAPIChatContextModel;

  constructor(
    bot_id: string,
    sync_id: string,
    proto_version: number,
    payload: BotAPIAddedToChatPayload,
    from: BotAPIUserContextModel & BotAPIChatContextModel,
  ) {
      super(bot_id, sync_id, proto_version);
      this.payload = payload;
      this.from = from;
  }

  static parse(data: any): BotAPIAddedToChat {
    const payloadData = new BotAPIAddedToChatData(data.payload?.data?.added_members || []);
    const payload = new BotAPIAddedToChatPayload(data.payload?.body, payloadData);

    // Создаем from объект
    const from = new BotAPIUserContextModel(
        data.from?.host, 
        data.from?.user_huid
    ) as BotAPIUserContextModel & BotAPIChatContextModel;
    Object.assign(from, data.from);

    return new BotAPIAddedToChat(
        data.bot_id,
        data.sync_id,
        data.proto_version,
        payload,
        from,
    );
  }

  toDomain(rawCommand: Record<string, unknown>): AddedToChatEvent {
    return new AddedToChatEvent(
      new BotAccount(this.bot_id, this.from.host),
      rawCommand,
      this.payload.data.added_members,
      new Chat(
        this.from.group_chat_id,
        convertChatTypeToDomain(this.from.chat_type)
      )
    );
  }
} 