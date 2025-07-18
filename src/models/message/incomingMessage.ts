import { BotAPIBaseCommandModel, BotAPICommandPayloadModel, BotAPIUserContextModel, BotAPIChatContextModel, BotAPIDeviceContextModel } from "../baseCommand";
import { BotAPIEntityTypes, BotAPIMentionTypes, ClientPlatforms, convertChatTypeToDomain, convertClientPlatformToDomain } from "../enums";
import { BotAccount } from "../botAccount";
import { Chat } from "../chats";
import { Forward } from "./forward";
import { Reply } from "./reply";
import { MentionUser, MentionContact, MentionChat, MentionChannel, MentionAll, MentionList, Mention, BotAPIMention, BotAPIMentionData, BotAPINestedMentionData, MentionBuilder, BotAPINestedPersonalMentionData, BotAPINestedGroupMentionData } from "./mentions";
import { BotAPIAttachment, Contact, convertAPIAttachmentToDomain, FileAttachmentBase, IncomingFileAttachment, Link, Location } from "../attachments";
import type { BotCommandBase } from "../baseCommand";
import { BotAPIForward } from "./forward";
import { BotAPIReply } from "./reply";
import { Sticker } from "../stickers";
import { IsString, IsBoolean, IsOptional, IsEnum, ValidateNested, IsUUID } from "class-validator";
import { Type } from "class-transformer";

// Контекст входящего сообщения (объединяет user, chat, device)
export interface BotAPIIncomingMessageContext extends BotAPIUserContextModel, BotAPIChatContextModel, BotAPIDeviceContextModel {}

// Типы для API и доменных сущностей
export type BotAPIEntity = BotAPIMention | BotAPIForward | BotAPIReply;
export type Entity = Mention | Forward | Reply;

export class UserDevice {
  @IsOptional()
  @IsString()
  manufacturer?: string | null;

  @IsOptional()
  @IsString()
  deviceName?: string | null;

  @IsOptional()
  @IsString()
  os?: string | null;

  @IsOptional()
  @IsBoolean()
  pushes?: boolean | null;

  @IsOptional()
  @IsString()
  timezone?: string | null;

  @IsOptional()
  permissions?: Record<string, any> | null;

  @IsOptional()
  @IsEnum(ClientPlatforms)
  platform?: ClientPlatforms | null;

  @IsOptional()
  @IsString()
  platform_package_id?: string | null;

  @IsOptional()
  @IsString()
  app_version?: string | null;

  @IsOptional()
  @IsString()
  locale?: string | null;

  constructor(
    manufacturer?: string | null,
    deviceName?: string | null,
    os?: string | null,
    pushes?: boolean | null,
    timezone?: string | null,
    permissions?: Record<string, any> | null,
    platform?: ClientPlatforms | null,
    platformPackageId?: string | null,
    appVersion?: string | null,
    locale?: string | null
  ) {
    this.manufacturer = manufacturer;
    this.deviceName = deviceName;
    this.os = os;
    this.pushes = pushes;
    this.timezone = timezone;
    this.permissions = permissions;
    this.platform = platform;
    this.platform_package_id = platformPackageId;
    this.app_version = appVersion;
    this.locale = locale;
  }
}

export class UserSender {
  @IsUUID()
  huid: string; // UUID как строка

  @IsOptional()
  @IsUUID()
  udid?: string | null; // UUID как строка

  @IsOptional()
  @IsString()
  ad_login?: string | null;

  @IsOptional()
  @IsString()
  ad_domain?: string | null;

  @IsOptional()
  @IsString()
  username?: string | null;

  @IsOptional()
  @IsBoolean()
  isChatAdmin?: boolean | null;

  @IsOptional()
  @IsBoolean()
  isChatCreator?: boolean | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserDevice)
  device?: UserDevice | null;

  constructor(
    huid: string,
    udid?: string | null,
    adLogin?: string | null,
    adDomain?: string | null,
    username?: string | null,
    isChatAdmin?: boolean | null,
    isChatCreator?: boolean | null,
    device?: UserDevice | null
  ) {
    this.huid = huid;
    this.udid = udid;
    this.ad_login = adLogin;
    this.ad_domain = adDomain;
    this.username = username;
    this.isChatAdmin = isChatAdmin;
    this.isChatCreator = isChatCreator;
    this.device = device;
  }

  get upn(): string | null {
    // https://docs.microsoft.com/en-us/windows/win32/secauthn/user-name-formats
    if (!(this.ad_login && this.ad_domain)) {
      return null;
    }

    return `${this.ad_login}@${this.ad_domain}`;
  }
}

function convertBotApiMentionToDomain(apiMentionData: BotAPIMentionData): Mention {
    const mentionData = apiMentionData.mention_data as BotAPINestedMentionData;

    switch (apiMentionData.mention_type) {
        case BotAPIMentionTypes.USER:
            return MentionBuilder.user(
                (mentionData as BotAPINestedPersonalMentionData).user_huid,
                mentionData.name,
            );
        case BotAPIMentionTypes.CHAT:
            return MentionBuilder.chat(
                (mentionData as BotAPINestedGroupMentionData).group_chat_id,
                mentionData.name,
            );
        case BotAPIMentionTypes.CONTACT:
            // Assuming entityId is in mentionId for contacts
            return MentionBuilder.contact(
                apiMentionData.mention_id,
                mentionData.name,
            );
        case BotAPIMentionTypes.CHANNEL:
            return MentionBuilder.channel(
                (mentionData as BotAPINestedGroupMentionData).group_chat_id,
                mentionData.name,
            );
        case BotAPIMentionTypes.ALL:
            return MentionBuilder.all();
        default:
            throw new Error(`Unsupported mention type: ${apiMentionData.mention_type}`);
    }
}

export function convertBotApiEntityToDomain(apiEntity: BotAPIEntity): Entity {
    if (apiEntity.type === BotAPIEntityTypes.MENTION) {
        // Casting since BotAPIMention has a different structure that needs to be handled
        return convertBotApiMentionToDomain((apiEntity as BotAPIMention).data);
    }
    if (apiEntity.type === BotAPIEntityTypes.FORWARD) {
        const forwardData = (apiEntity as BotAPIForward).data;
        return new Forward(
            forwardData.messageId, // Assuming this corresponds to source_sync_id in some way
            forwardData.chatId,
            forwardData.senderHuid,
            forwardData.senderName,
        );
    }
    if (apiEntity.type === BotAPIEntityTypes.REPLY) {
        const replyData = (apiEntity as BotAPIReply).data;
        const mentions = new MentionList();
        for (const apiMentionData of replyData.mentions) {
            mentions.push(convertBotApiMentionToDomain(apiMentionData));
        }
        return new Reply(
            replyData.sender,
            replyData.sourceSyncId,
            replyData.body,
            mentions,
        );
    }
    throw new Error(`Unsupported entity type: ${apiEntity.type}`);
}

export class IncomingMessage implements BotCommandBase {
  public state: Record<string, any> = {};

  @ValidateNested()
  @Type(() => BotAccount)
  bot: BotAccount;

  @IsUUID()
  syncId: string; // UUID как строка

  @IsOptional()
  @IsUUID()
  sourceSyncId: string | undefined; // UUID как строка

  @IsString()
  body: string;

  data: Record<string, any>;

  metadata: Record<string, any>;

  @ValidateNested()
  @Type(() => UserSender)
  sender: UserSender;

  @ValidateNested()
  @Type(() => Chat)
  chat: Chat;

  @IsOptional()
  rawCommand: Record<string, any> | undefined;

  @IsOptional()
  file: IncomingFileAttachment | null;

  @IsOptional()
  location: Location | null;

  @IsOptional()
  contact: Contact | null;

  @IsOptional()
  link: Link | null;

  @IsOptional()
  sticker: Sticker | null;

  @ValidateNested()
  @Type(() => MentionList)
  mentions: MentionList;

  @IsOptional()
  @ValidateNested()
  @Type(() => Forward)
  forward: Forward | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => Reply)
  reply: Reply | null;

  constructor(
    bot: BotAccount,
    syncId: string,
    sourceSyncId: string | undefined,
    body: string,
    data: Record<string, any>,
    metadata: Record<string, any>,
    sender: UserSender,
    chat: Chat,
    rawCommand: Record<string, any> | undefined,
    file: IncomingFileAttachment | null,
    location: Location | null,
    contact: Contact | null,
    link: Link | null,
    sticker: Sticker | null,
    mentions: MentionList,
    forward: Forward | null,
    reply: Reply | null
  ) {
    this.bot = bot;
    this.syncId = syncId;
    this.sourceSyncId = sourceSyncId;
    this.body = body;
    this.data = data;
    this.metadata = metadata;
    this.sender = sender;
    this.chat = chat;
    this.rawCommand = rawCommand;
    this.file = file;
    this.location = location;
    this.contact = contact;
    this.link = link;
    this.sticker = sticker;
    this.mentions = mentions;
    this.forward = forward;
    this.reply = reply;
  }

  get argument(): string {
    const splitBody = this.body.split(" ");
    if (!splitBody.length) return "";
    const commandLen = splitBody[0].length;
    return this.body.substring(commandLen).trim();
  }

  get arguments(): string[] {
    return this.argument.split(" ").map(arg => arg.trim()).filter(Boolean);
  }
}

export class BotAPIIncomingMessage extends BotAPIBaseCommandModel {
  @ValidateNested()
  @Type(() => BotAPICommandPayloadModel)
  payload: BotAPICommandPayloadModel;

  sender: BotAPIIncomingMessageContext;

  @IsOptional()
  @IsString()
  sourceSyncId?: string;

  attachments: (BotAPIAttachment | Record<string, any>)[] = [];

  entities: (BotAPIEntity | Record<string, any>)[] = [];

  constructor(
    bot_id: string,
    sync_id: string,
    proto_version: number,
    payload: BotAPICommandPayloadModel,
    sender: BotAPIIncomingMessageContext,
    sourceSyncId?: string,
    attachments: (BotAPIAttachment | Record<string, any>)[] = [],
    entities: (BotAPIEntity | Record<string, any>)[] = []
  ) {
    super(bot_id, sync_id, proto_version);
    this.payload = payload;
    this.sender = sender;
    this.sourceSyncId = sourceSyncId;
    this.attachments = attachments;
    this.entities = entities;
  }

  toDomain(rawCommand: Record<string, any>): IncomingMessage {
    // device
    let pushes: boolean | null = null;
    let timezone: string | null = null;
    let permissions: Record<string, any> | null = null;
    if (this.sender.device_meta) {
      pushes = this.sender.device_meta.pushes ?? null;
      timezone = this.sender.device_meta.timezone ?? null;
      permissions = this.sender.device_meta.permissions ?? null;
    }
    const device = new UserDevice(
      this.sender.manufacturer ?? null,
      this.sender.device ?? null,
      this.sender.device_software ?? null,
      pushes,
      timezone,
      permissions,
      this.sender.platform ? convertClientPlatformToDomain(this.sender.platform) : null,
      this.sender.platform_package_id ?? null,
      this.sender.app_version ?? null,
      this.sender.locale ?? null
    );
    // sender
    const sender = new UserSender(
      this.sender.user_huid,
      this.sender.user_udid,
      this.sender.ad_login,
      this.sender.ad_domain,
      this.sender.username,
      this.sender.is_admin,
      this.sender.is_creator,
      device
    );
    // chat
    const chat = new Chat(
      this.sender.group_chat_id,
      convertChatTypeToDomain(this.sender.chat_type)
    );
    
    // attachments
    let file: IncomingFileAttachment | null = null;
    let location: Location | null = null;
    let contact: Contact | null = null;
    let link: Link | null = null;
    let sticker: Sticker | null = null;

    if (this.attachments.length > 0) {
        // @ts-ignore
        const attachment = this.attachments[0] as BotAPIAttachment;
        if (attachment.type) {
            const domainAttachment = convertAPIAttachmentToDomain(attachment, this.payload.body);
            if (domainAttachment instanceof FileAttachmentBase) {
                file = domainAttachment as IncomingFileAttachment;
            } else if (domainAttachment instanceof Location) {
                location = domainAttachment;
            } else if (domainAttachment instanceof Contact) {
                contact = domainAttachment;
            } else if (domainAttachment instanceof Link) {
                link = domainAttachment;
            } else if (domainAttachment instanceof Sticker) {
                sticker = domainAttachment;
            }
        } else {
            console.warn("Received unknown attachment type");
        }
    }

    // entities
    const mentions = new MentionList();
    let forward: Forward | null = null;
    let reply: Reply | null = null;

    for (const entity of this.entities) {
        // @ts-ignore
        if (entity.type) {
            const domainEntity = convertBotApiEntityToDomain(entity as BotAPIEntity);
            if (domainEntity instanceof MentionUser || domainEntity instanceof MentionContact || domainEntity instanceof MentionChat || domainEntity instanceof MentionChannel || domainEntity instanceof MentionAll) {
                mentions.push(domainEntity);
            } else if (domainEntity instanceof Forward) {
                forward = domainEntity;
            } else if (domainEntity instanceof Reply) {
                reply = domainEntity;
            }
        } else {
            console.warn("Received unknown entity type");
        }
    }
    
    // bot
    const bot = new BotAccount(this.bot_id, this.sender.host);
    
    return new IncomingMessage(
      bot,
      this.sync_id,
      this.sourceSyncId,
      this.payload.body,
      this.payload.data,
      this.payload.metadata,
      sender,
      chat,
      rawCommand,
      file,
      location,
      contact,
      link,
      sticker,
      mentions,
      forward,
      reply
    );
  }
}
