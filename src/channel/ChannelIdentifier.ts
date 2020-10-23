import { DiscordChannel } from './DiscordChannel';
import { GenericChannel } from "./GenericChannel";


// used to access a dc channel or gm group
export type ChannelIdentifier<T extends GenericChannel> = T extends DiscordChannel ?
{
    guildId: string;        // for discord
    channelId: string;      // channels
} : {
    botId: string;          // for groupme
    channelId: string;      // groups
};
