import { Database } from "../../database-new"
import type { Handle } from "@sveltejs/kit"

async function setupDatabase() {
    const dbClient = await Database.connect()
    return dbClient;
}

const dbPromise = setupDatabase();

export const handle: Handle = async ({ event, resolve }) => {
    const db = await dbPromise;

    event.locals = { db };
    return await resolve(event);
}