import sourceLists from 'soshiki-packages/sourceLists.json';

export async function load() {
    return new Response(JSON.stringify(sourceLists), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}