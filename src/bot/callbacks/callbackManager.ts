import { BotXMethodCallback } from "@models";
import { CallbackRepoProto } from "./callbackRepoProto";
import { BotXMethodCallbackNotFoundError } from "../exceptions";
import { CallbackMemoryRepo } from "./callbackMemoryRepo";
import { logger } from "@logger";

interface CallbackAlarm {
  alarmTime: number;
  timeoutId: NodeJS.Timeout;
}

export class CallbackManager {
  private callbackRepo: CallbackRepoProto;
  private callbackAlarms: Map<string, CallbackAlarm> = new Map();

  constructor(callbackRepo: CallbackRepoProto) {
    this.callbackRepo = callbackRepo;
  }

  async createBotxMethodCallback(syncId: string): Promise<void> {
    await this.callbackRepo.createBotxMethodCallback(syncId);
  }

  async setBotxMethodCallbackResult(callback: BotXMethodCallback): Promise<void> {
    await this.callbackRepo.setBotxMethodCallbackResult(callback);
  }

  async waitBotxMethodCallback(syncId: string, timeout: number): Promise<BotXMethodCallback> {
    return await this.callbackRepo.waitBotxMethodCallback(syncId, timeout);
  }

  async popBotxMethodCallback(syncId: string): Promise<BotXMethodCallback> {
    return await this.callbackRepo.popBotxMethodCallback(syncId);
  }

  async stopCallbacksWaiting(): Promise<void> {
    await this.callbackRepo.stopCallbacksWaiting();
  }

  setupCallbackTimeoutAlarm(syncId: string, timeout: number): void {
    const alarmTime = Date.now() + timeout * 1000;
    const timeoutId = setTimeout(async () => {
      this.cancelCallbackTimeoutAlarm(syncId);
      await this.popBotxMethodCallback(syncId);
      logger.error(`Callback \`${syncId}\` wasn't waited`);
    }, timeout * 1000);
    this.callbackAlarms.set(syncId, { alarmTime, timeoutId });
  }

  cancelCallbackTimeoutAlarm(syncId: string, returnRemainingTime = false): number | undefined {
    const alarm = this.callbackAlarms.get(syncId);
    if (!alarm) {
      throw new BotXMethodCallbackNotFoundError(syncId);
    }
    this.callbackAlarms.delete(syncId);
    clearTimeout(alarm.timeoutId);
    if (returnRemainingTime) {
      const timeBeforeAlarm = (alarm.alarmTime - Date.now()) / 1000;
      return timeBeforeAlarm;
    }
    return undefined;
  }
}

// Re-export CallbackMemoryRepo and CallbackRepoProto for compatibility
export { CallbackMemoryRepo };
export { CallbackRepoProto } from "./callbackRepoProto"; 