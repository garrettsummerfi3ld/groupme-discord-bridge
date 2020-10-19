import { DiscordChannel } from './DiscordChannel';
import { GenericChannel } from './MessagePayload';


export type ChannelIdentifier<T extends GenericChannel> = T extends DiscordChannel ? {
    guildId: string;
    channelId: string;
} : {
    botId: string;
    channelId: string;
};
