import { json } from '@sveltejs/kit';

export async function GET({ url }) {
    return json({}, {
        status: 301,
        headers: { Location: `${url.toString()}/info` }
    });
}