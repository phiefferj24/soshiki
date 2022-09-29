import sourceLists from 'soshiki-packages/sourceLists.json';

export async function GET() {
    return new Response(JSON.stringify(sourceLists), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}