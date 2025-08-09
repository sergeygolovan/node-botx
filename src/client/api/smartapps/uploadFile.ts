import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";
import { AsyncBufferReadable, SpooledAsyncBuffer, CHUNK_SIZE } from "@asyncBuffer";
import { responseExceptionThrower } from "@client";
import { FileTypeNotAllowed } from "@client";
import { VerifiedPayloadBaseModel } from "@models";

export class BotXAPISmartAppUploadFileResult extends VerifiedPayloadBaseModel {
  link!: string;
}

export class BotXAPISmartAppUploadFileResponsePayload extends VerifiedPayloadBaseModel {
  result!: BotXAPISmartAppUploadFileResult;
  status!: "ok";

  toDomain(): string {
    return this.result.link;
  }
}

export class SmartAppUploadFileMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    this.statusHandlers = {
      ...this.statusHandlers,
      400: responseExceptionThrower(FileTypeNotAllowed),
    };
  }

  async execute(
    asyncBuffer: AsyncBufferReadable,
    filename: string
  ): Promise<BotXAPISmartAppUploadFileResponsePayload> {
    const path = "/api/v3/botx/smartapps/upload_file";

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

      return this.verifyAndExtractApiModel(
        BotXAPISmartAppUploadFileResponsePayload,
        response
      );
    } finally {
      // Закрываем спулинговый буфер (автоматически удаляет временный файл)
      await spooledBuffer.close();
    }
  }
} 