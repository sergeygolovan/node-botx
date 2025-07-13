import { AuthorizedBotXMethod, HttpClient } from "@client";
import { BotAccountsStorage } from "@bot";
import { UnverifiedPayloadBaseModel, VerifiedPayloadBaseModel, APIAsyncFile, File } from "@models";
import { Missing, MissingOptional, Undefined } from "@missing";
import { convertAsyncFileFromDomain } from "@models/asyncFiles";

// Константы
const SMARTAPP_API_VERSION = 1;

export class BotXAPISmartAppEventRequestPayload extends UnverifiedPayloadBaseModel {
  ref!: MissingOptional<string>;
  smartapp_id!: string;
  group_chat_id!: string;
  data!: Record<string, any>;
  opts!: Missing<Record<string, any>>;
  smartapp_api_version!: number;
  async_files!: Missing<APIAsyncFile[]>;
  encrypted!: boolean;

  static fromDomain(
    ref: MissingOptional<string>,
    smartappId: string,
    chatId: string,
    data: Record<string, any>,
    opts: Missing<Record<string, any>>,
    files: Missing<File[]>,
    encrypted: boolean
  ): BotXAPISmartAppEventRequestPayload {
    let apiAsyncFiles: Missing<APIAsyncFile[]> = Undefined;
    if (files !== Undefined) {
      apiAsyncFiles = files.map((file: File) => convertAsyncFileFromDomain(file));
    }

    return new BotXAPISmartAppEventRequestPayload({
      ref,
      smartapp_id: smartappId,
      group_chat_id: chatId,
      data,
      opts,
      smartapp_api_version: SMARTAPP_API_VERSION,
      async_files: apiAsyncFiles,
      encrypted,
    });
  }
}

export class BotXAPISmartAppEventResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
}

export class SmartAppEventMethod extends AuthorizedBotXMethod {
  constructor(
    senderBotId: string,
    httpClient: HttpClient,
    botAccountsStorage: BotAccountsStorage
  ) {
    super(senderBotId, httpClient, botAccountsStorage);
  }

  async execute(payload: BotXAPISmartAppEventRequestPayload): Promise<void> {
    const path = "/api/v3/botx/smartapps/event";

    // TODO: Remove opts
    // UnverifiedPayloadBaseModel.jsonableDict remove empty dicts
    const json = payload.jsonableDict();
    json.opts = json.opts || {};

    const response = await this.botxMethodCall(
      "POST",
      this.buildUrl(path),
      { json }
    );

    this.verifyAndExtractApiModel(
      BotXAPISmartAppEventResponsePayload,
      response
    );
  }
} 