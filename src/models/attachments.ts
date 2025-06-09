import {
  decode as base64decode,
  encode as base64encode,
} from "base64-arraybuffer";
import { Readable } from "stream";
import { AsyncBufferReadable } from "../asyncBuffer";
import {
  APIAttachmentTypes,
  AttachmentTypes,
  convertAttachmentTypeToDomain,
} from "./enums";
import { Sticker } from "./stickers";

export interface FileAttachmentBase {
  type: AttachmentTypes;
  filename: string;
  size: number;
  isAsyncFile: false;
  content: Buffer;
  open(): Promise<Readable>;
}

export class AttachmentImage implements FileAttachmentBase {
  type = AttachmentTypes.IMAGE as const;
  constructor(
    public filename: string,
    public size: number,
    public content: Buffer,
    public isAsyncFile = false as const
  ) {}

  async open(): Promise<Readable> {
    const stream = Readable.from(this.content);
    return stream;
  }
}

export class AttachmentVideo implements FileAttachmentBase {
  type = AttachmentTypes.VIDEO as const;
  constructor(
    public filename: string,
    public size: number,
    public content: Buffer,
    public duration: number,
    public isAsyncFile = false as const
  ) {}

  async open(): Promise<Readable> {
    return Readable.from(this.content);
  }
}

export class AttachmentDocument implements FileAttachmentBase {
  type = AttachmentTypes.DOCUMENT as const;
  constructor(
    public filename: string,
    public size: number,
    public content: Buffer,
    public isAsyncFile = false as const
  ) {}

  async open(): Promise<Readable> {
    return Readable.from(this.content);
  }
}

export class AttachmentVoice implements FileAttachmentBase {
  type = AttachmentTypes.VOICE as const;
  constructor(
    public filename: string,
    public size: number,
    public content: Buffer,
    public duration: number,
    public isAsyncFile = false as const
  ) {}

  async open(): Promise<Readable> {
    return Readable.from(this.content);
  }
}

export class Location {
  constructor(
    public name: string,
    public address: string,
    public latitude: string,
    public longitude: string
  ) {}
}

export class Contact {
  constructor(public name: string) {}
}

export class Link {
  constructor(
    public url: string,
    public title: string,
    public preview: string,
    public text: string
  ) {}
}

export type IncomingFileAttachment =
  | AttachmentImage
  | AttachmentVideo
  | AttachmentDocument
  | AttachmentVoice;

export class OutgoingAttachment {
  public isAsyncFile = false as const;

  constructor(public content: Buffer, public filename: string) {}

  static async fromAsyncBuffer(
    asyncBuffer: AsyncBufferReadable,
    filename: string
  ): Promise<OutgoingAttachment> {
    const buffer = Buffer.from(await asyncBuffer.read());
    return new OutgoingAttachment(buffer, filename);
  }
}

export interface BotAPIAttachmentImageData {
  content: string;
  file_name: string;
}

export interface BotAPIAttachmentImage {
  type: typeof APIAttachmentTypes.IMAGE;
  data: BotAPIAttachmentImageData;
}

export interface BotAPIAttachmentVideoData {
  content: string;
  file_name: string;
  duration: number;
}

export interface BotAPIAttachmentVideo {
  type: typeof APIAttachmentTypes.VIDEO;
  data: BotAPIAttachmentVideoData;
}

export interface BotAPIAttachmentDocumentData {
  content: string;
  file_name: string;
}

export interface BotAPIAttachmentDocument {
  type: typeof APIAttachmentTypes.DOCUMENT;
  data: BotAPIAttachmentDocumentData;
}

export interface BotAPIAttachmentVoiceData {
  content: string;
  duration: number;
}

export interface BotAPIAttachmentVoice {
  type: typeof APIAttachmentTypes.VOICE;
  data: BotAPIAttachmentVoiceData;
}

export interface BotAPIAttachmentLocationData {
  location_name: string;
  location_address: string;
  location_lat: string;
  location_lng: string;
}

export interface BotAPIAttachmentLocation {
  type: typeof APIAttachmentTypes.LOCATION;
  data: BotAPIAttachmentLocationData;
}

export interface BotAPIAttachmentContactData {
  contact_name: string;
}

export interface BotAPIAttachmentContact {
  type: typeof APIAttachmentTypes.CONTACT;
  data: BotAPIAttachmentContactData;
}

export interface BotAPIAttachmentStickerData {
  id: string; // UUID
  link: string;
  pack: string; // UUID
}

export interface BotAPIAttachmentSticker {
  type: typeof APIAttachmentTypes.STICKER;
  data: BotAPIAttachmentStickerData;
}

export interface BotAPIAttachmentLinkData {
  url: string;
  url_title: string;
  url_preview: string;
  url_text: string;
}

export interface BotAPIAttachmentLink {
  type: typeof APIAttachmentTypes.LINK;
  data: BotAPIAttachmentLinkData;
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

  switch (attachmentType) {
    case AttachmentTypes.IMAGE: {
      const image = apiAttachment as BotAPIAttachmentImage;
      const content = decodeRFC2397(image.data.content);
      return new AttachmentImage(
        image.data.file_name,
        content.byteLength,
        Buffer.from(content)
      );
    }

    case AttachmentTypes.VIDEO: {
      const video = apiAttachment as BotAPIAttachmentVideo;
      const content = decodeRFC2397(video.data.content);
      return new AttachmentVideo(
        video.data.file_name,
        content.byteLength,
        Buffer.from(content),
        video.data.duration
      );
    }

    case AttachmentTypes.DOCUMENT: {
      const doc = apiAttachment as BotAPIAttachmentDocument;
      const content = decodeRFC2397(doc.data.content);
      return new AttachmentDocument(
        doc.data.file_name,
        content.byteLength,
        Buffer.from(content)
      );
    }

    case AttachmentTypes.VOICE: {
      const voice = apiAttachment as BotAPIAttachmentVoice;
      const content = decodeRFC2397(voice.data.content);
      const ext = getAttachmentExtensionFromEncodedContent(voice.data.content);
      return new AttachmentVoice(
        `record.${ext}`,
        content.byteLength,
        Buffer.from(content),
        voice.data.duration
      );
    }

    case AttachmentTypes.LOCATION: {
      const loc = apiAttachment as BotAPIAttachmentLocation;
      return new Location(
        loc.data.location_name,
        loc.data.location_address,
        loc.data.location_lat,
        loc.data.location_lng
      );
    }

    case AttachmentTypes.CONTACT: {
      const contact = apiAttachment as BotAPIAttachmentContact;
      return new Contact(contact.data.contact_name);
    }

    case AttachmentTypes.LINK: {
      const link = apiAttachment as BotAPIAttachmentLink;
      return new Link(
        link.data.url,
        link.data.url_title,
        link.data.url_preview,
        link.data.url_text
      );
    }

    case AttachmentTypes.STICKER: {
      const sticker = apiAttachment as BotAPIAttachmentSticker;
      return new Sticker(
        sticker.data.id,
        sticker.data.link,
        sticker.data.pack,
        messageBody
      );
    }

    default:
      throw new Error(`Unsupported attachment type: ${attachmentType}`);
  }
}

export function getAttachmentExtensionFromEncodedContent(
  encodedContent: string
): string {
  return encodedContent.split(";")[0].split("/")[1];
}

export function decodeRFC2397(encodedContent: string): Uint8Array {
  if (!encodedContent) return new Uint8Array();
  const base64Data = encodedContent.split(",", 2)[1];
  return new Uint8Array(base64decode(base64Data));
}

export function encodeRFC2397(content: Uint8Array, mimetype: string): string {
  return `data:${mimetype};base64,${base64encode(content)}`;
}

export class BotXAPIAttachment {
  file_name: string;
  data: string;

  constructor(file_name: string, data: string) {
    this.file_name = file_name;
    this.data = data;
  }

  static fromFileAttachment(
    attachment: IncomingFileAttachment | OutgoingAttachment
  ): BotXAPIAttachment {
    const ext = attachment.filename.split(".").pop() ?? "";
    const mimetype = EXTENSIONS_TO_MIMETYPES[ext] ?? DEFAULT_MIMETYPE;
    return new BotXAPIAttachment(
      attachment.filename,
      encodeRFC2397(attachment.content, mimetype)
    );
  }
}
