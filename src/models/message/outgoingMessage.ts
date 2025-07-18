import { Missing, Undefined } from "@missing";
import { IncomingFileAttachment, OutgoingAttachment } from "@models";
import { BubbleMarkup, KeyboardMarkup } from "./markup";

export class OutgoingMessage {
  constructor(
    public botId: string,
    public chatId: string,
    public body: string,
    public metadata: Missing<Record<string, any>> = Undefined,
    public bubbles: Missing<BubbleMarkup> = Undefined,
    public keyboard: Missing<KeyboardMarkup> = Undefined,
    public file: Missing<IncomingFileAttachment | OutgoingAttachment> = Undefined,
    public silentResponse: Missing<boolean> = Undefined,
    public markupAutoAdjust: Missing<boolean> = Undefined,
    public recipients: Missing<string[]> = Undefined,
    public stealthMode: Missing<boolean> = Undefined,
    public sendPush: Missing<boolean> = Undefined,
    public ignoreMute: Missing<boolean> = Undefined
  ) {}
}

export interface AnswerMessageOptions {
  metadata: Missing<Record<string, unknown>>;
  bubbles: Missing<BubbleMarkup>;
  keyboard: Missing<KeyboardMarkup>;
  file: Missing<IncomingFileAttachment | OutgoingAttachment>;
  recipients: Missing<string[]>; // UUID[]
  silentResponse: Missing<boolean>;
  markupAutoAdjust: Missing<boolean>;
  stealthMode: Missing<boolean>;
  sendPush: Missing<boolean>;
  ignoreMute: Missing<boolean>;
  waitCallback: Missing<boolean>;
  callbackTimeout: Missing<number>;
} 