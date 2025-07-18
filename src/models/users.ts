import { IsUUID, IsString, IsOptional, IsBoolean, IsEnum, IsEmail, IsArray, IsDate } from "class-validator";
import { SyncSourceTypes, UserKinds, IncomingSyncSourceTypes } from "./enums";
import { Type } from "class-transformer";

export class UserFromSearch {
  @IsUUID()
  huid: string;

  @IsOptional()
  @IsString()
  ad_login: string | null;

  @IsOptional()
  @IsString()
  ad_domain: string | null;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  company: string | null;

  @IsOptional()
  @IsString()
  company_position: string | null;

  @IsOptional()
  @IsString()
  department: string | null;

  @IsArray()
  @IsString({ each: true })
  emails: string[];

  @IsOptional()
  @IsString()
  other_id: string | null;

  @IsEnum(UserKinds)
  user_kind: UserKinds;

  @IsOptional()
  @IsBoolean()
  active: boolean | null = null;

  @IsOptional()
  @IsString()
  description: string | null = null;

  @IsOptional()
  @IsString()
  ip_phone: string | null = null;

  @IsOptional()
  @IsString()
  manager: string | null = null;

  @IsOptional()
  @IsString()
  office: string | null = null;

  @IsOptional()
  @IsString()
  other_ip_phone: string | null = null;

  @IsOptional()
  @IsString()
  other_phone: string | null = null;

  @IsOptional()
  @IsString()
  public_name: string | null = null;

  @IsOptional()
  @IsString()
  cts_id: string | null = null;

  @IsOptional()
  @IsString()
  rts_id: string | null = null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  created_at: Date | null = null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updated_at: Date | null = null;

  constructor(
    huid: string,
    ad_login: string | null,
    ad_domain: string | null,
    username: string,
    company: string | null,
    company_position: string | null,
    department: string | null,
    emails: string[],
    other_id: string | null,
    user_kind: UserKinds,
    active: boolean | null = null,
    description: string | null = null,
    ip_phone: string | null = null,
    manager: string | null = null,
    office: string | null = null,
    other_ip_phone: string | null = null,
    other_phone: string | null = null,
    public_name: string | null = null,
    cts_id: string | null = null,
    rts_id: string | null = null,
    created_at: Date | null = null,
    updated_at: Date | null = null
  ) {
    this.huid = huid;
    this.ad_login = ad_login;
    this.ad_domain = ad_domain;
    this.username = username;
    this.company = company;
    this.company_position = company_position;
    this.department = department;
    this.emails = emails;
    this.other_id = other_id;
    this.user_kind = user_kind;
    this.active = active;
    this.description = description;
    this.ip_phone = ip_phone;
    this.manager = manager;
    this.office = office;
    this.other_ip_phone = other_ip_phone;
    this.other_phone = other_phone;
    this.public_name = public_name;
    this.cts_id = cts_id;
    this.rts_id = rts_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

export class UserFromCSV {
  @IsUUID()
  huid: string;

  @IsString()
  ad_login: string;

  @IsString()
  ad_domain: string;

  @IsString()
  username: string;

  @IsEnum(SyncSourceTypes)
  sync_source: IncomingSyncSourceTypes;

  @IsBoolean()
  active: boolean;

  @IsEnum(UserKinds)
  user_kind: UserKinds;

  @IsOptional()
  @IsEmail()
  email: string | null = null;

  @IsOptional()
  @IsString()
  company: string | null = null;

  @IsOptional()
  @IsString()
  department: string | null = null;

  @IsOptional()
  @IsString()
  position: string | null = null;

  @IsOptional()
  @IsString()
  avatar: string | null = null;

  @IsOptional()
  @IsString()
  avatar_preview: string | null = null;

  @IsOptional()
  @IsString()
  office: string | null = null;

  @IsOptional()
  @IsString()
  manager: string | null = null;

  @IsOptional()
  @IsString()
  manager_huid: string | null = null;

  @IsOptional()
  @IsString()
  description: string | null = null;

  @IsOptional()
  @IsString()
  phone: string | null = null;

  @IsOptional()
  @IsString()
  other_phone: string | null = null;

  @IsOptional()
  @IsString()
  ip_phone: string | null = null;

  @IsOptional()
  @IsString()
  other_ip_phone: string | null = null;

  @IsOptional()
  @IsString()
  personnel_number: string | null = null;

  constructor(
    huid: string,
    ad_login: string,
    ad_domain: string,
    username: string,
    sync_source: IncomingSyncSourceTypes,
    active: boolean,
    user_kind: UserKinds,
    email: string | null = null,
    company: string | null = null,
    department: string | null = null,
    position: string | null = null,
    avatar: string | null = null,
    avatar_preview: string | null = null,
    office: string | null = null,
    manager: string | null = null,
    manager_huid: string | null = null,
    description: string | null = null,
    phone: string | null = null,
    other_phone: string | null = null,
    ip_phone: string | null = null,
    other_ip_phone: string | null = null,
    personnel_number: string | null = null
  ) {
    this.huid = huid;
    this.ad_login = ad_login;
    this.ad_domain = ad_domain;
    this.username = username;
    this.sync_source = sync_source;
    this.active = active;
    this.user_kind = user_kind;
    this.email = email;
    this.company = company;
    this.department = department;
    this.position = position;
    this.avatar = avatar;
    this.avatar_preview = avatar_preview;
    this.office = office;
    this.manager = manager;
    this.manager_huid = manager_huid;
    this.description = description;
    this.phone = phone;
    this.other_phone = other_phone;
    this.ip_phone = ip_phone;
    this.other_ip_phone = other_ip_phone;
    this.personnel_number = personnel_number;
  }
}
