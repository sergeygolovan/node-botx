import { UserFromSearch, VerifiedPayloadBaseModel } from "@models";
import { convertUserKindToDomain } from "@models/enums";

export class BotXAPISearchUserResult extends VerifiedPayloadBaseModel {
  user_huid!: string;
  ad_login?: string;
  ad_domain?: string;
  name!: string;
  company?: string;
  company_position?: string;
  department?: string;
  emails!: string[];
  other_id?: string;
  user_kind!: string;
  active?: boolean;
  description?: string;
  ip_phone?: string;
  manager?: string;
  office?: string;
  other_ip_phone?: string;
  other_phone?: string;
  public_name?: string;
  cts_id?: string;
  rts_id?: string;
  created_at?: string;
  updated_at?: string;
}

export class BotXAPISearchUserResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: BotXAPISearchUserResult;

  toDomain(): UserFromSearch {
    return new UserFromSearch(
      this.result.user_huid,
      this.result.ad_login || null,
      this.result.ad_domain || null,
      this.result.name,
      this.result.company || null,
      this.result.company_position || null,
      this.result.department || null,
      this.result.emails,
      this.result.other_id || null,
      convertUserKindToDomain(this.result.user_kind),
      this.result.active === undefined ? null : Boolean(this.result.active),
      this.result.description || null,
      this.result.ip_phone || null,
      this.result.manager || null,
      this.result.office || null,
      this.result.other_ip_phone || null,
      this.result.other_phone || null,
      this.result.public_name || null,
      this.result.cts_id || null,
      this.result.rts_id || null,
      this.result.created_at ? new Date(this.result.created_at) : null,
      this.result.updated_at ? new Date(this.result.updated_at) : null
    );
  }
}

export class BotXAPISearchUserByEmailsResponsePayload extends VerifiedPayloadBaseModel {
  status!: "ok";
  result!: BotXAPISearchUserResult[];

  toDomain(): UserFromSearch[] {
    return this.result.map(user => new UserFromSearch(
      user.user_huid,
      user.ad_login || null,
      user.ad_domain || null,
      user.name,
      user.company || null,
      user.company_position || null,
      user.department || null,
      user.emails,
      user.other_id || null,
      convertUserKindToDomain(user.user_kind),
      user.active === undefined ? null : Boolean(user.active),
      user.description || null,
      user.ip_phone || null,
      user.manager || null,
      user.office || null,
      user.other_ip_phone || null,
      user.other_phone || null,
      user.public_name || null,
      user.cts_id || null,
      user.rts_id || null,
      user.created_at ? new Date(user.created_at) : null,
      user.updated_at ? new Date(user.updated_at) : null
    ));
  }
} 