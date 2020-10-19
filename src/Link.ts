import { GroupMeChannel } from "./GroupMeChannel";
import { DiscordChannel } from './DiscordChannel';
import { MessagePayload } from './MessagePayload';

export class Link {
    private discordChannel: DiscordChannel;
    private groupMeChannel: GroupMeChannel;

    constructor(discordChannel: DiscordChannel, groupMe: GroupMeChannel) {
        this.discordChannel = discordChannel;
        this.groupMeChannel = groupMe;

        this.groupMeMessageReceived = this.groupMeMessageReceived.bind(this);
        this.groupMeChannel.setOnReceiveListener(this.groupMeMessageReceived);

        this.discordMessageReceived = this.discordMessageReceived.bind(this);
        this.discordChannel.setOnReceiveListener(this.discordMessageReceived);
    }

    async discordMessageReceived(message: MessagePayload) {
        this.groupMeChannel.sendMessage(message);
    }

    async groupMeMessageReceived(message: MessagePayload) {
        this.discordChannel.sendMessage(message);
    }
};
