import { redirect } from '@sveltejs/kit';
 
export function load() {
    throw redirect(307, `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_ID}&redirect_uri=http%3A%2F%2F127.0.0.1%3A3605%2Fredirect&response_type=code&scope=identify`)
}