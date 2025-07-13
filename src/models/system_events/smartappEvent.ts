import { BotAccount, Chat, File, APIAsyncFile, convertAsyncFileToDomain, BotAPICommandTypes, BotAPISystemEventTypes, convertChatTypeToDomain, convertClientPlatformToDomain, BotAPIClientPlatforms, UserDevice, UserSender, BotAPIBaseCommandModel } from "@models";

export class SmartAppEvent {
  constructor(
    public bot: BotAccount,
    public smartappId: string,
    public data: Record<string, any>,
    public files: File[],
    public chat: Chat,
    public sender: UserSender,
    public rawCommand?: Record<string, any>,
    public ref?: string | null,
    public opts?: Record<string, any> | null,
    public smartappApiVersion?: number | null
  ) {}
}

export class BotAPISmartAppData {
  constructor(
    public ref: string,
    public smartappId: string,
    public data: Record<string, any>,
    public opts: Record<string, any>,
    public smartappApiVersion: number
  ) {}
}

export class BotAPISmartAppPayload {
  constructor(
    public body: BotAPISystemEventTypes,
    public commandType: BotAPICommandTypes,
    public data: BotAPISmartAppData,
    public metadata: Record<string, any>
  ) {}
}

export class BotAPISmartAppEventContext {
  constructor(
    public host: string,
    public userHuid: string,
    public groupChatId: string,
    public chatType: string,
    public userUdid?: string,
    public adDomain?: string,
    public adLogin?: string,
    public username?: string,
    public isAdmin?: boolean,
    public isCreator?: boolean,
    public appVersion?: string,
    public platform?: string,
    public platformPackageId?: string,
    public device?: string,
    public deviceMeta?: Record<string, any>,
    public deviceSoftware?: string,
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
    public asyncFiles: APIAsyncFile[]
  ) {
    super(botId, syncId, protoVersion);
  }

  toDomain(rawCommand: Record<string, any>): SmartAppEvent {
    const platform = this.sender.platform as BotAPIClientPlatforms | undefined;
    const device = new UserDevice(
      this.sender.manufacturer ?? null,
      this.sender.device ?? null,
      this.sender.deviceSoftware ?? null,
      undefined,
      undefined,
      undefined,
      platform ? convertClientPlatformToDomain(platform as BotAPIClientPlatforms) : null,
      this.sender.platformPackageId ?? null,
      this.sender.appVersion ?? null,
      this.sender.locale ?? null
    );

    const sender = new UserSender(
      this.sender.userHuid,
      this.sender.userUdid,
      this.sender.adLogin,
      this.sender.adDomain,
      this.sender.username,
      this.sender.isAdmin,
      this.sender.isCreator,
      device
    );

    return new SmartAppEvent(
      new BotAccount(this.bot_id, this.sender.host),
      this.payload.data.smartappId,
      this.payload.data.data,
      this.asyncFiles.map(convertAsyncFileToDomain),
      new Chat(
        this.sender.groupChatId,
        convertChatTypeToDomain(this.sender.chatType)
      ),
      sender,
      rawCommand,
      this.payload.data.ref ?? null,
      this.payload.data.opts ?? null,
      this.payload.data.smartappApiVersion ?? null
    );
  }
} 