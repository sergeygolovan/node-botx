import { MentionTypes } from "../enums";

export function buildEmbedMention(
  mentionType: MentionTypes,
  entityId?: string,
  name?: string
): string {
  const id = entityId ?? "";
  const safeName = name ?? "";
  return `<embed_mention>${mentionType}:${id}:${safeName}</embed_mention>`;
}

interface BaseTargetMention {
  entityId: string;
  name?: string;
  toString(): string;
}

export class MentionUser implements BaseTargetMention {
  readonly type = MentionTypes.USER;
  constructor(public entityId: string, public name?: string) {}
  toString() {
    return buildEmbedMention(this.type, this.entityId, this.name);
  }
}

export class MentionContact implements BaseTargetMention {
  readonly type = MentionTypes.CONTACT;
  constructor(public entityId: string, public name?: string) {}
  toString() {
    return buildEmbedMention(this.type, this.entityId, this.name);
  }
}

export class MentionChat implements BaseTargetMention {
  readonly type = MentionTypes.CHAT;
  constructor(public entityId: string, public name?: string) {}
  toString() {
    return buildEmbedMention(this.type, this.entityId, this.name);
  }
}

export class MentionChannel implements BaseTargetMention {
  readonly type = MentionTypes.CHANNEL;
  constructor(public entityId: string, public name?: string) {}
  toString() {
    return buildEmbedMention(this.type, this.entityId, this.name);
  }
}

export class MentionAll {
  readonly type = MentionTypes.ALL;
  toString() {
    return buildEmbedMention(this.type);
  }
}

export type Mention =
  | MentionUser
  | MentionContact
  | MentionChat
  | MentionChannel
  | MentionAll;

export class MentionBuilder {
  static user(entityId: string, name?: string): MentionUser {
    return new MentionUser(entityId, name);
  }

  static contact(entityId: string, name?: string): MentionContact {
    return new MentionContact(entityId, name);
  }

  static chat(entityId: string, name?: string): MentionChat {
    return new MentionChat(entityId, name);
  }

  static channel(entityId: string, name?: string): MentionChannel {
    return new MentionChannel(entityId, name);
  }

  static all(): MentionAll {
    return new MentionAll();
  }
}

export class MentionList extends Array<Mention> {
    get users(): MentionUser[] {
        return this.filter((m): m is MentionUser => m instanceof MentionUser);
    }

    get contacts(): MentionContact[] {
        return this.filter((m): m is MentionContact => m instanceof MentionContact);
    }

    get chats(): MentionChat[] {
        return this.filter((m): m is MentionChat => m instanceof MentionChat);
    }

    get channels(): MentionChannel[] {
        return this.filter((m): m is MentionChannel => m instanceof MentionChannel);
    }

    get allUsersMentioned(): boolean {
        return this.some((m) => m instanceof MentionAll);
    }
}

export class BotAPINestedPersonalMentionData {
    constructor(
        public user_huid: string,
        public name: string,
        public conn_type: string
    ) {}
}

export class BotAPINestedGroupMentionData {
    constructor(
        public group_chat_id: string,
        public name: string
    ) {}
}

export type BotAPINestedMentionData =
    | BotAPINestedPersonalMentionData
    | BotAPINestedGroupMentionData;
