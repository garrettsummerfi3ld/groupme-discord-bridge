import { ChannelIdentifier } from './channel/ChannelIdentifier';
import { ChannelLinker } from './bridge/ChannelLinker';
import config from './config';
import { DiscordChannel } from './channel/DiscordChannel';
import { DiscordClient } from './client/DiscordClient';
import { GroupMeChannel } from './channel/GroupMeChannel';
import { GroupMeClient } from './client/GroupMeClient';

let linker : ChannelLinker;

(async ()=>{
    console.log("Starting");
    let groupMeClient = new GroupMeClient(config.listenPort, config.groupme.callbackURL);
    let discordClient = await DiscordClient.connect(config.discord.token);


    linker = new ChannelLinker(discordClient, groupMeClient);

    await Promise.all(config.bridges.map(async server=>{
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
