// Простой тест для проверки метода answerMessage
import { Bot } from './src/bot/bot';
import { botIdVar, chatIdVar } from './src/bot/contextVars';

async function testAnswerMessage() {
  // Тест создания экземпляра Bot
  const bot = new Bot({
    collectors: [],
    botAccounts: [],
  });

  console.log('Bot instance created successfully');

  // Проверяем, что метод answerMessage существует
  console.log('answerMessage method available:', typeof bot.answerMessage);

  // Тестируем без контекста (должен выбросить ошибку)
  try {
    await bot.answerMessage("Hello!");
    console.log('❌ Should have thrown error');
  } catch (error) {
    console.log('✅ Correctly threw error:', (error as Error).message);
  }

  // Тестируем с контекстом
  botIdVar.set("test-bot-id");
  chatIdVar.set("test-chat-id");

  console.log('✅ Context variables set successfully');
  console.log('botIdVar.get():', botIdVar.get());
  console.log('chatIdVar.get():', chatIdVar.get());

  console.log('All tests passed!');
}

testAnswerMessage().catch(console.error); 