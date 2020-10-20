# groupme-discord-bridge
A bridge bot which connects GroupMe chats with Discord Channels.

**SECURITY NOTICE:** Theoretically someone COULD intercept messages from GroupMe to the bridge if you do not run behind a reverse proxy, which isn't covered here. That is because the bridge uses a plain HTTP server to recieve data from GroupMe. If you want messages to be secure, it is recommended to run the bridge behind a reverse proxy such as [nginx](https://www.nginx.com/), as your forward web server would have HTTPS enabled, and all requests would go to it, which it would then send over the local network to the bridge.

## Requirements
- NodeJS installed.
- Your firewall opened for a port so GroupMe can send the bridge messages **OR** a forward facing web server like Nginx or Apache that you can configure a reverse proxy for.

## Setting up
First you can clone this repository (or download it) and then run ```npm install``` to fetch dependencies.

Now you can run ```npm start```. It should error out saying you don't have a config file, and it will create a skeleton one for you, which should look something like this:
```json
{
  "listenPort": 5000,
  "discord": {
    "token": ""
  },
  "groupme": {
    "accessToken": "",
    "callbackURL": "/callback"
  },
  "bridges": [
    {
      "name": "GEOS 1303",
      "discord": {
        "guildId": "",
        "channelId": ""
      },
      "groupme": {
        "groupId": "",
        "botId": ""
      }
    }
  ]
}

```

You can change "listenPort" to the port you want the bridge to listen on. That's the port GroupMe will be sending messages to, and the one that needs to be open in your Firewall **OR** configured your reverse proxy to, which is out of scope of this guide. There are many guides online on how to configure a reverse proxy.

Next you will need to create a Discord bot account on the Discord developers page. You can use this [handy guide](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token). The Discord web interface has changed a bit, (you'll need to select "Bot" on the far left to create the bot account and see the access token). Once you've added the Discord bot to your Guild you'll need to copy the "Token" and put them in the ```config.json``` config file. It goes to the "token" field under the "discord"  in the JSON file.
```json
{
  "listenPort": 5000,
  "discord": {
    "token": "YOUR DISCORD BOT'S TOKEN HERE"
  },
  "groupme": {
    "accessToken": "",
    "callbackURL": "/callback"
  },
  "bridges": [
    {
      "name": "GEOS 1303",
      "discord": {
        "guildId": "",
        "channelId": ""
      },
      "groupme": {
        "groupId": "",
        "botId": ""
      }
    }
  ]
}

```

Now you will need the Guild and Channel IDs for the Discord side. In Discord you'll need to enable Developer mode (you can find this option under "Settings->Appearance->Advanced". Now you can right click on the Discord Guild (or server as it is called in the client) and click "copy-ID". You can paste that in the "guildId" field in ```config.json```. Do the same for the channel by right clicking on the channel and clicking "copy-ID". Paste that in the "channelId" field.
```json
{
  "listenPort": 5000,
  "discord": {
    "token": "YOUR DISCORD BOT'S TOKEN HERE"
  },
  "groupme": {
    "accessToken": "",
    "callbackURL": "/callback"
  },
  "bridges": [
    {
      "name": "GEOS 1303",
      "discord": {
        "guildId": "YOUR DISCORD SERVER's ID",
        "channelId": "THE CHANNEL ID"
      },
      "groupme": {
        "groupId": "",
        "botId": ""
      }
    }
  ]
}

```

Finally we need to set up the GroupMe bot. Head over to https://dev.groupme.com/ and sign in with your GroupMe account. Once you've logged in you'll need to head over to https://dev.groupme.com/bots and click on the "Create a Bot" button. Select which GroupMe group you want the bot to be in, and give it a Name and an Avatar URL (a URL to a picture) if you chose to do so. For the callback URL you need to put in the address that the bridge will recieve GroupMe messages from.

For example, if I am running the bridge on my server, myserver.com, and I set "listenPort" to be 8088 and "callbackURL" set to "/callback", then the callback URL will be "http://myserver.com:5000/callback".

The callback URL is very important, as if it is not correct then the bridge will not recieve messages from GroupMe and nothing will show up in Discord. This is probably the number 1 cause of the bridge not working.

Once you've created the GroupMe bot, copy it's "bot ID" and paste it in ```config.json``` in the "botId" field. You'll also need to copy your GroupMe access token, which can be found by clicking on "Access Token" in the top right of the GroupMe developers site. 


```json
{
  "listenPort": 5000,
  "discord": {
    "token": "YOUR DISCORD BOT'S TOKEN HERE"
  },
  "groupme": {
    "accessToken": "YOUR GROUPME ACCESS TOKEN",
    "callbackURL": "/callback"
  },
  "bridges": [
    {
      "name": "GEOS 1303",
      "discord": {
        "guildId": "YOUR DISCORD SERVER's ID",
        "channelId": "THE CHANNEL ID"
      },
      "groupme": {
        "groupId": "THE NUMERIC GROUP ID OF THE GROUP YOUR BOT IS IN",
        "botId": "YOUR GROUPME BOT'S ID"
      }
    }
  ]
}

```

Now you should be all set! Save the config file and give the bridge a run by running ```npm start```.

### Use multiple servers at a time!
Hello gamers. Let's say that you have 2+ different discord channels that you want to sync up with 2+ different GroupMe chats.
1. You don't need to make a new discord bot! Just add that same bot you made to another server, and then copy the server and channel ID's like you did before
2. You DO need to make a new GroupMe bot so that it can join a new GroupMe group. Copy the bot's id and the group's id into ```config.json```
3. Start it up!

```json
{
  "listenPort": 5000,
  "discord": {
    "token": "YOUR DISCORD BOT'S TOKEN"
  },
  "groupme": {
    "accessToken": "YOUR GROUPME ACCESS TOKEN",
    "callbackURL": "/callback"
  },
  "bridges": [
    {
      "name": "GEOS 1303",
      "discord": {
        "guildId": "767517689806591100",
        "channelId": "767517640397308200"
      },
      "groupme": {
        "groupId": "63664209",
        "botId": "a3cc0e30b7e02654fac97"
      }
    },
    {
      "name": "PHYS 1301",
      "discord": {
        "guildId": "767517689822591246",
        "channelId": "767517640727308201"
      },
      "groupme": {
        "groupId": "63499157",
        "botId": "a3cb0e493c0a2654fbc106"
      }
    }
  ]
}

```