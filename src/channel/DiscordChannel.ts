import { CategoryChannel, MessageAttachment, TextChannel } from 'discord.js';
import { MessagePayload } from './MessagePayload';
import { GenericChannel } from "./GenericChannel";

export class DiscordChannel extends GenericChannel {
    private textChannel: TextChannel;

    constructor(textChannel: TextChannel) {
        super();
        this.textChannel = textChannel;
    }

    // broadcast a message to the discord channel
    async sendMessage(message: MessagePayload) {

        // don't send an emtpy message
        if (!message.messageText && message.attachments.length == 0)
            return;

        // download the attachments
        let attachmentPayloads = await Promise.all(message.attachments.map(attData => attData.toDiscordAttachment()));

        // start building the message. keep a list of the attachments to send
        let messageText = "";
        let messageAttachments: MessageAttachment[] = [];

        // if there is text associated with the message, send the text
        if (message.messageText.length > 0) {
            messageText = "**" + message.sender + "**: " + message.messageText;
        } else {
            messageText = "**" + message.sender + "** sent an image:";
        }

        // some of the attachments will be small, so they can be uploaded to discord directly
        // other attachments will be too big, so we'll need to add their URLs as text to the discord message
        // in the latter case, discord will still display the image
        attachmentPayloads.forEach(attachmentPayload=>{
            
            // for (small) uploadable attachments...
            if("msgAtt" in attachmentPayload){
                messageAttachments.push(attachmentPayload.msgAtt);
            
            // for big boy attachments...
            }else{
                messageText = messageText + `\n${attachmentPayload.url}`;
            }
        });

        // send the message
        await this.textChannel.send(messageText, messageAttachments);

        // clean up - delete the downloaded attachments
        attachmentPayloads.forEach(attachmentPayload=>{
            if("msgAtt" in attachmentPayload){
                attachmentPayload.cleanup();
            }
        });
    }
}
