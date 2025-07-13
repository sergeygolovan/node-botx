import { Missing, Undefined } from "@missing";
import { IncomingFileAttachment, OutgoingAttachment } from "@models";
import { BubbleMarkup, KeyboardMarkup } from "./markup";

export class EditMessage {
  constructor(
    public botId: string,
    public syncId: string,
    public body: Missing<string> = Undefined,
    public metadata: Missing<{ [key: string]: any }> = Undefined,
    public bubbles: Missing<BubbleMarkup> = Undefined,
    public keyboard: Missing<KeyboardMarkup> = Undefined,
    public file: Missing<
      IncomingFileAttachment | OutgoingAttachment
    > = Undefined,
    public markupAutoAdjust: Missing<boolean> = Undefined
  ) {}
}
