const request = require("request-promise");

type MsgCallback = (name: string, message: string, attachments: any) => any;
export class GroupMe {
    private botId: string;
    private callback: MsgCallback = null;

    constructor(botId: string) {
        this.botId = botId;
    }

    async sendMessage(message: string, attachments: any) {
        let options = {
            method: 'POST',
            uri: 'https://api.groupme.com/v3/bots/post',
            body: {
                bot_id: this.botId,
                text: message,
                attachments: attachments ? attachments : undefined
            },
            json: true
        };

        return request(options);
    }

    onReceived(callback: MsgCallback) {
        this.callback = callback;
    }

    messageReceived(name: string, message: string, attachments: any) {
        if (this.callback)
            this.callback(name, message, attachments);
    }
}
