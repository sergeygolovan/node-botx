import { BOT_API_VERSION } from "../../constants";

export class UnsupportedBotAPIVersionError extends Error {
  public version: number;
  constructor(version: number) {
    super(`Unsupported Bot API version: \`${version}\`, expected \`${BOT_API_VERSION}\``);
    this.version = version;
    this.name = "UnsupportedBotAPIVersionError";
  }
}

export class UnknownSystemEventError extends Error {
  public typeName: string;
  constructor(typeName: string) {
    super(`Unknown system event: \`${typeName}\``);
    this.typeName = typeName;
    this.name = "UnknownSystemEventError";
  }
} 