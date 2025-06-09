import ScratchPad from "file-scratch-pad";
import { Readable } from "stream";

import { botIdVar, botVar, chatIdVar } from "../bot/contextVars"; // аналоги contextvars
import { CHUNK_SIZE } from "../constants";
import { VerifiedPayloadBaseModel } from "./apiBase";
import {
  APIAttachmentTypes,
  AttachmentTypes,
  convertAttachmentTypeFromDomain,
  convertAttachmentTypeToDomain,
} from "./enums";

type AsyncGenerator<T> = AsyncIterableIterator<T>;

export abstract class AsyncFileBase {
  abstract type: AttachmentTypes;
  filename: string;
  size: number;
  isAsyncFile: true = true;

  _fileId: string;
  _fileUrl: string;
  _fileMimeType: string;
  _fileHash: string;

  constructor(
    filename: string,
    size: number,
    fileId: string,
    fileUrl: string,
    fileMimeType: string,
    fileHash: string
  ) {
    this.filename = filename;
    this.size = size;
    this._fileId = fileId;
    this._fileUrl = fileUrl;
    this._fileMimeType = fileMimeType;
    this._fileHash = fileHash;
  }

  /**
   * Открывает файл и возвращает Readable поток из ScratchPad.
   * ScratchPad используется вместо SpooledTemporaryFile.
   */
  async *open(): AsyncGenerator<Readable> {
    const bot = botVar.get();

    // Создаём временный буфер с ограничением размера, аналог CHUNK_SIZE
    const scratchPad = await ScratchPad.create({ maxSize: CHUNK_SIZE });

    try {
      // Скачиваем файл в scratchPad (нужно, чтобы bot.downloadFile умел писать в scratchPad)
      await bot.downloadFile({
        botId: botIdVar.get(),
        chatId: chatIdVar.get(),
        fileId: this._fileId,
        asyncBuffer: scratchPad,
      });

      // Возвращаем Readable поток из scratchPad
      yield scratchPad.stream();
    } finally {
      // Очистка ресурсов
      await scratchPad.close();
    }
  }
}

export class Image extends AsyncFileBase {
  type: AttachmentTypes.IMAGE = AttachmentTypes.IMAGE;
}

export class Video extends AsyncFileBase {
  type: AttachmentTypes.VIDEO = AttachmentTypes.VIDEO;
  duration: number;

  constructor(
    filename: string,
    size: number,
    fileId: string,
    fileUrl: string,
    fileMimeType: string,
    fileHash: string,
    duration: number
  ) {
    super(filename, size, fileId, fileUrl, fileMimeType, fileHash);
    this.duration = duration;
  }
}

export class Document extends AsyncFileBase {
  type: AttachmentTypes.DOCUMENT = AttachmentTypes.DOCUMENT;
}

export class Voice extends AsyncFileBase {
  type: AttachmentTypes.VOICE = AttachmentTypes.VOICE;
  duration: number;

  constructor(
    filename: string,
    size: number,
    fileId: string,
    fileUrl: string,
    fileMimeType: string,
    fileHash: string,
    duration: number
  ) {
    super(filename, size, fileId, fileUrl, fileMimeType, fileHash);
    this.duration = duration;
  }
}

export abstract class APIAsyncFileBase extends VerifiedPayloadBaseModel {
  type!: APIAttachmentTypes;
  file!: string;
  fileMimeType!: string;
  fileId!: string;
  fileName!: string;
  fileSize!: number;
  fileHash!: string;
}

export class ApiAsyncFileImage extends APIAsyncFileBase {
  type: APIAttachmentTypes.IMAGE = APIAttachmentTypes.IMAGE;
}

export class ApiAsyncFileVideo extends APIAsyncFileBase {
  type: APIAttachmentTypes.VIDEO = APIAttachmentTypes.VIDEO;
  duration!: number;
}

export class ApiAsyncFileDocument extends APIAsyncFileBase {
  type: APIAttachmentTypes.DOCUMENT = APIAttachmentTypes.DOCUMENT;
}

export class ApiAsyncFileVoice extends APIAsyncFileBase {
  type: APIAttachmentTypes.VOICE = APIAttachmentTypes.VOICE;
  duration!: number;
}

export type APIAsyncFile =
  | ApiAsyncFileImage
  | ApiAsyncFileVideo
  | ApiAsyncFileDocument
  | ApiAsyncFileVoice;

export type File = Image | Video | Document | Voice;

export function convertAsyncFileFromDomain(file: File): APIAsyncFile {
  const attachmentType = convertAttachmentTypeFromDomain(file.type);

  switch (attachmentType) {
    case APIAttachmentTypes.IMAGE:
      const img = file as Image;
      return {
        type: attachmentType,
        fileName: img.filename,
        fileSize: img.size,
        fileId: img._fileId,
        file: img._fileUrl,
        fileMimeType: img._fileMimeType,
        fileHash: img._fileHash,
      } as ApiAsyncFileImage;

    case APIAttachmentTypes.VIDEO:
      const vid = file as Video;
      return {
        type: attachmentType,
        fileName: vid.filename,
        fileSize: vid.size,
        duration: vid.duration,
        fileId: vid._fileId,
        file: vid._fileUrl,
        fileMimeType: vid._fileMimeType,
        fileHash: vid._fileHash,
      } as ApiAsyncFileVideo;

    case APIAttachmentTypes.DOCUMENT:
      const doc = file as Document;
      return {
        type: attachmentType,
        fileName: doc.filename,
        fileSize: doc.size,
        fileId: doc._fileId,
        file: doc._fileUrl,
        fileMimeType: doc._fileMimeType,
        fileHash: doc._fileHash,
      } as ApiAsyncFileDocument;

    case APIAttachmentTypes.VOICE:
      const voice = file as Voice;
      return {
        type: attachmentType,
        fileName: voice.filename,
        fileSize: voice.size,
        duration: voice.duration,
        fileId: voice._fileId,
        file: voice._fileUrl,
        fileMimeType: voice._fileMimeType,
        fileHash: voice._fileHash,
      } as ApiAsyncFileVoice;

    default:
      throw new Error(`Unsupported attachment type: ${attachmentType}`);
  }
}

export function convertAsyncFileToDomain(asyncFile: APIAsyncFile): File {
  const attachmentType = convertAttachmentTypeToDomain(asyncFile.type);

  switch (attachmentType) {
    case AttachmentTypes.IMAGE:
      const img = asyncFile as ApiAsyncFileImage;
      return new Image(
        img.fileName,
        img.fileSize,
        img.fileId,
        img.file,
        img.fileMimeType,
        img.fileHash
      );

    case AttachmentTypes.VIDEO:
      const vid = asyncFile as ApiAsyncFileVideo;
      return new Video(
        vid.fileName,
        vid.fileSize,
        vid.fileId,
        vid.file,
        vid.fileMimeType,
        vid.fileHash,
        vid.duration
      );

    case AttachmentTypes.DOCUMENT:
      const doc = asyncFile as ApiAsyncFileDocument;
      return new Document(
        doc.fileName,
        doc.fileSize,
        doc.fileId,
        doc.file,
        doc.fileMimeType,
        doc.fileHash
      );

    case AttachmentTypes.VOICE:
      const voice = asyncFile as ApiAsyncFileVoice;
      return new Voice(
        voice.fileName,
        voice.fileSize,
        voice.fileId,
        voice.file,
        voice.fileMimeType,
        voice.fileHash,
        voice.duration
      );

    default:
      throw new Error(`Unsupported attachment type: ${attachmentType}`);
  }
}
