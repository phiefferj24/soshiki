export async function get({ url }) {
    return {
        status: 301,
        headers: { Location: `${url.toString()}/info` },
        body: {}
    };
}