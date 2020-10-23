import { ChannelIdentifier } from '../channel/ChannelIdentifier';
import { MessagePayload } from '../channel/MessagePayload';
import { GenericChannel } from "../channel/GenericChannel";

export abstract class GenericClient<T extends GenericChannel> {

    // a map between channel ID's and channel objects
    private channelMap: { [channelId: string]: T; };

    constructor() {
        this.channelMap = {};
    }

    // returns a channel based on a channel ID
    public async getChannel(id: ChannelIdentifier<T>): Promise<T> {
        let channel = await this.resolveChannel(id);
        this.channelMap[id.channelId] = channel;
        return channel;
    }

    /** This method should instantiate (load) a channel given its channel ID */
    protected abstract resolveChannel(id: ChannelIdentifier<T>): Promise<T>;

    /** Call this whenever the client receives a new message.
     * This method will forward the message to the appropriate channel */
    protected async messageReceived(channelId: string, message:MessagePayload) {
        this.channelMap[channelId].messageReceived(message);
    }

    /** Return true iff the channel id is in the map */
    protected has(channelId: string){
        return channelId in this.channelMap;
    }
}
