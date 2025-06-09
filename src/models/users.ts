import { IncomingSyncSourceTypes, UserKinds } from "./enums";

export class UserFromSearch {
  constructor(
    public huid: string,
    public adLogin: string | null,
    public adDomain: string | null,
    public username: string,
    public company: string | null,
    public companyPosition: string | null,
    public department: string | null,
    public emails: string[],
    public otherId: string | null,
    public userKind: UserKinds,
    public active: boolean | null = null,
    public description: string | null = null,
    public ipPhone: string | null = null,
    public manager: string | null = null,
    public office: string | null = null,
    public otherIpPhone: string | null = null,
    public otherPhone: string | null = null,
    public publicName: string | null = null,
    public ctsId: string | null = null,
    public rtsId: string | null = null,
    public createdAt: Date | null = null,
    public updatedAt: Date | null = null
  ) {}
}

export class UserFromCSV {
  constructor(
    public huid: string,
    public adLogin: string,
    public adDomain: string,
    public username: string,
    public syncSource: IncomingSyncSourceTypes,
    public active: boolean,
    public userKind: UserKinds,
    public email: string | null = null,
    public company: string | null = null,
    public department: string | null = null,
    public position: string | null = null,
    public avatar: string | null = null,
    public avatarPreview: string | null = null,
    public office: string | null = null,
    public manager: string | null = null,
    public managerHuid: string | null = null,
    public description: string | null = null,
    public phone: string | null = null,
    public otherPhone: string | null = null,
    public ipPhone: string | null = null,
    public otherIpPhone: string | null = null,
    public personnelNumber: string | null = null
  ) {}
}
