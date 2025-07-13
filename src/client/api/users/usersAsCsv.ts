import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { AsyncBufferWritable } from "@asyncBuffer";
import { NoUserKindSelectedError } from "@client/exceptions/users";
import { UnverifiedPayloadBaseModel } from "@models";

export class BotXAPIUsersAsCSVRequestPayload extends UnverifiedPayloadBaseModel {
  cts_user!: boolean;
  unregistered!: boolean;
  botx!: boolean;

  static fromDomain(
    ctsUser: boolean,
    unregistered: boolean,
    botx: boolean
  ): BotXAPIUsersAsCSVRequestPayload {
    return new BotXAPIUsersAsCSVRequestPayload({
      cts_user: ctsUser,
      unregistered,
      botx,
    });
  }
}

export class UsersAsCSVMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    this.statusHandlers = {
      ...this.statusHandlers,
      400: responseExceptionThrower(NoUserKindSelectedError),
    } as any;
  }

  async execute(payload: BotXAPIUsersAsCSVRequestPayload, asyncBuffer: AsyncBufferWritable): Promise<void> {
    const path = "/api/v3/botx/users/users_as_csv";

    const response = await this.botxMethodStream(
      "GET",
      this.buildUrl(path),
      { params: payload.jsonableDict() }
    );

    // Копируем данные из ReadableStream в наш буфер
    // Аналог Python: async for chunk in response.aiter_bytes()
    if (!response.body) {
      throw new Error("Response body is not readable");
    }

    const reader = response.body.getReader();
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