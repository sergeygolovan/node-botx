import { BaseClientError } from "./base";

export class StickerPackOrStickerNotFoundError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "StickerPackOrStickerNotFoundError";
  }
}

export class InvalidEmojiError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidEmojiError";
  }
}

export class InvalidImageError extends BaseClientError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidImageError";
  }
} 