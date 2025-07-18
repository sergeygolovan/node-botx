
import { AsyncBufferReadable } from "@asyncBuffer";
import { VerifiedPayloadBaseModel, UnverifiedPayloadBaseModel } from "@models";
import { APIAttachmentTypes, AttachmentTypes, convertAttachmentTypeToDomain } from "@models";

import { Sticker } from "./stickers";
import { lookup } from 'mime-types';
import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsUUID, IsUrl, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export abstract class FileAttachmentBase {
    @IsEnum(AttachmentTypes)
    type: AttachmentTypes;

    @IsString()
    filename: string;

    @IsNumber()
    size: number;

    @IsBoolean()
    is_async_file: false;

    content: Buffer;

    constructor(
        type: AttachmentTypes,
        filename: string,
        size: number,
        is_async_file: false,
        content: Buffer,
    ) {
        this.type = type;
        this.filename = filename;
        this.size = size;
        this.is_async_file = is_async_file;
        this.content = content;
    }
}

export class AttachmentImage extends FileAttachmentBase {
    override readonly type = AttachmentTypes.IMAGE;
    constructor(
        filename: string,
        size: number,
        is_async_file: false,
        content: Buffer,
    ) {
        super(AttachmentTypes.IMAGE, filename, size, is_async_file, content);
    }
}

export class AttachmentVideo extends FileAttachmentBase {
    override readonly type = AttachmentTypes.VIDEO;
    
    @IsNumber()
    duration: number;

    constructor(
        filename: string,
        size: number,
        is_async_file: false,
        content: Buffer,
        duration: number,
    ) {
        super(AttachmentTypes.VIDEO, filename, size, is_async_file, content);
        this.duration = duration;
    }
}

export class AttachmentDocument extends FileAttachmentBase {
    override readonly type = AttachmentTypes.DOCUMENT;
    constructor(
        filename: string,
        size: number,
        is_async_file: false,
        content: Buffer,
    ) {
        super(AttachmentTypes.DOCUMENT, filename, size, is_async_file, content);
    }
}

export class AttachmentVoice extends FileAttachmentBase {
    override readonly type = AttachmentTypes.VOICE;
    
    @IsNumber()
    duration: number;

    constructor(
        filename: string,
        size: number,
        is_async_file: false,
        content: Buffer,
        duration: number,
    ) {
        super(AttachmentTypes.VOICE, filename, size, is_async_file, content);
        this.duration = duration;
    }
}

export class Location {
    @IsString()
    name: string;

    @IsString()
    address: string;

    @IsString()
    latitude: string;

    @IsString()
    longitude: string;

    constructor(
        name: string,
        address: string,
        latitude: string,
        longitude: string,
    ) {
        this.name = name;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}

export class Contact {
    @IsString()
    name: string;

    constructor(
        name: string,
    ) {
        this.name = name;
    }
}

export class Link {
    @IsUrl()
    url: string;

    @IsString()
    title: string;

    @IsString()
    preview: string;

    @IsString()
    text: string;

    constructor(
        url: string,
        title: string,
        preview: string,
        text: string,
    ) {
        this.url = url;
        this.title = title;
        this.preview = preview;
        this.text = text;
    }
}

export type IncomingFileAttachment = AttachmentImage | AttachmentVideo | AttachmentDocument | AttachmentVoice;

export class OutgoingAttachment {
  @IsBoolean()
  public is_async_file = false as const;

  content: Buffer;

  @IsString()
  filename: string;

  constructor(content: Buffer, filename: string) {
    this.content = content;
    this.filename = filename;
  }

  static async fromAsyncBuffer(
    asyncBuffer: AsyncBufferReadable,
    filename: string
  ): Promise<OutgoingAttachment> {
    const buffer = Buffer.from(await asyncBuffer.read());
    return new OutgoingAttachment(buffer, filename);
  }
}

export class BotAPIAttachmentImageData extends VerifiedPayloadBaseModel {
    @IsString()
    content: string;

    @IsString()
    file_name: string;

    constructor(
        content: string,
        file_name: string,
    ) {
        super();
        this.content = content;
        this.file_name = file_name;
    }
}

export class BotAPIAttachmentImage extends VerifiedPayloadBaseModel {
    @IsEnum(APIAttachmentTypes)
    type: typeof APIAttachmentTypes.IMAGE;

    @ValidateNested()
    @Type(() => BotAPIAttachmentImageData)
    data: BotAPIAttachmentImageData;

    constructor(
        type: typeof APIAttachmentTypes.IMAGE,
        data: BotAPIAttachmentImageData,
    ) {
        super();
        this.type = type;
        this.data = data;
    }
}

export class BotAPIAttachmentVideoData extends VerifiedPayloadBaseModel {
    @IsString()
    content: string;

    @IsString()
    file_name: string;

    @IsNumber()
    duration: number;

    constructor(
        content: string,
        file_name: string,
        duration: number,
    ) {
        super();
        this.content = content;
        this.file_name = file_name;
        this.duration = duration;
    }
}

export class BotAPIAttachmentVideo extends VerifiedPayloadBaseModel {
    @IsEnum(APIAttachmentTypes)
    type: typeof APIAttachmentTypes.VIDEO;

    @ValidateNested()
    @Type(() => BotAPIAttachmentVideoData)
    data: BotAPIAttachmentVideoData;

    constructor(
        type: typeof APIAttachmentTypes.VIDEO,
        data: BotAPIAttachmentVideoData,
    ) {
        super();
        this.type = type;
        this.data = data;
    }
}

export class BotAPIAttachmentDocumentData extends VerifiedPayloadBaseModel {
    @IsString()
    content: string;

    @IsString()
    file_name: string;

    constructor(
        content: string,
        file_name: string,
    ) {
        super();
        this.content = content;
        this.file_name = file_name;
    }
}

export class BotAPIAttachmentDocument extends VerifiedPayloadBaseModel {
    @IsEnum(APIAttachmentTypes)
    type: typeof APIAttachmentTypes.DOCUMENT;

    @ValidateNested()
    @Type(() => BotAPIAttachmentDocumentData)
    data: BotAPIAttachmentDocumentData;

    constructor(
        type: typeof APIAttachmentTypes.DOCUMENT,
        data: BotAPIAttachmentDocumentData,
    ) {
        super();
        this.type = type;
        this.data = data;
    }
}

export class BotAPIAttachmentVoiceData extends VerifiedPayloadBaseModel {
    @IsString()
    content: string;

    @IsNumber()
    duration: number;

    @IsOptional()
    @IsString()
    file_name?: string;

    constructor(
        content: string,
        duration: number,
        file_name?: string,
    ) {
        super();
        this.content = content;
        this.duration = duration;
        this.file_name = file_name;
    }
}

export class BotAPIAttachmentVoice extends VerifiedPayloadBaseModel {
    @IsEnum(APIAttachmentTypes)
    type: typeof APIAttachmentTypes.VOICE;

    @ValidateNested()
    @Type(() => BotAPIAttachmentVoiceData)
    data: BotAPIAttachmentVoiceData;

    constructor(
        type: typeof APIAttachmentTypes.VOICE,
        data: BotAPIAttachmentVoiceData,
    ) {
        super();
        this.type = type;
        this.data = data;
    }
}

export class BotAPIAttachmentLocationData extends VerifiedPayloadBaseModel {
    @IsString()
    location_name: string;

    @IsString()
    location_address: string;

    @IsString()
    location_lat: string;

    @IsString()
    location_lng: string;

    constructor(
        location_name: string,
        location_address: string,
        location_lat: string,
        location_lng: string,
    ) {
        super();
        this.location_name = location_name;
        this.location_address = location_address;
        this.location_lat = location_lat;
        this.location_lng = location_lng;
    }
}

export class BotAPIAttachmentLocation extends VerifiedPayloadBaseModel {
    @IsEnum(APIAttachmentTypes)
    type: typeof APIAttachmentTypes.LOCATION;

    @ValidateNested()
    @Type(() => BotAPIAttachmentLocationData)
    data: BotAPIAttachmentLocationData;

    constructor(
        type: typeof APIAttachmentTypes.LOCATION,
        data: BotAPIAttachmentLocationData,
    ) {
        super();
        this.type = type;
        this.data = data;
    }
}

export class BotAPIAttachmentContactData extends VerifiedPayloadBaseModel {
    @IsString()
    contact_name: string;

    constructor(
        contact_name: string,
    ) {
        super();
        this.contact_name = contact_name;
    }
}

export class BotAPIAttachmentContact extends VerifiedPayloadBaseModel {
    @IsEnum(APIAttachmentTypes)
    type: typeof APIAttachmentTypes.CONTACT;

    @ValidateNested()
    @Type(() => BotAPIAttachmentContactData)
    data: BotAPIAttachmentContactData;

    constructor(
        type: typeof APIAttachmentTypes.CONTACT,
        data: BotAPIAttachmentContactData,
    ) {
        super();
        this.type = type;
        this.data = data;
    }
}

export class BotAPIAttachmentStickerData extends VerifiedPayloadBaseModel {
    @IsUUID()
    id: string; // UUID

    @IsString()
    link: string;

    @IsUUID()
    pack: string; // UUID

    constructor(
        id: string, // UUID
        link: string,
        pack: string, // UUID
    ) {
        super();
        this.id = id;
        this.link = link;
        this.pack = pack;
    }
}

export class BotAPIAttachmentSticker extends VerifiedPayloadBaseModel {
    @IsEnum(APIAttachmentTypes)
    type: typeof APIAttachmentTypes.STICKER;

    @ValidateNested()
    @Type(() => BotAPIAttachmentStickerData)
    data: BotAPIAttachmentStickerData;

    constructor(
        type: typeof APIAttachmentTypes.STICKER,
        data: BotAPIAttachmentStickerData,
    ) {
        super();
        this.type = type;
        this.data = data;
    }
}

export class BotAPIAttachmentLinkData extends VerifiedPayloadBaseModel {
    @IsUrl()
    url: string;

    @IsString()
    url_title: string;

    @IsString()
    url_preview: string;

    @IsString()
    url_text: string;

    constructor(
        url: string,
        url_title: string,
        url_preview: string,
        url_text: string,
    ) {
        super();
        this.url = url;
        this.url_title = url_title;
        this.url_preview = url_preview;
        this.url_text = url_text;
    }
}

export class BotAPIAttachmentLink extends VerifiedPayloadBaseModel {
    @IsEnum(APIAttachmentTypes)
    type: typeof APIAttachmentTypes.LINK;

    @ValidateNested()
    @Type(() => BotAPIAttachmentLinkData)
    data: BotAPIAttachmentLinkData;

    constructor(
        type: typeof APIAttachmentTypes.LINK,
        data: BotAPIAttachmentLinkData,
    ) {
        super();
        this.type = type;
        this.data = data;
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
  @IsString()
  file_name: string;

  @IsString()
  data: string;

  constructor(
    file_name: string,
    data: string
  ) {
    super();
    this.file_name = file_name;
    this.data = data;
  }

  static fromFileAttachment(
    attachment: IncomingFileAttachment | OutgoingAttachment
  ): BotXAPIAttachment {
    const mimetype = lookup(attachment.filename) || 'application/octet-stream';
    const data = encodeRFC2397(attachment.content, mimetype);
    return new BotXAPIAttachment(attachment.filename, data);
  }
}
