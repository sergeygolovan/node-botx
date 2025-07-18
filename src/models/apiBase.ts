// utils/payloadBaseModel.ts
import { isPlainObject } from "lodash";
import { Undefined } from "../missing";

function removeUndefined(originObj: unknown): unknown {
  if (Array.isArray(originObj)) {
    const newList = [];
    for (const value of originObj) {
      if (value === Undefined) continue;
      if (Array.isArray(value) || isPlainObject(value)) {
        const newValue = removeUndefined(value);

        if (
          newValue ||
          (Array.isArray(newValue) && newValue.length === value.length)
        ) {
          newList.push(newValue);
        }
      } else {
        newList.push(value);
      }
    }
    return newList;
  } else if (isPlainObject(originObj)) {
    const newDict: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(originObj as Record<string, unknown>)) {
      if (value === Undefined) continue;
      if (Array.isArray(value) || isPlainObject(value)) {
        const newValue = removeUndefined(value);

        if (
          newValue ||
          (Array.isArray(newValue) &&
            Array.isArray(value) &&
            newValue.length === value.length)
        ) {
          newDict[key] = newValue;
        }
      } else {
        newDict[key] = value;
      }
    }
    return newDict;
  }

  throw new Error("NotImplementedError");
}

export abstract class PayloadBaseModel {
  abstract toObject(): Record<string, unknown>;

  // Аналог Python json() метода
  json(): string {
    const cleanObj = removeUndefined(this.toObject());
    return JSON.stringify(cleanObj, null, 0);
  }

  // Аналог Python jsonable_dict() метода
  jsonableDict(): Record<string, unknown> {
    return JSON.parse(this.json());
  }

  // Для обратной совместимости
  toJSON(): string {
    return this.json();
  }
}

export class VerifiedPayloadBaseModel extends PayloadBaseModel {
  constructor(data: Record<string, unknown> = {}) {
    super();
    // Копируем все поля из data в this, как в Python версии
    Object.assign(this, data);
  }

  toObject(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this)) {
      // Исключаем служебные поля
      if (key !== 'constructor' && typeof value !== 'function' && !key.startsWith('_')) {
        result[key] = value;
      }
    }
    return result;
  }
}

export class UnverifiedPayloadBaseModel extends PayloadBaseModel {
  private _fieldsSet?: Set<string>;

  constructor(data: Record<string, unknown> = {}, fieldsSet?: Set<string>) {
    super();
    // Копируем все поля из data в this, как в Python версии
    Object.assign(this, data);
    this._fieldsSet = fieldsSet;
  }

  toObject(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this)) {
      // Исключаем служебные поля
      if (key !== 'constructor' && typeof value !== 'function' && !key.startsWith('_')) {
        result[key] = value;
      }
    }
    return result;
  }

  // Аналог Python fields_set
  get fieldsSet(): Set<string> | undefined {
    return this._fieldsSet;
  }
}
