import {readFileSync, writeFileSync, existsSync} from 'fs';

export type Config = {
    listenPort: Number;
    discord:{
        token: string;
    };
    groupme: {
        accessToken: string;
        callbackURL: string;
    };
    servers: [
        {
            name: string,
            discord:{
                guildId: string,
                channelId: string
            },
            groupme:{
                botId: string,
                groupId: string
            }
        }
    ];
};

const defaultConfig: Config = {
    listenPort: 5000,
    discord:{
        token: ""
    },
    groupme:{
        accessToken: "",
        callbackURL: "/callback",
    },
    servers:[
        {
            name: "GEOS 1303",
            discord:{
                guildId: "",
                channelId: ""
            },
            groupme:{
                groupId: "",
                botId: ""
            }

        }
    ]
};


var config : Config = defaultConfig;
const CONFIG_FILENAME = "config.json";

if(existsSync(CONFIG_FILENAME)){
    config = JSON.parse(readFileSync(CONFIG_FILENAME).toString()) as unknown as Config;
    console.log(config);
    if(!config.discord || !config.discord.token){
        console.error(`Please fill out each field of ${CONFIG_FILENAME}`);
        process.exit(1);
    }
}else{
    console.error(`${CONFIG_FILENAME} Doesn't exist. Creating it...`);
    writeFileSync(CONFIG_FILENAME, JSON.stringify(defaultConfig, null, 2));
    console.error("Configuration file created. Please fill out the fields and then run the bot again.");
    process.exit(1);
}

export default config;