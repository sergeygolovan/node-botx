import { Bot } from "@bot";
import { SmartAppEvent, File } from "@models";
import { Missing, Undefined } from "@missing";

export class SmartAppInstance {
  public bot: Bot;
  public event?: SmartAppEvent;
  public botId: string;
  public chatId: string;
  public state: Record<string, any> = {};

  constructor(
    bot: Bot,
    botId: string,
    chatId: string,
    event?: SmartAppEvent
  ) {
    this.bot = bot;
    this.botId = botId;
    this.chatId = chatId;
    this.event = event;
  }

  async sendEvent(
    rpcResult: any,
    files?: File[],
    encrypted: boolean = true
  ): Promise<void> {
    await this.bot.sendSmartappEvent({
      botId: this.botId,
      chatId: this.chatId,
      data: {
        status: "ok",
        type: "smartapp_rpc",
        result: rpcResult,
      },
      files: files || [],
      encrypted: encrypted,
      ref: undefined,
      opts: Undefined
    });
  }

  async sendPush(counter: number, body: Missing<string> = Undefined): Promise<void> {
    await this.bot.sendSmartappNotification({
      botId: this.botId,
      chatId: this.chatId,
      smartappCounter: counter,
      body: body,
      opts: Undefined,
      meta: Undefined
    });
  }

  async sendCustomPush(
    title: string,
    body: string,
    meta: Missing<Record<string, any>> = Undefined,
    waitCallback: boolean = true,
    callbackTimeout?: number
  ): Promise<string> {
    return this.bot.sendSmartappCustomNotification({
      botId: this.botId,
      groupChatId: this.chatId,
      title: title,
      body: body,
      meta: meta,
      waitCallback: waitCallback,
      callbackTimeout: callbackTimeout
    });
  }
} 