import { Missing, Undefined } from "@missing";
import { IncomingFileAttachment, OutgoingAttachment } from "@models";
import { BubbleMarkup, KeyboardMarkup } from "./markup";

export class ReplyMessage {
  constructor(
    public botId: string,
    public syncId: string,
    public body: string,
    public metadata: Missing<Record<string, any>> = Undefined,
    public bubbles: Missing<BubbleMarkup> = Undefined,
    public keyboard: Missing<KeyboardMarkup> = Undefined,
    public file: Missing<IncomingFileAttachment | OutgoingAttachment> = Undefined,
    public silentResponse: Missing<boolean> = Undefined,
    public markupAutoAdjust: Missing<boolean> = Undefined,
    public stealthMode: Missing<boolean> = Undefined,
    public sendPush: Missing<boolean> = Undefined,
    public ignoreMute: Missing<boolean> = Undefined
  ) {}
}
