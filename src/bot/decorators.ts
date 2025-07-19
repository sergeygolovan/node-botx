import 'reflect-metadata';
import { HandlerCollector } from './handlerCollector';
import { VisibleFunc } from './handler';
import { logger } from '@logger';

// Ключи для метаданных
const METADATA_KEYS = {
  HANDLER_TYPE: 'handler:type',
  COMMAND_NAME: 'handler:command:name',
  COMMAND_VISIBLE: 'handler:command:visible',
  COMMAND_DESCRIPTION: 'handler:command:description',
  HANDLER_METHOD: 'handler:method'
} as const;

// Типы обработчиков
type HandlerType = 'smartapp_event' | 'sync_smartapp_event' | 'command' | 'default_message';

// Декоратор для smartapp event
export function smartappEvent() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(METADATA_KEYS.HANDLER_TYPE, 'smartapp_event', target, propertyKey);
    Reflect.defineMetadata(METADATA_KEYS.HANDLER_METHOD, descriptor.value, target, propertyKey);
  };
}

// Декоратор для sync smartapp event
export function syncSmartappEvent() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(METADATA_KEYS.HANDLER_TYPE, 'sync_smartapp_event', target, propertyKey);
    Reflect.defineMetadata(METADATA_KEYS.HANDLER_METHOD, descriptor.value, target, propertyKey);
  };
}

// Декоратор для команд
export function command(name: string, visible: boolean | VisibleFunc = true, description?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(METADATA_KEYS.HANDLER_TYPE, 'command', target, propertyKey);
    Reflect.defineMetadata(METADATA_KEYS.COMMAND_NAME, name, target, propertyKey);
    Reflect.defineMetadata(METADATA_KEYS.COMMAND_VISIBLE, visible, target, propertyKey);
    Reflect.defineMetadata(METADATA_KEYS.COMMAND_DESCRIPTION, description, target, propertyKey);
    Reflect.defineMetadata(METADATA_KEYS.HANDLER_METHOD, descriptor.value, target, propertyKey);
  };
}

// Декоратор для обработчика по умолчанию
export function defaultMessage() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(METADATA_KEYS.HANDLER_TYPE, 'default_message', target, propertyKey);
    Reflect.defineMetadata(METADATA_KEYS.HANDLER_METHOD, descriptor.value, target, propertyKey);
  };
}

// Функция для регистрации всех обработчиков из класса
export function registerHandlers(instance: any, collector: HandlerCollector): void {
  const prototype = Object.getPrototypeOf(instance);
  
  // Получаем все свойства прототипа
  const propertyNames = Object.getOwnPropertyNames(prototype);
  
  for (const propertyName of propertyNames) {
    const handlerType = Reflect.getMetadata(METADATA_KEYS.HANDLER_TYPE, prototype, propertyName) as HandlerType;
    
    if (!handlerType) continue;
    
    const method = Reflect.getMetadata(METADATA_KEYS.HANDLER_METHOD, prototype, propertyName);
    if (!method) continue;
    
    // Привязываем метод к экземпляру класса
    const boundMethod = method.bind(instance);
    
    switch (handlerType) {
      case 'smartapp_event':
        collector.smartappEvent(boundMethod);
        logger.info(`Registered smartapp event handler: ${propertyName}`);
        break;
        
      case 'sync_smartapp_event':
        collector.syncSmartappEvent(boundMethod);
        logger.info(`Registered sync smartapp event handler: ${propertyName}`);
        break;
        
      case 'command':
        const commandName = Reflect.getMetadata(METADATA_KEYS.COMMAND_NAME, prototype, propertyName);
        const visible = Reflect.getMetadata(METADATA_KEYS.COMMAND_VISIBLE, prototype, propertyName);
        const description = Reflect.getMetadata(METADATA_KEYS.COMMAND_DESCRIPTION, prototype, propertyName);
        
        collector.command(commandName, visible, description)(boundMethod);
        logger.info(`Registered command handler: ${commandName} -> ${propertyName}`);
        break;
        
      case 'default_message':
        collector.defaultMessageHandler(boundMethod);
        logger.info(`Registered default message handler: ${propertyName}`);
        break;
    }
  }
}

// Декоратор класса для автоматической регистрации
export function BotHandlers(collector: HandlerCollector) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    // Сохраняем коллектор в метаданных класса
    Reflect.defineMetadata('collector', collector, constructor);
    
    // Возвращаем модифицированный класс
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        // Регистрируем обработчики после создания экземпляра
        registerHandlers(this, collector);
      }
    };
  };
} 