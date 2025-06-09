export enum UserKinds {
  RTS_USER = "RTS_USER",
  CTS_USER = "CTS_USER",
  BOT = "BOT",
  UNREGISTERED = "UNREGISTERED",
  GUEST = "GUEST",
}

export enum AttachmentTypes {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
  VOICE = "VOICE",
  LOCATION = "LOCATION",
  CONTACT = "CONTACT",
  LINK = "LINK",
  STICKER = "STICKER",
}

export enum ClientPlatforms {
  WEB = "WEB",
  ANDROID = "ANDROID",
  IOS = "IOS",
  DESKTOP = "DESKTOP",
  AURORA = "AURORA",
}

export enum MentionTypes {
  CONTACT = "CONTACT",
  CHAT = "CHAT",
  CHANNEL = "CHANNEL",
  USER = "USER",
  ALL = "ALL",
}

export enum ChatTypes {
  PERSONAL_CHAT = "PERSONAL_CHAT",
  GROUP_CHAT = "GROUP_CHAT",
  CHANNEL = "CHANNEL",
}

export enum SyncSourceTypes {
  AD = "AD",
  ADMIN = "ADMIN",
  EMAIL = "EMAIL",
  OPENID = "OPENID",
  BOTX = "BOTX",
}

export enum ConferenceLinkTypes {
  PUBLIC = "PUBLIC",
  TRUSTS = "TRUSTS",
  CORPORATE = "CORPORATE",
  SERVER = "SERVER",
}

export type UNSUPPORTED = "UNSUPPORTED";
export type IncomingChatTypes = ChatTypes | UNSUPPORTED;
export type IncomingSyncSourceTypes = SyncSourceTypes | UNSUPPORTED;

export enum APIChatTypes {
  CHAT = "chat",
  GROUP_CHAT = "group_chat",
  CHANNEL = "channel",
}

export enum BotAPICommandTypes {
  USER = "user",
  SYSTEM = "system",
}

export enum BotAPISystemEventTypes {
  ADDED_TO_CHAT = "system:added_to_chat",
  CHAT_CREATED = "system:chat_created",
  CHAT_DELETED_BY_USER = "system:chat_deleted_by_user",
  CTS_LOGIN = "system:cts_login",
  CTS_LOGOUT = "system:cts_logout",
  DELETED_FROM_CHAT = "system:deleted_from_chat",
  INTERNAL_BOT_NOTIFICATION = "system:internal_bot_notification",
  LEFT_FROM_CHAT = "system:left_from_chat",
  SMARTAPP_EVENT = "system:smartapp_event",
  EVENT_EDIT = "system:event_edit",
  JOIN_TO_CHAT = "system:user_joined_to_chat",
  CONFERENCE_CHANGED = "system:conference_changed",
  CONFERENCE_CREATED = "system:conference_created",
  CONFERENCE_DELETED = "system:conference_deleted",
}

export enum BotAPIClientPlatforms {
  WEB = "web",
  ANDROID = "android",
  IOS = "ios",
  DESKTOP = "desktop",
  AURORA = "aurora",
}

export enum BotAPIEntityTypes {
  MENTION = "mention",
  FORWARD = "forward",
  REPLY = "reply",
}

export enum BotAPIMentionTypes {
  CONTACT = "contact",
  CHAT = "chat",
  CHANNEL = "channel",
  USER = "user",
  ALL = "all",
}

export enum BotAPIConferenceLinkTypes {
  PUBLIC = "public",
  TRUSTS = "trusts",
  CORPORATE = "corporate",
  SERVER = "server",
}

export enum APIUserKinds {
  USER = "user",
  CTS_USER = "cts_user",
  BOTX = "botx",
  UNREGISTERED = "unregistered",
  GUEST = "guest",
}

export enum APIAttachmentTypes {
  IMAGE = "image",
  VIDEO = "video",
  DOCUMENT = "document",
  VOICE = "voice",
  LOCATION = "location",
  CONTACT = "contact",
  LINK = "link",
  STICKER = "sticker",
}

export enum APISyncSourceTypes {
  AD = "ad",
  ADMIN = "admin",
  EMAIL = "email",
  OPENID = "openid",
  BOTX = "botx",
}

export enum SmartappManifestWebLayoutChoices {
  MINIMAL = "minimal",
  HALF = "half",
  FULL = "full",
}

export function convertClientPlatformToDomain(
  clientPlatform: BotAPIClientPlatforms
): ClientPlatforms {
  switch (clientPlatform) {
    case BotAPIClientPlatforms.WEB:
      return ClientPlatforms.WEB;
    case BotAPIClientPlatforms.ANDROID:
      return ClientPlatforms.ANDROID;
    case BotAPIClientPlatforms.IOS:
      return ClientPlatforms.IOS;
    case BotAPIClientPlatforms.DESKTOP:
      return ClientPlatforms.DESKTOP;
    case BotAPIClientPlatforms.AURORA:
      return ClientPlatforms.AURORA;
    default:
      throw new Error(`Unsupported client platform: ${clientPlatform}`);
  }
}

export function convertMentionTypeFromDomain(
  mentionType: MentionTypes
): BotAPIMentionTypes {
  switch (mentionType) {
    case MentionTypes.USER:
      return BotAPIMentionTypes.USER;
    case MentionTypes.CONTACT:
      return BotAPIMentionTypes.CONTACT;
    case MentionTypes.CHAT:
      return BotAPIMentionTypes.CHAT;
    case MentionTypes.CHANNEL:
      return BotAPIMentionTypes.CHANNEL;
    case MentionTypes.ALL:
      return BotAPIMentionTypes.ALL;
    default:
      throw new Error(`Unsupported mention type: ${mentionType}`);
  }
}

export function convertUserKindToDomain(userKind: APIUserKinds): UserKinds {
  switch (userKind) {
    case APIUserKinds.USER:
      return UserKinds.RTS_USER;
    case APIUserKinds.CTS_USER:
      return UserKinds.CTS_USER;
    case APIUserKinds.BOTX:
      return UserKinds.BOT;
    case APIUserKinds.UNREGISTERED:
      return UserKinds.UNREGISTERED;
    case APIUserKinds.GUEST:
      return UserKinds.GUEST;
    default:
      throw new Error(`Unsupported user kind: ${userKind}`);
  }
}

export function convertAttachmentTypeToDomain(
  attachmentType: APIAttachmentTypes
): AttachmentTypes {
  switch (attachmentType) {
    case APIAttachmentTypes.IMAGE:
      return AttachmentTypes.IMAGE;
    case APIAttachmentTypes.VIDEO:
      return AttachmentTypes.VIDEO;
    case APIAttachmentTypes.DOCUMENT:
      return AttachmentTypes.DOCUMENT;
    case APIAttachmentTypes.VOICE:
      return AttachmentTypes.VOICE;
    case APIAttachmentTypes.LOCATION:
      return AttachmentTypes.LOCATION;
    case APIAttachmentTypes.CONTACT:
      return AttachmentTypes.CONTACT;
    case APIAttachmentTypes.LINK:
      return AttachmentTypes.LINK;
    case APIAttachmentTypes.STICKER:
      return AttachmentTypes.STICKER;
    default:
      throw new Error(`Unsupported attachment type: ${attachmentType}`);
  }
}

export function convertConferenceLinkTypeToDomain(
  linkType: BotAPIConferenceLinkTypes
): ConferenceLinkTypes {
  switch (linkType) {
    case BotAPIConferenceLinkTypes.PUBLIC:
      return ConferenceLinkTypes.PUBLIC;
    case BotAPIConferenceLinkTypes.TRUSTS:
      return ConferenceLinkTypes.TRUSTS;
    case BotAPIConferenceLinkTypes.CORPORATE:
      return ConferenceLinkTypes.CORPORATE;
    case BotAPIConferenceLinkTypes.SERVER:
      return ConferenceLinkTypes.SERVER;
    default:
      throw new Error(`Unsupported conference link type: ${linkType}`);
  }
}

export function convertAttachmentTypeFromDomain(
  attachmentType: AttachmentTypes
): APIAttachmentTypes {
  switch (attachmentType) {
    case AttachmentTypes.IMAGE:
      return APIAttachmentTypes.IMAGE;
    case AttachmentTypes.VIDEO:
      return APIAttachmentTypes.VIDEO;
    case AttachmentTypes.DOCUMENT:
      return APIAttachmentTypes.DOCUMENT;
    case AttachmentTypes.VOICE:
      return APIAttachmentTypes.VOICE;
    case AttachmentTypes.LOCATION:
      return APIAttachmentTypes.LOCATION;
    case AttachmentTypes.CONTACT:
      return APIAttachmentTypes.CONTACT;
    case AttachmentTypes.LINK:
      return APIAttachmentTypes.LINK;
    default:
      throw new Error(`Unsupported attachment type: ${attachmentType}`);
  }
}

export function convertChatTypeFromdomain(
  chatType: ChatTypes
): APIChatTypes {
  switch (chatType) {
    case ChatTypes.PERSONAL_CHAT:
      return APIChatTypes.CHAT;
    case ChatTypes.GROUP_CHAT:
      return APIChatTypes.GROUP_CHAT;
    case ChatTypes.CHANNEL:
      return APIChatTypes.CHANNEL;
    default:
      throw new Error(`Unsupported chat type: ${chatType}`);
  }
}

export function convertChatTypeToDomain(
  chatType: APIChatTypes | string
): IncomingChatTypes {
  switch (chatType) {
    case APIChatTypes.CHAT:
      return ChatTypes.PERSONAL_CHAT;
    case APIChatTypes.GROUP_CHAT:
      return ChatTypes.GROUP_CHAT;
    case APIChatTypes.CHANNEL:
      return ChatTypes.CHANNEL;
    default:
      return "UNSUPPORTED";
  }
}

export function convertSyncSourceTypeToDomain(
  syncType: APISyncSourceTypes | string
): IncomingSyncSourceTypes {
  switch (syncType) {
    case APISyncSourceTypes.AD:
      return SyncSourceTypes.AD;
    case APISyncSourceTypes.ADMIN:
      return SyncSourceTypes.ADMIN;
    case APISyncSourceTypes.EMAIL:
      return SyncSourceTypes.EMAIL;
    case APISyncSourceTypes.OPENID:
      return SyncSourceTypes.OPENID;
    case APISyncSourceTypes.BOTX:
      return SyncSourceTypes.BOTX;
    default:
      return "UNSUPPORTED";
  }
}
