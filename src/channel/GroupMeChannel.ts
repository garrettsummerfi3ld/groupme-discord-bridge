import { promises } from "fs";
import { AttachmentGroupMePayload } from "./Attachment";
import { MessagePayload } from "./MessagePayload";
import { GenericChannel } from "./GenericChannel";
import { Console } from "console";

const request = require("request-promise");

type MessagePostRequestBody = {
    bot_id: string,
    text: string,
    attachments?: [AttachmentGroupMePayload?]
};

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

        // don't send an empty message
        if (gmAttachments.length == 0 && message.messageText.length == 0)
            return;

        // create one message per attachment
        // (you can't send multiple images per message using the groupme api)
        let gmMessages: MessagePostRequestBody[] = gmAttachments.map(x => ({
            bot_id: this.botId,
            text: "",
            attachments: [x]
        }));

        // create the text part of the message
        let messageText = "";
        if (message.messageText.length == 0) {
            messageText = `<${message.sender} sent an image>`;
        } else {
            messageText = `<${message.sender}> ${message.messageText}`;
        }

        // put the text on the last message, or create a new message if there are no attachments
        if(gmMessages.length > 0)
            gmMessages[gmMessages.length-1].text = messageText
        else
            gmMessages.push({
                bot_id: this.botId,
                text: messageText,
            });

        // send each message sequentially
        for(let gmMessage of gmMessages){
            let options = {
                method: 'POST',
                uri: 'https://api.groupme.com/v3/bots/post',
                body: gmMessage,
                json: true
            };

            await request(options);
        }
    }
}
