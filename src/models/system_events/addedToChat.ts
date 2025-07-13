import { z } from 'zod';
import { BotAccount, Chat, BotAPISystemEventTypes, convertChatTypeToDomain, BotAPIBaseCommandModel, BotAPIBaseSystemEventPayloadModel, BotAPIUserContextModel, BotAPIChatContextModel } from "@models";

export class AddedToChatEvent {
  constructor(
    public bot: BotAccount,
    public rawCommand: Record<string, any>,
    public huids: string[],
    public chat: Chat
  ) {}
}

const BotAPIAddedToChatDataSchema = z.object({
    added_members: z.array(z.string().uuid()),
});

const BotAPIAddedToChatPayloadSchema = BotAPIBaseSystemEventPayloadModel.schema.extend({
    data: BotAPIAddedToChatDataSchema,
});

const BotAPIAddedToChatSchema = BotAPIBaseCommandModel.schema.extend({
    payload: BotAPIAddedToChatPayloadSchema,
    from: BotAPIUserContextModel.schema.merge(BotAPIChatContextModel.schema),
});

export class BotAPIAddedToChatData {
  constructor(
    public added_members: string[]
  ) {}
}

export class BotAPIAddedToChatPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public data: BotAPIAddedToChatData
  ) {}
}

export class BotAPIAddedToChat extends BotAPIBaseCommandModel {
  constructor(
    bot_id: string,
    sync_id: string,
    proto_version: number,
    public payload: BotAPIAddedToChatPayload,
    public from: BotAPIUserContextModel & BotAPIChatContextModel,
  ) {
      super(bot_id, sync_id, proto_version);
  }

  static parse(data: Record<string, any>): BotAPIAddedToChat {
    const validated = BotAPIAddedToChatSchema.parse(data);
    const payloadData = new BotAPIAddedToChatData(validated.payload.data.added_members);
    const payload = new BotAPIAddedToChatPayload(validated.payload.body as BotAPISystemEventTypes, payloadData);

    // This is a bit of a hack, we should probably have a proper from-validated factory for this
    const from = new BotAPIUserContextModel(
        validated.from.host, validated.from.user_huid
    ) as BotAPIUserContextModel & BotAPIChatContextModel;
    Object.assign(from, validated.from);


    return new BotAPIAddedToChat(
        validated.bot_id,
        validated.sync_id,
        validated.proto_version,
        payload,
        from,
    );
  }

  toDomain(rawCommand: Record<string, any>): AddedToChatEvent {
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