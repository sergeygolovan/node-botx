import { URL } from "url";

export class BotAccount {
  id: string; // UUID как строка
  host?: string | null;

  constructor(id: string, host?: string | null) {
    this.id = id;
    this.host = host ?? null;
  }
}

export class BotAccountWithSecret {
  readonly id: string;
  readonly ctsUrl: string;
  readonly secretKey: string;

  private _host?: string;

  constructor(id: string, ctsUrl: string, secretKey: string) {
    this.id = id;
    this.ctsUrl = ctsUrl;
    this.secretKey = secretKey;
  }

  get host(): string {
    if (this._host) {
      return this._host;
    }

    try {
      const url = new URL(this.ctsUrl);
      if (!url.hostname) {
        throw new Error("Could not parse host from ctsUrl.");
      }
      this._host = url.hostname;
      return this._host;
    } catch {
      throw new Error("Could not parse host from ctsUrl.");
    }
  }
}
