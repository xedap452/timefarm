const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Api } = require("telegram/tl");
const fs = require('fs');
const { unescape } = require('querystring');

async function getQueryId(apiId, apiHash, sessionFilePath) {
    const sessionString = fs.readFileSync(sessionFilePath, 'utf-8');
    const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
        connectionRetries: 5,
        logLevel: 'none',
        useWSS: true
    });

    try {
        await client.connect();
        
        const webViewResult = await client.invoke(
            new Api.messages.RequestWebView({
                peer: await client.getInputEntity('TimeFarmCryptoBot'),
                bot: await client.getInputEntity('TimeFarmCryptoBot'),
                platform: 'android',
                fromBotMenu: false,
                url: 'https://tg-tap-miniapp.laborx.io',
            })
        );
        
        const authUrl = webViewResult.url;
        const tgWebAppData = unescape(
            unescape(
                authUrl.split('tgWebAppData=')[1].split('&tgWebAppVersion')[0]
            )
        );
        console.log(`[*] Đã lấy được query_id: ${tgWebAppData}`);
        return tgWebAppData;
    } catch (error) {
        console.error("Error:", error.message);
        throw error;
    } finally {
        await client.disconnect();
        await client.destroy();
        console.log("[*] Đã ngắt kết nối telegram!");
    }
}

module.exports = {
    getQueryId
};