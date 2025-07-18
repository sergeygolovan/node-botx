import { BotXMethodCallback } from "@models";
import { CallbackRepoProto } from "./callbackRepoProto";
import { BotShuttingDownError, BotXMethodCallbackNotFoundError } from "../exceptions";
// TODO: реализовать CallbackNotReceivedError

interface CallbackFuture {
  promise: Promise<BotXMethodCallback>;
  resolve: (value: BotXMethodCallback) => void;
  reject: (reason?: any) => void;
}

export class CallbackMemoryRepo implements CallbackRepoProto {
  private callbackFutures: Map<string, CallbackFuture> = new Map();

  async createBotxMethodCallback(syncId: string): Promise<void> {
    if (this.callbackFutures.has(syncId)) return;
    let resolve!: (value: BotXMethodCallback) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<BotXMethodCallback>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.callbackFutures.set(syncId, { promise, resolve, reject });
  }

  async setBotxMethodCallbackResult(callback: BotXMethodCallback): Promise<void> {
    const syncId = callback.sync_id;
    const future = this.getBotxMethodCallback(syncId);
    future.resolve(callback);
  }

  async waitBotxMethodCallback(syncId: string, timeout: number): Promise<BotXMethodCallback> {
    const future = this.getBotxMethodCallback(syncId);
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<BotXMethodCallback>((_, rej) => {
      timeoutId = setTimeout(() => {
        this.callbackFutures.delete(syncId);
        // TODO: заменить на CallbackNotReceivedError
        rej(new Error(`Callback not received for syncId: ${syncId}`));
      }, timeout * 1000);
    });
    return Promise.race([
      future.promise.then((result) => {
        clearTimeout(timeoutId);
        return result;
      }),
      timeoutPromise,
    ]);
  }

  async popBotxMethodCallback(syncId: string): Promise<BotXMethodCallback> {
    const future = this.callbackFutures.get(syncId);
    if (!future) {
      throw new BotXMethodCallbackNotFoundError(syncId);
    }
    this.callbackFutures.delete(syncId);
    return future.promise;
  }

  async stopCallbacksWaiting(): Promise<void> {
    for (const [syncId, future] of this.callbackFutures.entries()) {
      future.reject(
        new BotShuttingDownError(
          `Callback with sync_id \`${syncId}\``
        )
      );
    }
    this.callbackFutures.clear();
  }

  private getBotxMethodCallback(syncId: string): CallbackFuture {
    const future = this.callbackFutures.get(syncId);
    if (!future) {
      throw new BotXMethodCallbackNotFoundError(syncId);
    }
    return future;
  }
} 