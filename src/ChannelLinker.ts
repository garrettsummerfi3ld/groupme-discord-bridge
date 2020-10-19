import { ChannelIdentifier } from './ChannelIdentifier';
import { DiscordChannel } from './DiscordChannel';
import { DiscordClient } from './DiscordClient';
import { GroupMeChannel } from './GroupMeChannel';
import { GroupMeClient } from './GroupMeClient';
import { Link } from './Link';

export class ChannelLinker {
    private discordClient: DiscordClient;
    private groupMeClient: GroupMeClient;
    private links : Link[];

    public constructor(discordClient: DiscordClient, groupMeClient: GroupMeClient) {
        this.links = [];
        this.discordClient = discordClient;
        this.groupMeClient = groupMeClient;
    }

    public async link(discordId: ChannelIdentifier<DiscordChannel>, groupMeId: ChannelIdentifier<GroupMeChannel>) {
        let discordChannel = await this.discordClient.getChannel(discordId);
        let groupMeChannel = await this.groupMeClient.getChannel(groupMeId);

        let link = new Link(discordChannel, groupMeChannel);
        this.links.push(link);
    }
}
