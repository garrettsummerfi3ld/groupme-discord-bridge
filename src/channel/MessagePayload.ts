import { AttachmentData } from "./Attachment";

export type MessagePayload = {
    sender: string;
    messageText: string;
    attachments: AttachmentData[];
};

