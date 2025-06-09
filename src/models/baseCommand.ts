import { z } from "zod";
import { BOT_API_VERSION } from "../constants";
import { BotAccount } from "./botAccount";
import {
    APIChatTypes,
    BotAPIClientPlatforms,
    BotAPICommandTypes,
    BotAPISystemEventTypes,
} from "./enums";


export const BotAPICommandPayloadSchema = z.object({
  body: z.string(),
  command_type: z.literal(BotAPICommandTypes.USER),
  data: z.record(z.any()),
  metadata: z.record(z.any()),
});
export type BotAPICommandPayload = z.infer<typeof BotAPICommandPayloadSchema>;


export const BotAPIDeviceMetaSchema = z.object({
  pushes: z.boolean().optional(),
  timezone: z.string().optional(),
  permissions: z.record(z.any()).optional(),
});
export type BotAPIDeviceMeta = z.infer<typeof BotAPIDeviceMetaSchema>;


export const BaseBotAPIContextSchema = z.object({
  host: z.string(),
});
export type BaseBotAPIContext = z.infer<typeof BaseBotAPIContextSchema>;


export const BotAPIUserContextSchema = BaseBotAPIContextSchema.extend({
  user_huid: z.string().uuid(),
  user_udid: z.string().uuid().optional(),
  ad_domain: z.string().optional(),
  ad_login: z.string().optional(),
  username: z.string().optional(),
  is_admin: z.boolean().optional(),
  is_creator: z.boolean().optional(),
});
export type BotAPIUserContext = z.infer<typeof BotAPIUserContextSchema>;

export const BotAPIChatContextSchema = BaseBotAPIContextSchema.extend({
  group_chat_id: z.string().uuid(),
  chat_type: z.union([z.nativeEnum(APIChatTypes), z.string()]),
});
export type BotAPIChatContext = z.infer<typeof BotAPIChatContextSchema>;

export const BotAPIDeviceContextSchema = BaseBotAPIContextSchema.extend({
  app_version: z.string().optional(),
  platform: z.nativeEnum(BotAPIClientPlatforms).optional(),
  platform_package_id: z.string().optional(),
  device: z.string().optional(),
  device_meta: BotAPIDeviceMetaSchema.optional(),
  device_software: z.string().optional(),
  manufacturer: z.string().optional(),
  locale: z.string().optional(),
});
export type BotAPIDeviceContext = z.infer<typeof BotAPIDeviceContextSchema>;

export const BotAPIBaseCommandSchema = z.object({
  bot_id: z.string().uuid(),
  sync_id: z.string().uuid(),
  proto_version: z.number().refine((v) => v === BOT_API_VERSION, {
    message: "Unsupported Bot API version",
  }),
});
export type BotAPIBaseCommand = z.infer<typeof BotAPIBaseCommandSchema>;

export const BotAPIBaseSystemEventPayloadSchema = z.object({
  command_type: z.literal(BotAPICommandTypes.SYSTEM),
  body: z
    .string()
    .refine(
      (val) => Object.values(BotAPISystemEventTypes).includes(val as any),
      {
        message: "Unknown system event",
      }
    ),
});
export type BotAPIBaseSystemEventPayload = z.infer<
  typeof BotAPIBaseSystemEventPayloadSchema
>;

export interface BotCommandBase {
  bot: BotAccount;
  raw_command?: Record<string, any>;
}
