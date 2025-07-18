// Base exceptions
export { BaseClientError } from "./base";

// Common exceptions
export { 
  InvalidBotAccountError, 
  RateLimitReachedError, 
  PermissionDeniedError, 
  ChatNotFoundError 
} from "./common";

// User exceptions
export { 
  UserNotFoundError, 
  InvalidProfileDataError, 
  NoUserKindSelectedError 
} from "./users";

// Message exceptions
export { MessageNotFoundError } from "./message";

// Event exceptions
export { EventNotFoundError } from "./event";

// File exceptions
export { 
  FileDeletedError, 
  FileMetadataNotFound, 
  FileTypeNotAllowed 
} from "./files";

// Notification exceptions
export { 
  BotIsNotChatMemberError, 
  FinalRecipientsListEmptyError, 
  StealthModeDisabledError 
} from "./notifications";

// Chat exceptions
export { 
  CantUpdatePersonalChatError, 
  InvalidUsersListError, 
  ChatCreationProhibitedError, 
  ChatCreationError 
} from "./chats";

// Sticker exceptions
export { 
  StickerPackOrStickerNotFoundError,
  InvalidEmojiError,
  InvalidImageError
} from "./stickers";

// HTTP exceptions
export { 
  InvalidBotXResponseError, 
  InvalidBotXStatusCodeError, 
  InvalidBotXResponsePayloadError 
} from "./http";

// Callback exceptions
export { 
  BotXMethodFailedCallbackReceivedError, 
  CallbackNotReceivedError 
} from "./callbacks";

// SmartApps exceptions
export { SyncSmartAppEventHandlerNotFoundError } from "../api/smartapps/exceptions"; 