export class SmartApp {
  constructor(
    public appId: string,
    public enabled: boolean,
    public id: string,
    public name: string,
    public avatar?: string,
    public avatarPreview?: string
  ) {}
}
