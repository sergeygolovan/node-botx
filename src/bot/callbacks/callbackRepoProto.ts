import type { BotXMethodCallback } from "../../models/methodCallbacks";

export interface CallbackRepoProto {
  createBotxMethodCallback(syncId: string): Promise<void>;
  setBotxMethodCallbackResult(callback: BotXMethodCallback): Promise<void>;
  waitBotxMethodCallback(syncId: string, timeout: number): Promise<BotXMethodCallback>;
  popBotxMethodCallback(syncId: string): Promise<BotXMethodCallback>;
  stopCallbacksWaiting(): Promise<void>;
} 