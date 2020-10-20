import { ChannelIdentifier } from '../channel/ChannelIdentifier';
import { MessagePayload } from '../channel/MessagePayload';
import { GenericChannel } from "../channel/GenericChannel";

export abstract class GenericClient<T extends GenericChannel> {
    private channelMap: { [channelId: string]: T; };

    constructor() {
        this.channelMap = {};
    }

    public async getChannel(id: ChannelIdentifier<T>): Promise<T> {
        let channel = await this.resolveChannel(id);
        this.channelMap[id.channelId] = channel;
        return channel;
    }

    protected abstract resolveChannel(id: ChannelIdentifier<T>): Promise<T>;

    protected async sendMessageTo(channelId: string, message:MessagePayload) {
        this.channelMap[channelId].sendMessage(message);
    }

    protected has(channelId: string){
        return channelId in this.channelMap;
    }
}
