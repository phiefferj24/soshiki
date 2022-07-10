import manifest from "soshiki-manifest";
export default class Discord {
    static async getUserInfo(userId: string) {
        return await (await this.api(`users/${userId}`)).json();
    }
    static async getUserAvatar(userId: string) {
        let info = await this.getUserInfo(userId);
        if(!info.avatar) {
            return null;
        }
        return this.cdn(`avatars/${info.id}/${info.avatar}`);
    }
    static async authorize(code: string) {
        return await (await fetch(`${manifest.discord.url}/oauth2/token`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`${manifest.discord.client.id}:${manifest.discord.client.secret}`, "utf8").toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `grant_type=authorization_code&code=${code}&redirect_uri=https%3A%2F%2Fapi.soshiki.moe%2Fuser%2Flogin%2Fdiscord`
        })).json()
    }
    static async refresh(token: string): Promise<{ access: string, refresh: string, expires: number }> {
        let res =  await (await fetch(`${manifest.discord.url}/oauth2/token`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`${manifest.discord.client.id}:${manifest.discord.client.secret}`, "utf8").toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `grant_type=refresh_token&refresh_token=${token}`
        })).json();
        return {
            access: res.access_token,
            refresh: res.refresh_token,
            expires: res.expires_in
        }
    }
    private static async fetch(url: string) {
        return await fetch(url, { headers: { Authorization: `Bot ${manifest.discord.bot.token}` } });
    }
    private static async api(path: string) {
        return await this.fetch(`${manifest.discord.url}/${path}`);
    }
    private static async cdn(path: string) {
        return `${manifest.discord.cdn}/${path}`;
    }
}
