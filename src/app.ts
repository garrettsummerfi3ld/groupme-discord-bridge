import { ChannelLinker } from './ChannelLinker';
import config from './config';
import { GroupMeClient } from './GroupMeClient';

async function thing(){
    let linker = await ChannelLinker.new(
        config.discord.token,
        new GroupMeClient(config.listenPort, config.groupme.callbackURL)
    );
    
    let promises:Promise<void>[] = [];
    for(let x of config.servers){
        promises.push(linker.link(x.discord.guildId, x.discord.channelId, x.groupme.botId, x.groupme.groupId));
    }

    await Promise.all(promises);

}
try{
    thing();
}catch(e){
    console.error(e);
}
