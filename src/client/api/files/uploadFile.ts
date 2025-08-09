import { AsyncBufferReadable, CHUNK_SIZE, SpooledAsyncBuffer } from "@asyncBuffer";
import { BotAccountsStorage } from "@bot";
import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { ChatNotFoundError } from "@client/exceptions/common";
import { Missing } from "@missing";
import { APIAsyncFile, Document, File as DomainFile, Image, UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel, Video, Voice } from "@models";

export class BotXAPIUploadFileMeta extends UnverifiedPayloadBaseModel {
  duration!: Missing<number>;
  caption!: Missing<string>;
}

export class BotXAPIUploadFileRequestPayload extends UnverifiedPayloadBaseModel {
  group_chat_id!: string; // Должно быть snake_case для API
  meta!: BotXAPIUploadFileMeta;

  static fromDomain(
    chatId: string,
    duration: Missing<number>,
    caption: Missing<string>
  ): BotXAPIUploadFileRequestPayload {
    return new BotXAPIUploadFileRequestPayload({
      group_chat_id: chatId,
      meta: new BotXAPIUploadFileMeta({
        duration,
        caption,
      }),
    });
  }
}

export class BotXAPIUploadFileResponsePayload extends VerifiedPayloadBaseModel {
  result!: APIAsyncFile;
  status!: "ok";

  toDomain(): DomainFile {
    // Определяем тип файла по MIME типу
    const mimeType = this.result.file_mime_type;
    let fileType: string;
    
    if (mimeType.startsWith('image/')) {
      fileType = 'image';
    } else if (mimeType.startsWith('video/')) {
      fileType = 'video';
    } else if (mimeType.startsWith('audio/')) {
      fileType = 'voice';
    } else {
      fileType = 'document';
    }

    // Создаем правильный экземпляр файла в зависимости от типа
    switch (fileType) {
      case 'image':
        return new Image(
          this.result.file_name,
          this.result.file_size,
          this.result.file_id,
          this.result.file,
          this.result.file_mime_type,
          this.result.file_hash,
        );
      case 'video':
        const vid = this.result as any;
        return new Video(
          this.result.file_name,
          this.result.file_size,
          this.result.file_id,
          this.result.file,
          this.result.file_mime_type,
          this.result.file_hash,
          vid.duration || 0
        );
      case 'voice':
        const voice = this.result as any;
        return new Voice(
          this.result.file_name,
          this.result.file_size,
          this.result.file_id,
          this.result.file,
          this.result.file_mime_type,
          this.result.file_hash,
          voice.duration || 0
        );
      case 'document':
      default:
        return new Document(
          this.result.file_name,
          this.result.file_size,
          this.result.file_id,
          this.result.file,
          this.result.file_mime_type,
          this.result.file_hash
        );
    }
  }
}

export interface File {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  caption?: string;
}

export class UploadFileMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    this.statusHandlers = {
      ...this.statusHandlers,
      404: responseExceptionThrower(ChatNotFoundError),
    };
  }

  async execute(
    payload: BotXAPIUploadFileRequestPayload,
    asyncBuffer: AsyncBufferReadable,
    filename: string
  ): Promise<BotXAPIUploadFileResponsePayload> {
    const path = "/api/v3/botx/files/upload";

    // Создаем спулинговый буфер для оптимизации памяти (как в Python оригинале)
    const spooledBuffer = new SpooledAsyncBuffer(CHUNK_SIZE);
    
    try {
      // Копируем данные из входного буфера в спулинговый буфер (как в Python)
      let chunk = await asyncBuffer.read(CHUNK_SIZE);
      while (chunk && chunk.length > 0) {
        await spooledBuffer.write(chunk);
        chunk = await asyncBuffer.read(CHUNK_SIZE);
      }

      // Перемещаемся в начало спулингового буфера (как в Python)
      await spooledBuffer.seek(0);

      // Создаем FormData для загрузки файла
      const formData = new FormData();
      
      // Добавляем данные payload через jsonableDict() как в Python
      const payloadData = payload.jsonableDict();
      for (const [key, value] of Object.entries(payloadData)) {
        formData.append(key, value as string);
      }

      // В Node.js мы не можем напрямую отправить файл как в Python,
      // поэтому читаем данные и создаем Blob
      const chunks: Uint8Array[] = [];
      chunk = await spooledBuffer.read(CHUNK_SIZE);
      
      while (chunk && chunk.length > 0) {
        chunks.push(chunk);
        chunk = await spooledBuffer.read(CHUNK_SIZE);
      }

      // Объединяем все чанки
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const fileData = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        fileData.set(chunk, offset);
        offset += chunk.length;
      }

      const blob = new Blob([fileData]);
      formData.append("content", blob, filename);

      const response = await this.botxMethodCall(
        "POST",
        this.buildUrl(path),
        { data: formData }
      );

      const responseData = await response.json();
      return this.verifyAndExtractApiModel(BotXAPIUploadFileResponsePayload, responseData);
    } finally {
      // Закрываем спулинговый буфер (автоматически удаляет временный файл)
      await spooledBuffer.close();
    }
  }
} 