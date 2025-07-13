import { Missing, Undefined } from "@missing";
import { AsyncBufferReadable } from "@asyncBuffer";
import { VerifiedPayloadBaseModel, UnverifiedPayloadBaseModel } from "@models";
import { APIAttachmentTypes, AttachmentTypes, convertAttachmentTypeFromDomain, convertAttachmentTypeToDomain } from "@models";
import { Readable } from "stream";
import { Sticker } from "./stickers";
import { lookup } from 'mime-types';

export abstract class FileAttachmentBase {
    constructor(
        public type: AttachmentTypes,
        public fileId: string,
        public fileName: string,
        public fileSize: number,
        public isAsyncFile: false,
        public content: Buffer,
    ) {}
}

export class AttachmentImage extends FileAttachmentBase {
    override readonly type = AttachmentTypes.IMAGE;
    constructor(
        fileId: string,
        public override fileName: string,
        fileSize: number,
        isAsyncFile: false,
        content: Buffer,
    ) {
        super(AttachmentTypes.IMAGE, fileId, fileName, fileSize, isAsyncFile, content);
    }
}

export class AttachmentVideo extends FileAttachmentBase {
    override readonly type = AttachmentTypes.VIDEO;
    constructor(
        fileId: string,
        public override fileName: string,
        fileSize: number,
        isAsyncFile: false,
        content: Buffer,
        public duration: number,
    ) {
        super(AttachmentTypes.VIDEO, fileId, fileName, fileSize, isAsyncFile, content);
    }
}

export class AttachmentDocument extends FileAttachmentBase {
    override readonly type = AttachmentTypes.DOCUMENT;
    constructor(
        fileId: string,
        public override fileName: string,
        fileSize: number,
        isAsyncFile: false,
        content: Buffer,
    ) {
        super(AttachmentTypes.DOCUMENT, fileId, fileName, fileSize, isAsyncFile, content);
    }
}

export class AttachmentVoice extends FileAttachmentBase {
    override readonly type = AttachmentTypes.VOICE;
    constructor(
        fileId: string,
        public override fileName: string,
        fileSize: number,
        isAsyncFile: false,
        content: Buffer,
        public duration: number,
    ) {
        super(AttachmentTypes.VOICE, fileId, fileName, fileSize, isAsyncFile, content);
    }
}

export class Location {
    constructor(
        public name: string,
        public address: string,
        public latitude: string,
        public longitude: string,
    ) {}
}

export class Contact {
    constructor(
        public name: string,
    ) {}
}

export class Link {
    constructor(
        public url: string,
        public title: string,
        public preview: string,
        public text: string,
    ) {}
}

export type IncomingFileAttachment = AttachmentImage | AttachmentVideo | AttachmentDocument | AttachmentVoice;

export class OutgoingAttachment {
  public isAsyncFile = false as const;

  constructor(public content: Buffer, public fileName: string) {}

  static async fromAsyncBuffer(
    asyncBuffer: AsyncBufferReadable,
    fileName: string
  ): Promise<OutgoingAttachment> {
    const buffer = Buffer.from(await asyncBuffer.read());
    return new OutgoingAttachment(buffer, fileName);
  }
}

export class BotAPIAttachmentImageData extends VerifiedPayloadBaseModel {
    constructor(
        public content: string,
        public file_name: string,
    ) {
        super();
    }
}

export class BotAPIAttachmentImage extends VerifiedPayloadBaseModel {
    constructor(
        public type: typeof APIAttachmentTypes.IMAGE,
        public data: BotAPIAttachmentImageData,
    ) {
        super();
    }
}

export class BotAPIAttachmentVideoData extends VerifiedPayloadBaseModel {
    constructor(
        public content: string,
        public file_name: string,
        public duration: number,
    ) {
        super();
    }
}

export class BotAPIAttachmentVideo extends VerifiedPayloadBaseModel {
    constructor(
        public type: typeof APIAttachmentTypes.VIDEO,
        public data: BotAPIAttachmentVideoData,
    ) {
        super();
    }
}

export class BotAPIAttachmentDocumentData extends VerifiedPayloadBaseModel {
    constructor(
        public content: string,
        public file_name: string,
    ) {
        super();
    }
}

export class BotAPIAttachmentDocument extends VerifiedPayloadBaseModel {
    constructor(
        public type: typeof APIAttachmentTypes.DOCUMENT,
        public data: BotAPIAttachmentDocumentData,
    ) {
        super();
    }
}

export class BotAPIAttachmentVoiceData extends VerifiedPayloadBaseModel {
    constructor(
        public content: string,
        public duration: number,
        public file_name?: string,
    ) {
        super();
    }
}

export class BotAPIAttachmentVoice extends VerifiedPayloadBaseModel {
    constructor(
        public type: typeof APIAttachmentTypes.VOICE,
        public data: BotAPIAttachmentVoiceData,
    ) {
        super();
    }
}

export class BotAPIAttachmentLocationData extends VerifiedPayloadBaseModel {
    constructor(
        public location_name: string,
        public location_address: string,
        public location_lat: string,
        public location_lng: string,
    ) {
        super();
    }
}

export class BotAPIAttachmentLocation extends VerifiedPayloadBaseModel {
    constructor(
        public type: typeof APIAttachmentTypes.LOCATION,
        public data: BotAPIAttachmentLocationData,
    ) {
        super();
    }
}

export class BotAPIAttachmentContactData extends VerifiedPayloadBaseModel {
    constructor(
        public contact_name: string,
    ) {
        super();
    }
}

export class BotAPIAttachmentContact extends VerifiedPayloadBaseModel {
    constructor(
        public type: typeof APIAttachmentTypes.CONTACT,
        public data: BotAPIAttachmentContactData,
    ) {
        super();
    }
}

export class BotAPIAttachmentStickerData extends VerifiedPayloadBaseModel {
    constructor(
        public id: string, // UUID
        public link: string,
        public pack: string, // UUID
    ) {
        super();
    }
}

export class BotAPIAttachmentSticker extends VerifiedPayloadBaseModel {
    constructor(
        public type: typeof APIAttachmentTypes.STICKER,
        public data: BotAPIAttachmentStickerData,
    ) {
        super();
    }
}

export class BotAPIAttachmentLinkData extends VerifiedPayloadBaseModel {
    constructor(
        public url: string,
        public url_title: string,
        public url_preview: string,
        public url_text: string,
    ) {
        super();
    }
}

export class BotAPIAttachmentLink extends VerifiedPayloadBaseModel {
    constructor(
        public type: typeof APIAttachmentTypes.LINK,
        public data: BotAPIAttachmentLinkData,
    ) {
        super();
    }
}

export type BotAPIAttachment =
  | BotAPIAttachmentVideo
  | BotAPIAttachmentImage
  | BotAPIAttachmentDocument
  | BotAPIAttachmentVoice
  | BotAPIAttachmentLocation
  | BotAPIAttachmentContact
  | BotAPIAttachmentLink
  | BotAPIAttachmentSticker;

export type IncomingAttachment =
  | IncomingFileAttachment
  | Location
  | Contact
  | Link
  | Sticker;

export const EXTENSIONS_TO_MIMETYPES: Readonly<Record<string, string>> = {
  // application
  "7z": "application/x-7z-compressed",
  abw: "application/x-abiword",
  ai: "application/postscript",
  arc: "application/x-freearc",
  azw: "application/vnd.amazon.ebook",
  bin: "application/octet-stream",
  bz: "application/x-bzip",
  bz2: "application/x-bzip2",
  cda: "application/x-cdf",
  csh: "application/x-csh",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  eot: "application/vnd.ms-fontobject",
  eps: "application/postscript",
  epub: "application/epub+zip",
  gz: "application/gzip",
  jar: "application/java-archive",
  "json-api": "application/vnd.api+json",
  "json-patch": "application/json-patch+json",
  json: "application/json",
  jsonld: "application/ld+json",
  mdb: "application/x-msaccess",
  mpkg: "application/vnd.apple.installer+xml",
  odp: "application/vnd.oasis.opendocument.presentation",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odt: "application/vnd.oasis.opendocument.text",
  ogx: "application/ogg",
  pdf: "application/pdf",
  php: "application/x-httpd-php",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ps: "application/postscript",
  rar: "application/vnd.rar",
  rtf: "application/rtf",
  sh: "application/x-sh",
  swf: "application/x-shockwave-flash",
  tar: "application/x-tar",
  vsd: "application/vnd.visio",
  wasm: "application/wasm",
  webmanifest: "application/manifest+json",
  xhtml: "application/xhtml+xml",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xul: "application/vnd.mozilla.xul+xml",
  zip: "application/zip",

  // audio
  aac: "audio/aac",
  mid: "audio/midi",
  midi: "audio/midi",
  mp3: "audio/mpeg",
  oga: "audio/ogg",
  opus: "audio/opus",
  wav: "audio/wav",
  weba: "audio/webm",

  // font
  otf: "font/otf",
  ttf: "font/ttf",
  woff: "font/woff",
  woff2: "font/woff2",

  // image
  avif: "image/avif",
  bmp: "image/bmp",
  gif: "image/gif",
  ico: "image/vnd.microsoft.icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  svgz: "image/svg+xml",
  tif: "image/tiff",
  tiff: "image/tiff",
  webp: "image/webp",

  // text
  css: "text/css",
  csv: "text/csv",
  htm: "text/html",
  html: "text/html",
  ics: "text/calendar",
  js: "text/javascript",
  mjs: "text/javascript",
  txt: "text/plain",
  text: "text/plain",
  xml: "text/xml",

  // video
  "3g2": "video/3gpp2",
  "3gp": "video/3gpp",
  avi: "video/x-msvideo",
  mov: "video/quicktime",
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  mpg: "video/mpeg",
  ogv: "video/ogg",
  ts: "video/mp2t",
  webm: "video/webm",
  wmv: "video/x-ms-wmv",
};

export const DEFAULT_MIMETYPE = "application/octet-stream";

export function convertAPIAttachmentToDomain(
  apiAttachment: BotAPIAttachment,
  messageBody: string
): IncomingAttachment {
  const attachmentType = convertAttachmentTypeToDomain(apiAttachment.type);

  if (attachmentType === AttachmentTypes.IMAGE) {
    const apiImage = apiAttachment as BotAPIAttachmentImage;
    const content = decodeRFC2397(apiImage.data.content);
    return new AttachmentImage(
      "", // fileId is not available in BotAPIAttachment
      apiImage.data.file_name,
      content.length,
      false,
      Buffer.from(content)
    );
  }

  if (attachmentType === AttachmentTypes.VIDEO) {
    const apiVideo = apiAttachment as BotAPIAttachmentVideo;
    const content = decodeRFC2397(apiVideo.data.content);
    return new AttachmentVideo(
      "", // fileId is not available
      apiVideo.data.file_name,
      content.length,
      false,
      Buffer.from(content),
      apiVideo.data.duration,
    );
  }

  if (attachmentType === AttachmentTypes.DOCUMENT) {
    const apiDocument = apiAttachment as BotAPIAttachmentDocument;
    const content = decodeRFC2397(apiDocument.data.content);
    return new AttachmentDocument(
      "", // fileId is not available
      apiDocument.data.file_name,
      content.length,
      false,
      Buffer.from(content)
    );
  }

  if (attachmentType === AttachmentTypes.VOICE) {
    const apiVoice = apiAttachment as BotAPIAttachmentVoice;
    const content = decodeRFC2397(apiVoice.data.content);
    const ext = getAttachmentExtensionFromEncodedContent(apiVoice.data.content);
    return new AttachmentVoice(
      "", // fileId is not available
      apiVoice.data.file_name ?? `record.${ext}`,
      content.length,
      false,
      Buffer.from(content),
      apiVoice.data.duration,
    );
  }

  if (attachmentType === AttachmentTypes.LOCATION) {
    const apiLocation = apiAttachment as BotAPIAttachmentLocation;
    return new Location(
      apiLocation.data.location_name,
      apiLocation.data.location_address,
      apiLocation.data.location_lat,
      apiLocation.data.location_lng,
    );
  }

  if (attachmentType === AttachmentTypes.CONTACT) {
    const apiContact = apiAttachment as BotAPIAttachmentContact;
    return new Contact(apiContact.data.contact_name);
  }

  if (attachmentType === AttachmentTypes.LINK) {
    const apiLink = apiAttachment as BotAPIAttachmentLink;
    return new Link(
      apiLink.data.url,
      apiLink.data.url_title,
      apiLink.data.url_preview,
      apiLink.data.url_text,
    );
  }

  if (attachmentType === AttachmentTypes.STICKER) {
    const apiSticker = apiAttachment as BotAPIAttachmentSticker;
    return new Sticker(
      apiSticker.data.id,
      apiSticker.data.link,
      apiSticker.data.pack,
      messageBody,
    );
  }

  throw new Error(`Unsupported attachment type: ${attachmentType}`);
}

export function getAttachmentExtensionFromEncodedContent(
  encodedContent: string
): string {
  const match = encodedContent.match(/^data:(.*?);/);
  if (match && match[1]) {
    const mimeType = match[1];
    const parts = mimeType.split('/');
    if (parts.length > 1) {
      return parts[parts.length - 1];
    }
  }
  return 'bin'; // Default extension
}

export function decodeRFC2397(encodedContent: string): Buffer {
  // "data:image/gif;base64,aGVsbG8=" -> <Buffer 68 65 6c 6c 6f>
  const match = encodedContent.match(/^data:.*?;base64,(.*)$/);
  if (match && match[1]) {
    return Buffer.from(match[1], 'base64');
  }
  throw new Error("Invalid RFC2397 data URL");
}

export function encodeRFC2397(content: Buffer, mimetype: string): string {
  const base64Content = content.toString('base64');
  return `data:${mimetype};base64,${base64Content}`;
}

export class BotXAPIAttachment extends UnverifiedPayloadBaseModel {
  constructor(
    public file_name: string,
    public data: string
  ) {
    super();
  }

  static fromFileAttachment(
    attachment: IncomingFileAttachment | OutgoingAttachment
  ): BotXAPIAttachment {
    const mimetype = lookup(attachment.fileName) || 'application/octet-stream';
    const data = encodeRFC2397(attachment.content, mimetype);
    return new BotXAPIAttachment(attachment.fileName, data);
  }
}
