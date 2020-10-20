import { Client, TextChannel } from 'discord.js';
import { AttachmentData } from '../channel/Attachment';
import { ChannelIdentifier } from '../channel/ChannelIdentifier';
import { DiscordChannel } from '../channel/DiscordChannel';
import { GenericChannel } from "../channel/GenericChannel";
import {GenericClient} from './GenericClient';


export class DiscordClient extends GenericClient<DiscordChannel>{

    private cilent: Client;

    private constructor(discordClient : Client) {
        super();
        this.cilent = discordClient;
        this.cilent.on('message', msg => {
            if (this.has(msg.channel.id) && msg.author.bot == false) {
                this.messageReceived(msg.channel.id, {
                    messageText: msg.cleanContent?msg.cleanContent:"",
                    sender: msg.author.username,
                    attachments: msg.attachments.map(x=>new AttachmentData(x))
                }).catch(x => {
                    throw x;
                });
            }
        });
    }

    public static async connect(discordToken: string): Promise<DiscordClient> {
        return new Promise((resolve, reject) => {
            let client: Client = new Client();
            client.login(discordToken).catch(reject);
            client.on("ready", () => {
                resolve(new DiscordClient(client));
            });
        });
    }

    protected async resolveChannel(channelIdentifier:ChannelIdentifier<DiscordChannel>) : Promise<DiscordChannel>{
        let guild = await this.cilent.guilds.fetch(channelIdentifier.guildId);
        let channel = guild.channels.resolve(channelIdentifier.channelId) as TextChannel;

        return new DiscordChannel(channel); 
    }
}
