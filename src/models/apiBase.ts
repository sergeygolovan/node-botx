// utils/payloadBaseModel.ts
import { isPlainObject } from "lodash";
import { Undefined } from "../missing";

function removeUndefined(originObj: any): any {
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
    const newDict: Record<string, any> = {};
    for (const [key, value] of Object.entries(originObj)) {
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
  abstract toObject(): Record<string, any>;

  toJSON(): string {
    const cleanObj = removeUndefined(this.toObject());
    return JSON.stringify(cleanObj);
  }

  jsonableDict(): Record<string, any> {
    return JSON.parse(this.toJSON());
  }
}

export class VerifiedPayloadBaseModel extends PayloadBaseModel {
  // This can be extended with validation logic if needed
  toObject(): Record<string, any> {
    throw new Error("Method not implemented.");
  }
}

export class UnverifiedPayloadBaseModel extends PayloadBaseModel {
  private data: Record<string, any>;

  constructor(data: Record<string, any>, fieldsSet?: Set<string>) {
    super();
    this.data = data;
  }

  toObject(): Record<string, any> {
    return this.data;
  }
}
