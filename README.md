# node-botx

TypeScript библиотека для работы с BotX API - платформой для создания чат-ботов.

## Установка

```bash
npm install node-botx
# или
pnpm add node-botx
# или
yarn add node-botx
```

## Использование

### Основной бот

```typescript
import { Bot, BotAccountWithSecret } from 'node-botx';

const bot = new Bot({
  collectors: [],
  botAccounts: [
    new BotAccountWithSecret(
      'your-bot-id',
      'your-cts-url',
      'your-bot-secret'
    )
  ]
});

// Обработка сообщений
bot.onMessage(async (message) => {
  await bot.sendMessage({
    chatId: message.chatId,
    body: 'Привет!'
  });
});
```

### SmartApp RPC с декораторами

Библиотека поддерживает создание RPC-методов для смартаппов с использованием декораторов, что делает код более читаемым и структурированным:

```typescript
import { 
  Bot, 
  HandlerCollector,
  SmartAppEvent
} from 'node-botx';
import {
  RPCArgsBaseModel,
  RPCRouter,
  SmartAppRPC,
  RPCResultResponse,
  RPCErrorExc,
  RPCError,
  RpcMethod,
  RpcController,
  SmartAppInstance
} from 'node-botx';

// Класс аргументов для RPC метода с валидацией
class SumArgs extends RPCArgsBaseModel {
  constructor(data?: Record<string, any>) {
    super(data);
    this.a = data?.a || 0;
    this.b = data?.b || 0;
  }
  
  a: number;
  b: number;
}

class UserArgs extends RPCArgsBaseModel {
  constructor(data?: Record<string, any>) {
    super(data);
    this.userId = data?.userId || "";
  }
  
  userId: string;
}

// Создаем роутер для RPC методов
const rpcRouter = new RPCRouter();

// Пример класса с декораторами (аналог Python версии)
@RpcController(rpcRouter)
class UserService {
  
  @RpcMethod("get_user_info")
  async getUserInfo(smartapp: SmartAppInstance): Promise<RPCResultResponse<any>> {
    // Имитация получения информации о пользователе
    const userInfo = {
      id: "12345",
      name: "John Doe",
      email: "john@example.com",
      role: "user"
    };

    return new RPCResultResponse(userInfo);
  }

  @RpcMethod("sum")
  async sum(smartapp: SmartAppInstance, args: SumArgs): Promise<RPCResultResponse<number>> {
    const result = args.a + args.b;
    return new RPCResultResponse(result);
  }

  @RpcMethod("multiply")
  async multiply(smartapp: SmartAppInstance, args: SumArgs): Promise<RPCResultResponse<number>> {
    const result = args.a * args.b;
    return new RPCResultResponse(result);
  }

  @RpcMethod("get_user")
  async getUser(smartapp: SmartAppInstance, args: UserArgs): Promise<RPCResultResponse<any>> {
    if (!args.userId) {
      throw new RPCErrorExc(
        new RPCError(
          "User ID is required",
          "USER_ID_REQUIRED",
          { field: "userId" }
        )
      );
    }

    return new RPCResultResponse({ 
      id: args.userId, 
      name: "John Doe",
      email: "john@example.com"
    });
  }
}

// Создаем экземпляр сервиса (автоматически регистрирует все методы)
new UserService();

// Создаем SmartApp RPC менеджер
const smartappRPC = new SmartAppRPC([rpcRouter]);

// Создаем коллектор для обработки событий
const collector = new HandlerCollector();

// Обработчик smartapp событий
collector.smartappEvent(
  async (event: SmartAppEvent, bot: Bot): Promise<void> => {
    await smartappRPC.handleSmartappEvent(event, bot);
  }
);

// Обработчик синхронных smartapp событий
collector.syncSmartappEvent(
  async (event: SmartAppEvent, bot: Bot) => {
    return await smartappRPC.handleSyncSmartappEvent(event, bot);
  }
);

// Создаем бота
const bot = new Bot({
  collectors: [collector],
  botAccounts: [
    new BotAccountWithSecret(
      'your-bot-id',
      'your-cts-url',
      'your-bot-secret'
    )
  ]
});
```

### Особенности SmartApp RPC

- **Декораторы** - использование `@RpcMethod` и `@RpcController` для удобного определения RPC методов
- **Автоматическая регистрация** - все методы автоматически регистрируются при создании экземпляра класса
- **Автоматическая валидация аргументов** - аргументы автоматически валидируются при создании экземпляра класса
- **Поддержка мидлварей** - можно добавлять кастомные мидлвари для обработки запросов
- **Обработка исключений** - встроенная система обработки ошибок с пользовательскими обработчиками
- **Типизация** - полная TypeScript поддержка с дженериками
- **Совместимость с Python** - API полностью совместим с Python версией pybotx-smartapp-rpc

## Основные возможности

- Отправка и получение сообщений
- Работа с файлами и вложениями
- Управление чатами и пользователями
- Поддержка стикеров
- Системные события
- **SmartApp RPC с декораторами** - создание RPC-методов для смартаппов с использованием декораторов
- Автоматическая валидация данных с помощью class-validator
- TypeScript поддержка
- Совместимость с Python pybotx-smartapp-rpc

## Требования

- Node.js 16+
- TypeScript 4.9+

## Лицензия

MIT 