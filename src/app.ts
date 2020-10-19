import { ChannelIdentifier } from './ChannelIdentifier';
import { ChannelLinker } from './ChannelLinker';
import config from './config';
import { DiscordChannel } from './DiscordChannel';
import { DiscordClient } from './DiscordClient';
import { GroupMeChannel } from './GroupMeChannel';
import { GroupMeClient } from './GroupMeClient';

let linker : ChannelLinker;

(async ()=>{
    let groupMeClient = new GroupMeClient(config.listenPort, config.groupme.callbackURL);
    let discordClient = await DiscordClient.connect(config.discord.token);


    linker = new ChannelLinker(discordClient, groupMeClient);

    await Promise.all(config.servers.map(async server=>{
        let discordChannelId : ChannelIdentifier<DiscordChannel> = {
            guildId: server.discord.guildId,
            channelId: server.discord.channelId
        };

        let groupMeChannelId : ChannelIdentifier<GroupMeChannel> = {
            botId: server.groupme.botId,
            channelId: server.groupme.groupId
        };

        await linker.link(discordChannelId, groupMeChannelId);
    }));

})().catch(console.error);
