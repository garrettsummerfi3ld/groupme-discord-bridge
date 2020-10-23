import { promises } from "fs";
import { AttachmentGroupMePayload } from "./Attachment";
import { MessagePayload } from "./MessagePayload";
import { GenericChannel } from "./GenericChannel";

const request = require("request-promise");

export class GroupMeChannel extends GenericChannel {

    // You need to put a different bot in each Groupme channel
    private botId: string;

    constructor(botId: string) {
        super();
        this.botId = botId;
    }

    // broadcast message to the groupme channel
    async sendMessage(message: MessagePayload) {

        // upload all the attachments
        let gmAttachments = await Promise.all(
            message.attachments.map(attachment => attachment.uploadToGroupMe())
        );

        // create the text part of the message
        let messageText = "";
        if(message.messageText.length == 0){
            messageText = `<${message.sender} sent an image>`;
        }else{
            messageText = `<${message.sender}> ${message.messageText}`;
        }

        // don't send an empty message
        if(gmAttachments.length == 0 && message.messageText.length==0)
            return;
    
        // create the http request
        let options = {
            method: 'POST',
            uri: 'https://api.groupme.com/v3/bots/post',
            body: {
                bot_id: this.botId,
                text: messageText,
                attachments: gmAttachments.length==0 ? undefined : gmAttachments
            },
            json: true
        };

        // send the message over http
        return request(options);
    }
}
