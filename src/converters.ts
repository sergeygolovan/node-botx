import { parseBotAPICommand as parseBotAPICommandFromParsers } from "./models/parsers";
import type { BotAPICommand } from "./models/commands";
import { convertChatTypeFromDomain } from "./models/enums";

export function getBotIdFromRequest(rawBotCommand: Record<string, any>): string {
    if ('bot_id' in rawBotCommand) {
        return rawBotCommand['bot_id'];
    }
    if ('from' in rawBotCommand && 'bot_id' in rawBotCommand['from']) {
        return rawBotCommand['from']['bot_id'];
    }
    if ('recipient' in rawBotCommand && 'bot_id' in rawBotCommand['recipient']) {
        return rawBotCommand['recipient']['bot_id'];
    }
    throw new Error("Can't find bot_id in request");
}

export function parseBotAPICommand(rawBotCommand: Record<string, any>): BotAPICommand {
    return parseBotAPICommandFromParsers(rawBotCommand);
}

// Re-export convertChatTypeFromDomain for compatibility
export { convertChatTypeFromDomain };

/**
 * Utility functions for type conversions.
 * Equivalent to Python's converters.py
 */

/**
 * Converts optional sequence to array.
 * Equivalent to Python's optional_sequence_to_list function.
 * 
 * @param optionalSequence - Optional sequence that can be null, undefined, or empty
 * @returns Array of items or empty array if input is falsy
 */
export function optionalSequenceToList<TItem>(
  optionalSequence?: readonly TItem[] | null
): TItem[] {
  return optionalSequence ? [...optionalSequence] : [];
}
