import { MessagePayload } from "./MessagePayload";

type MessageCallback = (message: MessagePayload) => Promise<any>;
export abstract class GenericChannel {
    /** broadcasts a message to the channel */
    abstract sendMessage(message: MessagePayload): Promise<any>;

    private callback: MessageCallback;

    /** sets a listener to be called each time a message is sent */ 
    setOnReceiveListener(callback: MessageCallback) {
        this.callback = callback;
    }

    /** should be called by the client each time a message is sent */ 
    async messageReceived(message: MessagePayload) {
        if (this.callback)
            await this.callback(message);
    }
}
