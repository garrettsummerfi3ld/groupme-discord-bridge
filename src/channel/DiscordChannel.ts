import { TextChannel } from 'discord.js';
import { MessagePayload } from './MessagePayload';
import { GenericChannel } from "./GenericChannel";

export class DiscordChannel extends GenericChannel {
    private textChannel: TextChannel;

    constructor(textChannel: TextChannel) {
        super();
        this.textChannel = textChannel;
    }

    async sendMessage(message: MessagePayload) {
        if (!message.messageText && message.attachments.length == 0)
            return;
        let discordAttachments = message.attachments.map(x => x.toDiscordAttachment());
        if (message.messageText.length > 0) {
            await this.textChannel.send("**" + message.sender + "**: " + message.messageText);
        }

        await Promise.all(discordAttachments.map(async (x) => {
            let attachment = await x;
            if (attachment == "invalid")
                return;
            if ("msgAtt" in attachment) {
                await this.textChannel.send("**" + message.sender + "** sent an image:", attachment.msgAtt);
                attachment.cleanup();
                return;
            } else {
                this.textChannel.send("**" + message.sender + "** sent an image: " + attachment.url);
            }
        }));
    }
}
