import { URL } from "url";
import { IsString, IsOptional, IsUrl, IsUUID } from "class-validator";

export class BotAccount {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  host?: string | null;

  constructor(id: string, host?: string | null) {
    this.id = id;
    this.host = host ?? null;
  }
}

export class BotAccountWithSecret {
  @IsUUID()
  readonly id: string;

  @IsUrl()
  readonly cts_url: string;

  @IsString()
  readonly secret_key: string;

  private _host?: string;

  constructor(id: string, cts_url: string, secret_key: string) {
    this.id = id;
    this.cts_url = cts_url;
    this.secret_key = secret_key;
  }

  get host(): string {
    if (this._host) {
      return this._host;
    }

    try {
      const url = new URL(this.cts_url);
      if (!url.hostname) {
        throw new Error("Could not parse host from cts_url.");
      }
      this._host = url.hostname;
      return this._host;
    } catch {
      throw new Error("Could not parse host from cts_url.");
    }
  }
}
