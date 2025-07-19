import { AsyncLocalStorage } from "async_hooks";
import { UUID } from "crypto"; // Или используйте string, если UUID — это строка

import type { Bot } from "./bot"; // путь к определению Bot

// Типы
interface ContextData {
  bot?: Bot;
  botId?: UUID | string;
  chatId?: UUID | string;
}

// Глобальное хранилище контекста
const contextStorage = new AsyncLocalStorage<ContextData>();

// Геттеры
export const botVar = {
  get: () => contextStorage.getStore()?.bot,
  set: (bot: Bot) => {
    const current = contextStorage.getStore() ?? {};
    contextStorage.enterWith({ ...current, bot });
  },
};

export const botIdVar = {
  get: () => contextStorage.getStore()?.botId,
  set: (botId: UUID | string) => {
    const current = contextStorage.getStore() ?? {};
    contextStorage.enterWith({ ...current, botId });
  },
};

export const chatIdVar = {
  get: () => contextStorage.getStore()?.chatId,
  set: (chatId: UUID | string) => {
    const current = contextStorage.getStore() ?? {};
    contextStorage.enterWith({ ...current, chatId });
  },
};

// Вспомогательная функция для запуска кода с контекстом
export function runWithContext<T>(
  context: ContextData,
  fn: () => T
): T {
  return contextStorage.run(context, fn);
}