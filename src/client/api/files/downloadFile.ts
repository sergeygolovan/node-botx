import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower, InvalidBotXStatusCodeError } from "@client";
import { AsyncBufferWritable } from "@asyncBuffer";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel } from "@models";
import { ChatNotFoundError, FileDeletedError, FileMetadataNotFound } from "@client/exceptions";
import type { HttpResponse } from "@client/httpClient";

export class BotXAPIDownloadFileRequestPayload extends UnverifiedPayloadBaseModel {
  group_chat_id!: string;
  file_id!: string;
  is_preview!: boolean;

  static fromDomain(chatId: string, fileId: string): BotXAPIDownloadFileRequestPayload {
    return new BotXAPIDownloadFileRequestPayload({
      group_chat_id: chatId,
      file_id: fileId,
      is_preview: false,
    });
  }
}

async function notFoundErrorHandler(response: HttpResponse): Promise<never> {
  try {
    const data = await response.json();
    const reason = data.reason;

    if (reason === "file_metadata_not_found") {
      throw FileMetadataNotFound.fromResponse(response);
    } else if (reason === "chat_not_found") {
      throw ChatNotFoundError.fromResponse(response);
    }
    throw InvalidBotXStatusCodeError.fromResponse(response);
  } catch (error) {
    throw InvalidBotXStatusCodeError.fromResponse(response);
  }
}

export class DownloadFileMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    this.statusHandlers = {
      ...this.statusHandlers,
      204: responseExceptionThrower(FileDeletedError),
      404: notFoundErrorHandler,
    };
  }

  async execute(
    payload: BotXAPIDownloadFileRequestPayload,
    asyncBuffer: AsyncBufferWritable
  ): Promise<void> {
    const path = "/api/v3/botx/files/download";

    const response = await this.botxMethodStream(
      "GET",
      this.buildUrl(path),
      { params: payload.jsonableDict() }
    );

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        await asyncBuffer.write(value);
      }
    } finally {
      reader.releaseLock();
    }

    await asyncBuffer.seek(0);
  }
} 