throw new Error("@migration task: Update +server.js (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");

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