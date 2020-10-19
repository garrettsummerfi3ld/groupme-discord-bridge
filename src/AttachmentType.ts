import { MessageAttachment } from 'discord.js';
import config from './config';
import { download } from './download';
import * as fs from 'fs';
import * as request from 'request-promise';
const uuidv1 = require("uuid/v1");

type AttachmentType = "invalid" | "image";
export type AttachmentGroupMePayload = {
    type: "image";
    url: string;
} | "invalid";
const IMAGE_EXT = ["jpeg", "jpg", "png", "gif"];
export class AttachmentData {
    protected type: AttachmentType;
    protected url: string;
    protected name: string;

    public constructor(attachment: MessageAttachment | { type: AttachmentType; url: string; }){
        if (attachment instanceof MessageAttachment) {
            this.url = attachment.url;
            this.name = attachment.name;
            if (IMAGE_EXT.some(x => attachment.url.endsWith(x))) {
                this.type = "image";
            } else {
                this.type = "invalid";
            }
        } else {
            this.type = attachment.type == "image" ? "image" : "invalid";
            this.url = attachment.url;
            this.name = uuidv1();
        }
    }


    public async uploadToGroupMe(): Promise<AttachmentGroupMePayload> {
        if (this.type == "invalid")
            return "invalid";

        let { contentType, downloadLocation } = await download(this.url, this.name);
        let options = {
            method: 'POST',
            url: "https://image.groupme.com/pictures",
            headers: {
                "X-Access-Token": config.groupme.accessToken
            },
            formData: {
                file: fs.createReadStream(downloadLocation)
            }
        };

        let res = await request(options);
        return {
            type: "image",
            url: JSON.parse(res).payload.url
        };
    }

    public async toDiscordAttachment(): Promise<{ msgAtt: MessageAttachment; cleanup: () => void; } | { url: string; } | "invalid"> {
        if (this.type == "invalid")
            return "invalid";

        let array = this.url.split(".");
        let filename = this.name + "." + array[array.length - 2];
        let { contentType, downloadLocation } = await download(this.url, this.name);

        return new Promise((resolve, reject) => {
            fs.stat(downloadLocation, async (err, stats) => {
                if (err) {
                    reject(err);
                }

                // Discord does not allow files greater than 8MB unless user has Nitro
                if (stats.size > (1024 * 1024 * 8)) {
                    fs.unlink(downloadLocation, () => { });
                    resolve({ url: this.url });
                } else {
                    resolve({
                        msgAtt: new MessageAttachment(downloadLocation, filename),
                        cleanup: () => { fs.unlink(downloadLocation, () => { }); }
                    });
                }
            });

        });
    }
}
