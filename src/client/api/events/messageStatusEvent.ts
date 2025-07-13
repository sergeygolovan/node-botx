import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel, MessageStatus } from "@models";
import { EventNotFoundError } from "@client/exceptions/event";

export class BotXAPIMessageStatusRequestPayload extends UnverifiedPayloadBaseModel {
  sync_id!: string;

  static fromDomain(syncId: string): BotXAPIMessageStatusRequestPayload {
    return new BotXAPIMessageStatusRequestPayload({
      sync_id: syncId,
    });
  }
}

export class BotXAPIMessageStatusReadUser extends VerifiedPayloadBaseModel {
  user_huid!: string;
  read_at!: Date;
}

export class BotXAPIMessageStatusReceivedUser extends VerifiedPayloadBaseModel {
  user_huid!: string;
  received_at!: Date;
}

export class BotXAPIMessageStatusResult extends VerifiedPayloadBaseModel {
  group_chat_id!: string;
  sent_to!: string[];
  read_by!: BotXAPIMessageStatusReadUser[];
  received_by!: BotXAPIMessageStatusReceivedUser[];
}

export class BotXAPIMessageStatusResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: BotXAPIMessageStatusResult;

  toDomain(): MessageStatus {
    return new MessageStatus(
      this.result.group_chat_id,
      this.result.sent_to,
      Object.fromEntries(
        this.result.read_by.map(reader => [reader.user_huid, reader.read_at])
      ),
      Object.fromEntries(
        this.result.received_by.map(receiver => [receiver.user_huid, receiver.received_at])
      )
    );
  }
}

export class MessageStatusMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
    this.statusHandlers = {
      ...this.statusHandlers,
      404: responseExceptionThrower(EventNotFoundError),
    } as any;
  }

  async execute(payload: BotXAPIMessageStatusRequestPayload): Promise<BotXAPIMessageStatusResponsePayload> {
    const path = `/api/v3/botx/events/${payload.sync_id}/status`;

    const response = await this.botxMethodCall(
      "GET",
      this.buildUrl(path)
    );

    return this.verifyAndExtractApiModel(BotXAPIMessageStatusResponsePayload, response);
  }
} 