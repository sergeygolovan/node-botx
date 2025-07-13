export class BotsListItem {
  constructor(
    public id: string, // UUID
    public name: string,
    public description: string,
    public avatar: string | null,
    public enabled: boolean
  ) {}
}
