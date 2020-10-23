import { MessageAttachment } from 'discord.js';
import config from '../config';
import { download, getFileSize } from '../util/download';
import * as fs from 'fs';
import * as request from 'request-promise';
const uuidv1 = require("uuid/v1");

export class InvalidAttachmentError extends Error{
    constructor(){
        super("Invalid Attachment");
    }
};

export type AttachmentGroupMePayload = {
    type: "image";
    url: string;
};

export type AttachmentDiscordPayload= {
    msgAtt: MessageAttachment;
    cleanup: () => void;
} | { url: string; };


// tests GroupMe static image URLs
// they're kinda quirky tho
const gmRe = /^https?:\/\/i.groupme.com\/[A-Za-z0-9]+\.([A-Za-z0-9]+)\.[A-Za-z0-9]+$/m;

// any URL that ends with a file extension
const dcRe = /.+\.([A-Za-z0-9]+)$/m;

function getFileExtension(url: string) : string{
    // test for a groupme formatted URL
    let result = gmRe.exec(url);
    if(result)
        return result[1];
    
    // test for a discord formatted URL
    result = dcRe.exec(url);
    if(result)
        return result[1];
    
    return "";
}

const IMAGE_EXT = ["jpeg", "jpg", "png", "gif"];

/** return true iff the URL has an image file extension*/
export function attachmentIsImage(attachment: {url: string}) : boolean{
    let fileExt = getFileExtension(attachment.url);
    return IMAGE_EXT.some(x => x==fileExt);
}

/** used to store the original of an attachment */
export class AttachmentData {
    protected url: string;
    protected name: string;


    /** This constructor will throw errors for non-image attachments! */
    public constructor(attachment: MessageAttachment | {url: string; }){

        // if it isn't an image, throw an error
        if (!attachmentIsImage(attachment)) {
            throw new InvalidAttachmentError();
        }

        // specify this attachment's url
        this.url = attachment.url;

        // give the attachment a filename
        if (attachment instanceof MessageAttachment) {
            this.name = attachment.name;
        } else {
            this.name = uuidv1();
        }
    }


    public async uploadToGroupMe(): Promise<AttachmentGroupMePayload> {
        // download the image file from the original URL
        let { contentType, downloadLocation } = await download(this.url, this.name);

        // create the POST request to upload the image file to groupme
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

        // upload it
        let res = await request(options);

        // return URL of the uploaded file
        return {
            type: "image",
            url: JSON.parse(res).payload.url
        };
    }

    /** Downloads the image file and converts it into something Discord can understand */
    public async toDiscordAttachment(): Promise<AttachmentDiscordPayload> {

        // download this file, and keep track of its filename
        let fileExtension = getFileExtension(this.url);
        let filename = this.name + "." + fileExtension;
        let { contentType, downloadLocation } = await download(this.url, filename);

        let size = await getFileSize(downloadLocation);

        if (size > (1024 * 1024 * 8)) {
            // the file is too big! just return the URL for discord

            // but first delete the temporary file
            fs.unlink(downloadLocation, () => { });
            return { url: this.url };
        } else {
            // the file is small enough to be uploaded!

            return {
                msgAtt: new MessageAttachment(downloadLocation, filename),
                
                // the cleanup method deletes the temporary file. it should be called after sending message to discord
                cleanup: () => { fs.unlink(downloadLocation, () => { });}
            }
        }

    }
}
