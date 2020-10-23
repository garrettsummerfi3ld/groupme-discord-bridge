import { GroupMeChannel } from "../channel/GroupMeChannel";
import { DiscordChannel } from '../channel/DiscordChannel';
import { MessagePayload } from '../channel/MessagePayload';

/** Responsible for linking together a single discord channel with a single groupme group */
export class Bridge {
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
        // when we read a message from discord, send it to the groupme group
        this.groupMeChannel.sendMessage(message);
    }

    async groupMeMessageReceived(message: MessagePayload) {
        // when we read a message from groupme, send it to the discord group
        this.discordChannel.sendMessage(message);
    }
};
