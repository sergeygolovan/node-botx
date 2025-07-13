import { BaseClientError } from "./base";

export class StickerPackOrStickerNotFoundError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "StickerPackOrStickerNotFoundError";
  }
} 