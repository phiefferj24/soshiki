import sourceLists from 'soshiki-packages/sourceLists.json';

export async function get() {
    return {
        status: 200,
        body: sourceLists,
        headers: {
            'Content-Type': 'application/json',
        }
    }
}