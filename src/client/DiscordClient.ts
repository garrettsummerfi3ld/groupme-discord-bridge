import { Client as DC_Client, Message as DC_Message, TextChannel as DC_TextChannel } from 'discord.js';
import { AttachmentData, attachmentIsImage } from '../channel/Attachment';
import { ChannelIdentifier } from '../channel/ChannelIdentifier';
import { DiscordChannel } from '../channel/DiscordChannel';
import { GenericChannel } from "../channel/GenericChannel";
import { ErrorHandler } from '../util/ErrorHandler';
import {GenericClient} from './GenericClient';

/** This corresponds to a discord bot. One discord bot can exist in many channels */
export class DiscordClient extends GenericClient<DiscordChannel>{

    /** Interface between us and the discord bot */
    private cilent: DC_Client;

    private errorHandler: ErrorHandler;

    private constructor(discordClient : DC_Client, errorHandler:ErrorHandler) {
        super();
        this.cilent = discordClient;
        this.errorHandler = errorHandler;

        this.handleIncomingMessage = this.handleIncomingMessage.bind(this);

        // make the client listen for messages on all channels
        // then we'll handle them in the method below
        this.cilent.on('message', this.handleIncomingMessage);
        this.cilent.on('error', errorHandler);
    }
    
    /** called any time anybody sends a message on any discord channel the bot is in */
    private handleIncomingMessage(msg: DC_Message){
        
        // make sure that the discord channel is in our system
        if(!this.has(msg.channel.id))
            return;
        
        // make sure that the sender is not a bot
        if(msg.author.bot)
            return;

        // call the inherited messageReceived method so that it can handle the new message and send it on its way
        this.messageReceived(msg.channel.id, {
            messageText: msg.cleanContent?msg.cleanContent:"",
            sender: msg.member.nickname ? msg.member.nickname : msg.author.username,
            attachments: msg.attachments.mapValues(x=>x)
                                        .filter(attachmentIsImage)
                                        .map(x=>new AttachmentData(x))
        }).catch(this.errorHandler);
    }

    /** Instantiate a new discord client */
    public static async connect(discordToken: string, errorHandler:ErrorHandler): Promise<DiscordClient> {
        return new Promise((resolve, reject) => {
            
            // create the client object & login
            let client: DC_Client = new DC_Client();
            client.login(discordToken).catch(reject);

            // once it's loaded, return it
            client.on("ready", () => {
                client.removeListener('error', errorHandler);
                resolve(new DiscordClient(client, errorHandler));
            });
            client.addListener('error', errorHandler);
        });
    }

    // return a discord channel based on a channel identifier
    protected async resolveChannel(channelIdentifier:ChannelIdentifier<DiscordChannel>) : Promise<DiscordChannel>{
        // get the guild..
        let guild = await this.cilent.guilds.fetch(channelIdentifier.guildId);
        // find the channel in the guild..
        let channel = guild.channels.resolve(channelIdentifier.channelId) as DC_TextChannel;

        // return the channel
        return new DiscordChannel(channel); 
    }
}
