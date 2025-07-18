import { BotAccount, Chat, File, APIAsyncFile, convertAsyncFileToDomain, BotAPICommandTypes, BotAPISystemEventTypes, convertChatTypeToDomain, convertClientPlatformToDomain, BotAPIClientPlatforms, UserDevice, UserSender, BotAPIBaseCommandModel } from "@models";

export class SmartAppEvent {
  constructor(
    public bot: BotAccount,
    public smartapp_id: string,
    public data: Record<string, any>,
    public files: File[],
    public chat: Chat,
    public sender: UserSender,
    public rawCommand?: Record<string, any>,
    public ref?: string | null,
    public opts?: Record<string, any> | null,
    public smartapp_api_version?: number | null
  ) {}
}

export class BotAPISmartAppData {
  constructor(
    public ref: string,
    public smartapp_id: string,
    public data: Record<string, any>,
    public opts: Record<string, any>,
    public smartapp_api_version: number
  ) {}
}

export class BotAPISmartAppPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public command_type: BotAPICommandTypes,
    public data: BotAPISmartAppData,
    public metadata: Record<string, any>
  ) {}
}

export class BotAPISmartAppEventContext {
  constructor(
    public host: string,
    public user_huid: string,
    public group_chat_id: string,
    public chat_type: string,
    public user_udid?: string,
    public ad_domain?: string,
    public ad_login?: string,
    public username?: string,
    public is_admin?: boolean,
    public is_creator?: boolean,
    public app_version?: string,
    public platform?: string,
    public platform_package_id?: string,
    public device?: string,
    public device_meta?: Record<string, any>,
    public device_software?: string,
    public manufacturer?: string,
    public locale?: string
  ) {}
}

export class BotAPISmartAppEvent extends BotAPIBaseCommandModel {
  constructor(
    botId: string,
    syncId: string,
    protoVersion: number,
    public payload: BotAPISmartAppPayload,
    public sender: BotAPISmartAppEventContext,
    public async_files: APIAsyncFile[]
  ) {
    super(botId, syncId, protoVersion);
  }

  toDomain(rawCommand: Record<string, any>): SmartAppEvent {
    const platform = this.sender.platform as BotAPIClientPlatforms | undefined;
    const device = new UserDevice(
      this.sender.manufacturer ?? null,
      this.sender.device ?? null,
      this.sender.device_software ?? null,
      undefined,
      undefined,
      undefined,
      platform ? convertClientPlatformToDomain(platform as BotAPIClientPlatforms) : null,
      this.sender.platform_package_id ?? null,
      this.sender.app_version ?? null,
      this.sender.locale ?? null
    );

    const sender = new UserSender(
      this.sender.user_huid,
      this.sender.user_udid,
      this.sender.ad_login,
      this.sender.ad_domain,
      this.sender.username,
      this.sender.is_admin,
      this.sender.is_creator,
      device
    );

    return new SmartAppEvent(
      new BotAccount(this.bot_id, this.sender.host),
      this.payload.data.smartapp_id,
      this.payload.data.data,
      this.async_files.map(convertAsyncFileToDomain),
      new Chat(
        this.sender.group_chat_id,
        convertChatTypeToDomain(this.sender.chat_type)
      ),
      sender,
      rawCommand,
      this.payload.data.ref ?? null,
      this.payload.data.opts ?? null,
      this.payload.data.smartapp_api_version ?? null
    );
  }
} 