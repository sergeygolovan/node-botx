import { Bot } from "./bot";

export async function lifespanWrapper(bot: Bot, fn: (bot: Bot) => Promise<void>): Promise<void> {
  await bot.startup();
  try {
    await fn(bot);
  } finally {
    await bot.shutdown();
  }
} 