import { Readable } from "stream";
import { SpooledAsyncBuffer, CHUNK_SIZE } from "@asyncBuffer";
import { botIdVar, botVar, chatIdVar } from "@bot";
import { VerifiedPayloadBaseModel, APIAttachmentTypes, AttachmentTypes, convertAttachmentTypeFromDomain, convertAttachmentTypeToDomain } from "@models";

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
   * Открывает файл и возвращает Readable поток из SpooledAsyncBuffer.
   * SpooledAsyncBuffer используется вместо SpooledTemporaryFile.
   */
  async *open(): AsyncGenerator<Readable> {
    const bot = botVar.get();

    // Создаём спулинговый буфер с ограничением размера, аналог CHUNK_SIZE
    // Используем SpooledAsyncBuffer как в Python оригинале для оптимизации памяти
    const spooledBuffer = new SpooledAsyncBuffer(CHUNK_SIZE);

    try {
      // Скачиваем файл в spooledBuffer (как в Python оригинале)
      if (!bot) {
        throw new Error("Bot not found in context");
      }
      await bot.downloadFileToBuffer(
        botIdVar.get() || "",
        chatIdVar.get() || "",
        this._fileId,
        spooledBuffer
      );

      // Перемещаемся в начало буфера для чтения
      await spooledBuffer.seek(0);

      // Создаём Readable поток, который читает данные чанками из буфера
      const readable = new Readable({
        async read(size) {
          try {
            const chunk = await spooledBuffer.read(size);
            if (chunk.length === 0) {
              this.push(null); // Сигнал конца потока
            } else {
              this.push(chunk);
            }
          } catch (error) {
            this.destroy(error as Error);
          }
        }
      });
      
      yield readable;
    } finally {
      // Очистка ресурсов
      await spooledBuffer.close();
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
  file_mime_type!: string;
  file_id!: string;
  file_name!: string;
  file_size!: number;
  file_hash!: string;
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
        file_name: img.filename,
        file_size: img.size,
        file_id: img._fileId,
        file: img._fileUrl,
        file_mime_type: img._fileMimeType,
        file_hash: img._fileHash,
      } as ApiAsyncFileImage;

    case APIAttachmentTypes.VIDEO:
      const vid = file as Video;
      return {
        type: attachmentType,
        file_name: vid.filename,
        file_size: vid.size,
        duration: vid.duration,
        file_id: vid._fileId,
        file: vid._fileUrl,
        file_mime_type: vid._fileMimeType,
        file_hash: vid._fileHash,
      } as ApiAsyncFileVideo;

    case APIAttachmentTypes.DOCUMENT:
      const doc = file as Document;
      return {
        type: attachmentType,
        file_name: doc.filename,
        file_size: doc.size,
        file_id: doc._fileId,
        file: doc._fileUrl,
        file_mime_type: doc._fileMimeType,
        file_hash: doc._fileHash,
      } as ApiAsyncFileDocument;

    case APIAttachmentTypes.VOICE:
      const voice = file as Voice;
      return {
        type: attachmentType,
        file_name: voice.filename,
        file_size: voice.size,
        duration: voice.duration,
        file_id: voice._fileId,
        file: voice._fileUrl,
        file_mime_type: voice._fileMimeType,
        file_hash: voice._fileHash,
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
        img.file_name,
        img.file_size,
        img.file_id,
        img.file,
        img.file_mime_type,
        img.file_hash
      );

    case AttachmentTypes.VIDEO:
      const vid = asyncFile as ApiAsyncFileVideo;
      return new Video(
        vid.file_name,
        vid.file_size,
        vid.file_id,
        vid.file,
        vid.file_mime_type,
        vid.file_hash,
        vid.duration
      );

    case AttachmentTypes.DOCUMENT:
      const doc = asyncFile as ApiAsyncFileDocument;
      return new Document(
        doc.file_name,
        doc.file_size,
        doc.file_id,
        doc.file,
        doc.file_mime_type,
        doc.file_hash
      );

    case AttachmentTypes.VOICE:
      const voice = asyncFile as ApiAsyncFileVoice;
      return new Voice(
        voice.file_name,
        voice.file_size,
        voice.file_id,
        voice.file,
        voice.file_mime_type,
        voice.file_hash,
        voice.duration
      );

    default:
      throw new Error(`Unsupported attachment type: ${attachmentType}`);
  }
}
