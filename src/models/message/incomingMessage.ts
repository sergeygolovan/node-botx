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

// Контекст входящего сообщения (объединяет user, chat, device)
export interface BotAPIIncomingMessageContext extends BotAPIUserContextModel, BotAPIChatContextModel, BotAPIDeviceContextModel {}

// Типы для API и доменных сущностей
export type BotAPIEntity = BotAPIMention | BotAPIForward | BotAPIReply;
export type Entity = Mention | Forward | Reply;

export class UserDevice {
  constructor(
    public manufacturer?: string | null,
    public deviceName?: string | null,
    public os?: string | null,
    public pushes?: boolean | null,
    public timezone?: string | null,
    public permissions?: Record<string, any> | null,
    public platform?: ClientPlatforms | null,
    public platformPackageId?: string | null,
    public appVersion?: string | null,
    public locale?: string | null
  ) {}
}

export class UserSender {
  constructor(
    public huid: string,
    public udid?: string | null,
    public adLogin?: string | null,
    public adDomain?: string | null,
    public username?: string | null,
    public isChatAdmin?: boolean | null,
    public isChatCreator?: boolean | null,
    public device?: UserDevice | null
  ) {}

  get upn(): string | null {
    // https://docs.microsoft.com/en-us/windows/win32/secauthn/user-name-formats
    if (!(this.adLogin && this.adDomain)) {
      return null;
    }

    return `${this.adLogin}@${this.adDomain}`;
  }
}

function convertBotApiMentionToDomain(apiMentionData: BotAPIMentionData): Mention {
    const mentionData = apiMentionData.mentionData as BotAPINestedMentionData;

    switch (apiMentionData.mentionType) {
        case BotAPIMentionTypes.USER:
            return MentionBuilder.user(
                (mentionData as BotAPINestedPersonalMentionData).userHuid,
                mentionData.name,
            );
        case BotAPIMentionTypes.CHAT:
            return MentionBuilder.chat(
                (mentionData as BotAPINestedGroupMentionData).groupChatId,
                mentionData.name,
            );
        case BotAPIMentionTypes.CONTACT:
            // Assuming entityId is in mentionId for contacts
            return MentionBuilder.contact(
                apiMentionData.mentionId,
                mentionData.name,
            );
        case BotAPIMentionTypes.CHANNEL:
            return MentionBuilder.channel(
                (mentionData as BotAPINestedGroupMentionData).groupChatId,
                mentionData.name,
            );
        case BotAPIMentionTypes.ALL:
            return MentionBuilder.all();
        default:
            throw new Error(`Unsupported mention type: ${apiMentionData.mentionType}`);
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
  constructor(
    public bot: BotAccount,
    public syncId: string,
    public sourceSyncId: string | undefined,
    public body: string,
    public data: Record<string, any>,
    public metadata: Record<string, any>,
    public sender: UserSender,
    public chat: Chat,
    public rawCommand: Record<string, any> | undefined,
    public file: IncomingFileAttachment | null,
    public location: any,
    public contact: any,
    public link: any,
    public sticker: any,
    public mentions: MentionList,
    public forward: Forward | null,
    public reply: Reply | null
  ) {}

  get argument(): string {
    const splitBody = this.body.split(" ");
    if (!splitBody.length) return "";
    const commandLen = splitBody[0].length;
    return this.body.substring(commandLen).trim();
  }

  get arguments(): string[] {
    return this.argument.split(" ").map(arg => arg.trim()).filter(Boolean);
  }

  static fromAPI(apiMessage: BotAPIIncomingMessage): IncomingMessage {
    return apiMessage.toDomain(apiMessage as any);
  }
}

export class BotAPIIncomingMessage extends BotAPIBaseCommandModel {
  constructor(
    bot_id: string,
    sync_id: string,
    proto_version: number,
    public payload: BotAPICommandPayloadModel,
    public sender: BotAPIIncomingMessageContext,
    public sourceSyncId?: string,
    public attachments: (BotAPIAttachment | Record<string, any>)[] = [],
    public entities: (BotAPIEntity | Record<string, any>)[] = []
  ) {
    super(bot_id, sync_id, proto_version);
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
