import { BotAPIMethodFailedCallback } from "@models";
import { BaseClientError } from "./base";

export class BotXMethodFailedCallbackReceivedError extends BaseClientError {
  constructor(public callback: BotAPIMethodFailedCallback) {
    const exc = BaseClientError.fromCallback(callback);
    super(exc.message);
    this.name = "BotXMethodFailedCallbackReceivedError";
  }
}

export class CallbackNotReceivedError extends Error {
  constructor(public syncId: string) {
    const message = `Callback for sync_id \`${syncId}\` hasn't been received`;
    super(message);
    this.name = "CallbackNotReceivedError";
  }
} 