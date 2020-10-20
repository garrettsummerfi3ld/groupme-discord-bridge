const express = require("express");
const bodyParser = require("body-parser");
import { Express } from 'express';
import { AttachmentData } from '../channel/Attachment';
import { GenericClient } from './GenericClient';
import { GroupMeChannel } from "../channel/GroupMeChannel";
import { MessagePayload } from '../channel/MessagePayload';

export class GroupMeClient extends GenericClient<GroupMeChannel>{
    private expressApp: Express;

    constructor(port: Number, callbackURL: string) {
        super();
        this.expressApp = express();
        this.expressApp.use(bodyParser.json());
        this.expressApp.listen(port, () => console.log("Listening for GroupMe messages on port " + port));

        // listen for messages from the groupme server
        this.expressApp.post(callbackURL, (req, res) => {

            let groupId = req.body.group_id;
            if (req.body.sender_type == "bot" || req.body.system)
                return;
            if (this.has(groupId)) {
                let message: MessagePayload = {
                    sender: req.body.name,
                    messageText: req.body.text,
                    attachments: !req.body.attachments ? [] : req.body.attachments.map(x => {

                        let attachment = new AttachmentData({
                            type: x.type,
                            url: x.url
                        });

                        return attachment;
                    })
                };
                this.messageReceived(groupId, message);
            }
        });
    }

    protected async resolveChannel(id: { botId: string; channelId: string; }): Promise<GroupMeChannel> {
        let groupChat = new GroupMeChannel(id.botId);
        return groupChat;
    }
}
