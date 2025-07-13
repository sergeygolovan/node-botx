import { UserFromCSV, VerifiedPayloadBaseModel } from "@models";
import { convertSyncSourceTypeToDomain, convertUserKindToDomain } from "@models/enums";

export class BotXAPIUserFromCSVResult extends VerifiedPayloadBaseModel {
  huid!: string;
  ad_login!: string;
  ad_domain!: string;
  email?: string;
  name!: string;
  sync_source!: string;
  active!: boolean;
  user_kind!: string;
  company?: string;
  department?: string;
  position?: string;
  avatar?: string;
  avatar_preview?: string;
  office?: string;
  manager?: string;
  manager_huid?: string;
  description?: string;
  phone?: string;
  other_phone?: string;
  ip_phone?: string;
  other_ip_phone?: string;
  personnel_number?: string;

  private static emptyToNull(value?: string): string | null {
    if (value === undefined || value === "") return null;
    return value;
  }

  toDomain(): UserFromCSV {
    return new UserFromCSV(
      this.huid,
      this.ad_login,
      this.ad_domain,
      this.name,
      convertSyncSourceTypeToDomain(this.sync_source),
      this.active,
      convertUserKindToDomain(this.user_kind),
      BotXAPIUserFromCSVResult.emptyToNull(this.email),
      BotXAPIUserFromCSVResult.emptyToNull(this.company),
      BotXAPIUserFromCSVResult.emptyToNull(this.department),
      BotXAPIUserFromCSVResult.emptyToNull(this.position),
      BotXAPIUserFromCSVResult.emptyToNull(this.avatar),
      BotXAPIUserFromCSVResult.emptyToNull(this.avatar_preview),
      BotXAPIUserFromCSVResult.emptyToNull(this.office),
      BotXAPIUserFromCSVResult.emptyToNull(this.manager),
      BotXAPIUserFromCSVResult.emptyToNull(this.manager_huid),
      BotXAPIUserFromCSVResult.emptyToNull(this.description),
      BotXAPIUserFromCSVResult.emptyToNull(this.phone),
      BotXAPIUserFromCSVResult.emptyToNull(this.other_phone),
      BotXAPIUserFromCSVResult.emptyToNull(this.ip_phone),
      BotXAPIUserFromCSVResult.emptyToNull(this.other_ip_phone),
      BotXAPIUserFromCSVResult.emptyToNull(this.personnel_number),
    );
  }
}

export class BotXAPIUserFromCSVResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: BotXAPIUserFromCSVResult;

  toDomain(): UserFromCSV {
    return this.result.toDomain();
  }
} 