const request = require("request-promise");
const uuidv1 = require("uuid/v1");
import { TextChannel, Message } from 'discord.js';
import { MessageAttachment } from 'discord.js';
import config from './config';
const fs = require("fs");
import { GroupMe } from "./GroupMe";
import { download } from "./download";

export class Link {
    private channel: TextChannel;
    private groupMe: GroupMe;

    constructor(channel: TextChannel, groupMe: GroupMe) {
        this.channel = channel;
        this.groupMe = groupMe;
        this.groupMeMessageReceived = this.groupMeMessageReceived.bind(this);
        this.groupMe.onReceived(this.groupMeMessageReceived);
    }

    async discordMessageReceived(message: Message) {

        if ((message.content == null || message.content == "") &&
            message.attachments.size == 0)
            return;

        let author = message.member.nickname == null ? message.author.username : message.member.nickname;

        if (message.attachments.size > 0) {
            // First download the image
            let attachment = message.attachments.values().next().value;
            let { contentType, downloadLocation } = await download(attachment.url, attachment.name);
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
            let res2 = await this.groupMe.sendMessage("<" + author + " sent an image>", [{ type: "image", url: JSON.parse(res).payload.url }]);
            console.log(res2);
        } else {
            await this.groupMe.sendMessage("<" + author + "> " + message.cleanContent, null);
        }

    }

    async groupMeMessageReceived(sender: string, message: string, attachments: any) {

        if (attachments.length > 0) {
            let image = false;
            switch (attachments[0].type) {
                case "image":
                    image = true;
                case "video":
                    let array = attachments[0].url.split(".");
                    let filename = uuidv1() + "." + array[array.length - 2];
                    let { contentType, downloadLocation } = await download(attachments[0].url, uuidv1());
                    fs.stat(downloadLocation, async (err, stats) => {
                        if (err) {
                            console.error(err);
                            return;
                        }

                        // Discord does not allow files greater than 8MB unless user has Nitro
                        if (stats.size > (1024 * 1024 * 8)) {
                            this.channel.send("**" + sender + "** sent " + (image ? "an image" : "a video") + ": " + attachments[0].url).then(() => fs.unlink(downloadLocation, () => { }));
                        } else {
                            if (message.length > 0)
                                await this.channel.send("**" + sender + "**: " + message);
                            await this.channel.send("**" + sender + "** sent " + (image ? "an image" : "a video") + ":", new MessageAttachment(downloadLocation, filename)).then(() => fs.unlink(downloadLocation, () => { }));
                        }
                    });
                    break;
                default:
                    console.log("Unknown attachment: " + attachments[0].type);
            }
        } else if (message.length != 0) {
            this.channel.send("**" + sender + "**: " + message);
        }

    }
}
;
