import { AttachmentData } from "./Attachment";

/** encapsulates cross-platform messages */
export type MessagePayload = {
    sender: string;
    messageText: string;
    attachments: AttachmentData[];
};

