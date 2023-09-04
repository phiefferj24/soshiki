import { redirect } from '@sveltejs/kit';
 
export function load() {
    throw redirect(307, `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_ID}&redirect_uri=${encodeURIComponent("https://backups.soshiki.moe/redirect")}&response_type=code&scope=identify`)
}