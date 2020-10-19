import { AttachmentData } from "./AttachmentType";

export type MessagePayload = {
    sender: string;
    messageText: string;
    attachments: AttachmentData[];
};
type MessageCallback = (message: MessagePayload) => Promise<any>;
export abstract class GenericChannel {
    abstract sendMessage(message: MessagePayload): Promise<any>;

    private callback: MessageCallback;

    setOnReceiveListener(callback: MessageCallback) {
        this.callback = callback;
    }

    async messageReceived(message: MessagePayload) {
        if (this.callback)
            await this.callback(message);
    }
}
