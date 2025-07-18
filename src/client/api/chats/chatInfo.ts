import { AuthorizedBotXMethod, HttpClient, responseExceptionThrower } from "@client";
import { BotAccountsStorage } from "@bot";
import { 
  UnverifiedPayloadBaseModel, 
  VerifiedPayloadBaseModel, 
  ChatInfo,
  APIUserKinds,
  APIChatTypes,
  ChatInfoMember,
  convertUserKindToDomain,
  convertChatTypeToDomain
} from "@models";
import { ChatNotFoundError } from "@client/exceptions/chats";



export class BotXAPIChatInfoRequestPayload extends UnverifiedPayloadBaseModel {
  group_chat_id!: string;

  static fromDomain(chatId: string): BotXAPIChatInfoRequestPayload {
    return new BotXAPIChatInfoRequestPayload({
      group_chat_id: chatId,
    });
  }
}

export class BotXAPIChatInfoMember extends VerifiedPayloadBaseModel {
  admin: boolean;
  user_huid: string;
  user_kind: APIUserKinds;

  constructor(admin: boolean, user_huid: string, user_kind: APIUserKinds) {
    super();
    this.admin = admin;
    this.user_huid = user_huid;
    this.user_kind = user_kind;
  }

  toObject(): Record<string, any> {
    return {
      admin: this.admin,
      user_huid: this.user_huid,
      user_kind: this.user_kind,
    };
  }
}

export class BotXAPIChatInfoResult extends VerifiedPayloadBaseModel {
  constructor(
    public chat_type: APIChatTypes,
    public creator: string | null = null,
    public description: string | null = null,
    public group_chat_id: string,
    public inserted_at: string,
    public members: BotXAPIChatInfoMember[],
    public name: string,
    public shared_history: boolean,
  ) {
    super();
  }

  toObject(): Record<string, any> {
    return {
      chat_type: this.chat_type,
      creator: this.creator,
      description: this.description,
      group_chat_id: this.group_chat_id,
      inserted_at: this.inserted_at,
      members: this.members.map(member => member.toObject()),
      name: this.name,
      shared_history: this.shared_history,
    };
  }
}

export class BotXAPIChatInfoResponsePayload extends VerifiedPayloadBaseModel {
  status: "ok";
  result: BotXAPIChatInfoResult;

  constructor(data: any) {
    super();
    this.status = data.status;
    this.result = new BotXAPIChatInfoResult(
      data.result.chat_type,
      data.result.creator,
      data.result.description,
      data.result.group_chat_id,
      data.result.inserted_at,
      data.result.members.map((member: any) => new BotXAPIChatInfoMember(
        member.admin,
        member.user_huid,
        member.user_kind
      )),
      data.result.name,
      data.result.shared_history
    );
  }

  toDomain(): ChatInfo {
    const members = this.result.members.map(member => new ChatInfoMember(
      member.admin,
      member.user_huid,
      convertUserKindToDomain(member.user_kind),
    ));

    const chatType = convertChatTypeToDomain(this.result.chat_type);
    if (chatType === "UNSUPPORTED") {
      throw new Error(`Unsupported chat type: ${this.result.chat_type}`);
    }

    return new ChatInfo(
      chatType,
      this.result.creator,
      this.result.description,
      this.result.group_chat_id,
      new Date(this.result.inserted_at),
      members,
      this.result.name,
      this.result.shared_history,
    )
  }
}

export class ChatInfoMethod extends AuthorizedBotXMethod {
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

  async execute(payload: BotXAPIChatInfoRequestPayload): Promise<BotXAPIChatInfoResponsePayload> {
    const path = "/api/v3/botx/chats/info";

    const response = await this.botxMethodCall(
      "GET",
      this.buildUrl(path),
      { params: payload.jsonableDict() }
    );

    return await this.verifyAndExtractApiModel(
      BotXAPIChatInfoResponsePayload,
      response
    );
  }
} 