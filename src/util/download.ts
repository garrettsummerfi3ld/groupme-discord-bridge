const request = require("request-promise");
const os = require("os");
const fs = require("fs");
const path = require("path");

type DownloadResults = {
    contentType: string;
    downloadLocation: string;
};
var tempDir: string = path.join(os.tmpdir(), "groupme-discord-bridge");
try {
    fs.mkdirSync(tempDir);
} catch (e) {
    // Already exists
}

export async function download(url: string, filename: string): Promise<DownloadResults> {
    return new Promise((resolve) => {
        request.head(url, (err: string, res: any, body: any) => {
            let downloadLocation = path.join(tempDir, filename);
            let contentType = res.headers['content-type'];

            request(url).pipe(fs.createWriteStream(downloadLocation)).on('close', () => resolve({
                contentType: contentType,
                downloadLocation
            }));

        });
    });
}
