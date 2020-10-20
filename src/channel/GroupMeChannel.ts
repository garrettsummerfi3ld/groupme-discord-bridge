import { promises } from "fs";
import { AttachmentGroupMePayload } from "./Attachment";
import { MessagePayload } from "./MessagePayload";
import { GenericChannel } from "./GenericChannel";

const request = require("request-promise");

export class GroupMeChannel extends GenericChannel {
    private botId: string;

    constructor(botId: string) {
        super();
        this.botId = botId;
    }

    async sendMessage(message: MessagePayload) {
        let gmAttachments : AttachmentGroupMePayload[] = [];


        await Promise.all(message.attachments.map(async attachmentData=>{
            let gmAttachment = await attachmentData.uploadToGroupMe();
            if(gmAttachment != "invalid")
                gmAttachments.push(gmAttachment);
        }));

        let messageText = "";
        if(message.messageText.length == 0){
            messageText = `<${message.sender} sent an image>`;
        }else{
            messageText = `<${message.sender}> ${message.messageText}`;
        }

        if(gmAttachments.length == 0)
            return;
    
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

        return request(options);
    }
}
