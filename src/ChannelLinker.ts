import { TextChannel, Client } from 'discord.js';
import { GroupMeClient } from './GroupMeClient';
import { Link } from './Link';

export class ChannelLinker {
    private discordClient: Client;
    private groupMeClient: GroupMeClient;
    private links: { [channelId: string]: Link; };

    private constructor(discordClient: Client, groupMeClient: GroupMeClient) {
        this.discordClient = discordClient;
        this.links = {};

        this.discordClient.on('message', msg => {
            if (msg.channel.id in this.links && msg.author.bot == false) {
                this.links[msg.channel.id].discordMessageReceived(msg).catch(x=>{
                    throw x;
                });
            }
        });
        this.groupMeClient = groupMeClient;
    }

    public static async new(discordToken: string, groupMeClient: GroupMeClient): Promise<ChannelLinker> {
        return new Promise((resolve, reject) => {
            let client: Client = new Client();
            client.login(discordToken).catch(reject);
            client.on("ready", () => {
                resolve(new ChannelLinker(client, groupMeClient));
            });
        });
    }

    public async link(guildId: string, channelId: string, botId: string, groupId: string) {
        let guild = await this.discordClient.guilds.fetch(guildId);
        let channel = guild.channels.resolve(channelId) as TextChannel;

        let link = new Link(channel, this.groupMeClient.getChannel(botId, groupId));
        this.links[channelId] = link;
    }
}
