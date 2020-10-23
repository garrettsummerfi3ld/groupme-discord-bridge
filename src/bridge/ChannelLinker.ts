import { ChannelIdentifier } from '../channel/ChannelIdentifier';
import { DiscordChannel } from '../channel/DiscordChannel';
import { GroupMeChannel } from '../channel/GroupMeChannel';
import { GroupMeClient } from '../client/GroupMeClient';
import {DiscordClient} from '../client/DiscordClient';
import { Bridge } from './Bridge';

/** Creates bridges. It requires a groupme + discord client to listen to incoming messages */
export class ChannelLinker {
    private discordClient: DiscordClient;
    private groupMeClient: GroupMeClient;
    private bridges : Bridge[];

    public constructor(discordClient: DiscordClient, groupMeClient: GroupMeClient) {
        this.bridges = [];
        this.discordClient = discordClient;
        this.groupMeClient = groupMeClient;
    }

    /** Create a new bridge between a discord channel and a GM group */
    public async link(discordId: ChannelIdentifier<DiscordChannel>, groupMeId: ChannelIdentifier<GroupMeChannel>) {
        let discordChannel = await this.discordClient.getChannel(discordId);
        let groupMeChannel = await this.groupMeClient.getChannel(groupMeId);

        let bridge = new Bridge(discordChannel, groupMeChannel);
        this.bridges.push(bridge);
    }
}
