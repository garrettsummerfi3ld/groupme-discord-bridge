const express = require("express");
const bodyParser = require("body-parser");
import { Express } from 'express';
import { GroupMe } from "./GroupMe";

export class GroupMeClient {
    private expressApp: Express;
    private chatMap: { [groupId: string]: GroupMe; };

    constructor(port: Number, callbackURL: string) {
        this.expressApp = express();
        this.expressApp.use(bodyParser.json());
        this.expressApp.listen(port, () => console.log("Listening for GroupMe messages on port " + port));
        this.chatMap = {};
        this.expressApp.post(callbackURL, (req, res) => {
            let groupId = req.body.group_id;
            if (req.body.sender_type == "bot" || req.body.system)
                return;
            if (groupId in this.chatMap) {
                this.chatMap[groupId].messageReceived(req.body.name, req.body.text, req.body.attachments);
            }
        });
    }

    public getChannel(botId: string, groupId: string) : GroupMe {
        let groupChat = new GroupMe(botId);
        this.chatMap[groupId] = groupChat;
        return groupChat;
    }
}
