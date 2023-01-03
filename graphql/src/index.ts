import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { readFileSync } from "fs"
import * as Soshiki from "./types"
import { parseResolveInfo } from "graphql-parse-resolve-info"
import { Pool, PoolClient } from "pg"
import { config } from 'dotenv';
config();

const pool = new Pool();

const resolvers: Soshiki.Resolvers = {
    Query: {
        User: async (_parent: any, args: Soshiki.QueryUserArgs, context: SoshikiContext, info: any) => await getUser(context.token, args, parseResolveInfo(info)),
        Users: async (_parent: any, args: Soshiki.QueryUsersArgs, context: SoshikiContext, info: any) => await getUsers(context.token, args, parseResolveInfo(info)),
        Library: async (_parent: any, args: Soshiki.QueryLibraryArgs, context: SoshikiContext, info: any) => await getLibrary(context.token, args, parseResolveInfo(info)),
        Libraries: async (_parent: any, _args: any, context: SoshikiContext, info: any) => await getLibraries(context.token, parseResolveInfo(info)),
        History: async (_parent: any, args: Soshiki.QueryHistoryArgs, context: SoshikiContext, info: any) => await getHistory(context.token, args, parseResolveInfo(info)),
        Histories: async (_parent: any, _args: any, context: SoshikiContext, info: any) => await getHistories(context.token, parseResolveInfo(info)),
        HistoryEntry: async (_parent: any, args: Soshiki.QueryHistoryEntryArgs, context: SoshikiContext, info: any) => await getHistoryEntry(context.token, args, parseResolveInfo(info)),
        HistoryEntries: async (_parent: any, args: Soshiki.QueryHistoryEntriesArgs, context: SoshikiContext, info: any) => await getHistoryEntries(context.token, args, parseResolveInfo(info)),
        Entry: async (_parent: any, args: Soshiki.QueryEntryArgs, context: SoshikiContext, info: any) => await getEntry(context.token, args, parseResolveInfo(info)),
        Entries: async (_parent: any, args: Soshiki.QueryEntriesArgs, context: SoshikiContext, info: any) => await getEntries(context.token, args, parseResolveInfo(info)),
        Link: async (_parent: any, args: Soshiki.QueryLinkArgs, context: SoshikiContext, info: any) => await getLink(context.token, args, parseResolveInfo(info)),
        Search: async (_parent: any, args: Soshiki.QuerySearchArgs, context: SoshikiContext, info: any) => await getSearchResults(context.token, args, parseResolveInfo(info)),
    },
    Mutation: {
        SetLink: async (_parent: any, args: Soshiki.MutationSetLinkArgs, context: SoshikiContext, info: any) => await setLink(context.token, args, parseResolveInfo(info)),
        RemoveLink: async (_parent: any, args: Soshiki.MutationRemoveLinkArgs, context: SoshikiContext, info: any) => await removeLink(context.token, args, parseResolveInfo(info)),
        AddLibraryItem: async (_parent: any, args: Soshiki.MutationAddLibraryItemArgs, context: SoshikiContext, info: any) => await addLibraryItem(context.token, args, parseResolveInfo(info)),
        AddLibraryItems: async (_parent: any, args: Soshiki.MutationAddLibraryItemsArgs, context: SoshikiContext, info: any) => await addLibraryItems(context.token, args, parseResolveInfo(info)),
        RemoveLibraryItem: async (_parent: any, args: Soshiki.MutationRemoveLibraryItemArgs, context: SoshikiContext, info: any) => await removeLibraryItem(context.token, args, parseResolveInfo(info)),
        RemoveLibraryItems: async (_parent: any, args: Soshiki.MutationRemoveLibraryItemsArgs, context: SoshikiContext, info: any) => await removeLibraryItems(context.token, args, parseResolveInfo(info)),
        AddLibraryItemToCategory: async (_parent: any, args: Soshiki.MutationAddLibraryItemToCategoryArgs, context: SoshikiContext, info: any) => await addLibraryItemToCategory(context.token, args, parseResolveInfo(info)),
        AddLibraryItemsToCategory: async (_parent: any, args: Soshiki.MutationAddLibraryItemsToCategoryArgs, context: SoshikiContext, info: any) => await addLibraryItemsToCategory(context.token, args, parseResolveInfo(info)),
        RemoveLibraryItemFromCategory: async (_parent: any, args: Soshiki.MutationRemoveLibraryItemFromCategoryArgs, context: SoshikiContext, info: any) => await removeLibraryItemFromCategory(context.token, args, parseResolveInfo(info)),
        RemoveLibraryItemsFromCategory: async (_parent: any, args: Soshiki.MutationRemoveLibraryItemsFromCategoryArgs, context: SoshikiContext, info: any) => await removeLibraryItemsFromCategory(context.token, args, parseResolveInfo(info)),
        AddLibraryCategory: async (_parent: any, args: Soshiki.MutationAddLibraryCategoryArgs, context: SoshikiContext, info: any) => await addLibraryCategory(context.token, args, parseResolveInfo(info)),
        AddLibraryCategories: async (_parent: any, args: Soshiki.MutationAddLibraryCategoriesArgs, context: SoshikiContext, info: any) => await addLibraryCategories(context.token, args, parseResolveInfo(info)),
        RemoveLibraryCategory: async (_parent: any, args: Soshiki.MutationRemoveLibraryCategoryArgs, context: SoshikiContext, info: any) => await removeLibraryCategory(context.token, args, parseResolveInfo(info)),
        RemoveLibraryCategories: async (_parent: any, args: Soshiki.MutationRemoveLibraryCategoriesArgs, context: SoshikiContext, info: any) => await removeLibraryCategories(context.token, args, parseResolveInfo(info)),
        SetHistoryEntry: async (_parent: any, args: Soshiki.MutationSetHistoryEntryArgs, context: SoshikiContext, info: any) => await setHistoryEntry(context.token, args, parseResolveInfo(info)),
        RemoveHistoryEntry: async (_parent: any, args: Soshiki.MutationRemoveHistoryEntryArgs, context: SoshikiContext, info: any) => await removeHistoryEntry(context.token, args, parseResolveInfo(info)),
    }
};

interface SoshikiContext {
    token: string
}

const server = new ApolloServer<SoshikiContext>({
    typeDefs: readFileSync("./src/schema.graphqls", { encoding: "utf-8" }),
    resolvers
});

(async () => {
    const { url } = await startStandaloneServer(server, {
        context: async ({ req }) => {
            return { token: req.headers.authorization?.substring("Bearer ".length) ?? '' }
        },
	listen: {
	    port: 3603
	}
    })
    console.log(url)
})()

function convertMediaType(mediaType: Soshiki.MediaType): string {
    switch (mediaType) {
        case Soshiki.MediaType.Text: return "novels";
        case Soshiki.MediaType.Image: return "manga";
        case Soshiki.MediaType.Video: return "anime";
    }
}

function getMediaType(mediaType: string): Soshiki.MediaType {
    switch (mediaType) {
        case "manga": return Soshiki.MediaType.Image;
        case "anime": return Soshiki.MediaType.Video;
        default: return Soshiki.MediaType.Text;
    }
}

function getTrackerStatus(status: number): Soshiki.TrackerStatus {
    switch (status) {
        case 1: return Soshiki.TrackerStatus.Planned;
        case 2: return Soshiki.TrackerStatus.Ongoing;
        case 3: return Soshiki.TrackerStatus.Completed;
        case 4: return Soshiki.TrackerStatus.Dropped;
        case 5: return Soshiki.TrackerStatus.Paused;
        default: return Soshiki.TrackerStatus.Unknown;
    }
} 

function convertTrackerStatus(status: Soshiki.TrackerStatus): number {
    switch (status) {
        case Soshiki.TrackerStatus.Unknown: return 0;
        case Soshiki.TrackerStatus.Planned: return 1;
        case Soshiki.TrackerStatus.Ongoing: return 2;
        case Soshiki.TrackerStatus.Completed: return 3;
        case Soshiki.TrackerStatus.Dropped: return 4;
        case Soshiki.TrackerStatus.Paused: return 5;
    }
}

function requiresField(info: any, field: string, prerequisite?: string, foundPrerequisite?: boolean): boolean {
    const fields = info.fieldsByTypeName;
    let _foundPrerequisite = foundPrerequisite ?? (typeof prerequisite !== 'undefined' ? false : undefined)
    if (!fields) return false;
    if (((typeof prerequisite !== 'undefined') === !!foundPrerequisite) && Object.keys(fields).includes(field)) return true;
    if (typeof prerequisite !== 'undefined' && Object.keys(fields).includes(prerequisite)) _foundPrerequisite = true;
    for (const typeName of Object.keys(fields)) {
        for (const _field of Object.keys(fields[typeName])) {
            if (requiresField(fields[typeName][_field], field, prerequisite, _foundPrerequisite)) return true;
        }
    }
    return false;
}

async function getUser(token: string, args: Soshiki.QueryUserArgs, info: any, client?: PoolClient): Promise<Soshiki.User | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = typeof args.id === 'string' ? args.id : await getUserId(token, client!)
    try {
        const result = (await client!.query(`select * from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        return {
            id: result.id,
            discord: result.discord,
            data: {
                ...result.data,
                history: typeof args.id !== 'string' && requiresField(info, "History") ? await getHistories(token, info, client) : null,
                library: typeof args.id !== 'string' && requiresField(info, "Library") ? await getLibraries(token, info, client) : null
            }
        }
    } catch (e) {
        return null
    }
}

async function getUsers(_token: string, args: Soshiki.QueryUsersArgs, info: any, client?: PoolClient): Promise<Soshiki.User[]> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    try {
        const results = (await client!.query(`select * from users where id = ANY($1)`, [args.ids])).rows
        if (typeof results === 'undefined') return [];
        return results.map(result => {
            return {
                id: result.id,
                discord: result.discord,
                data: {
                    mal: result.data?.mal,
                    anilist: result.data?.anilist
                }
            }
        })
    } catch (e) {
        return []
    }
}

async function getLibrary(token: string, args: Soshiki.QueryLibraryArgs, info: any, client?: PoolClient): Promise<Soshiki.Library | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        const library = result.data.library?.[convertMediaType(args.mediaType)]
        if (typeof library === 'undefined') return null;
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: Object.values(library).flatMap(id => id as string) }, info, client) : []
        return {
            categories: Object.entries(library).map(entry => {
                return {
                    entries: (entry[1] as any).map((id: any) => {
                        return {
                            id,
                            entry: entries.find(entry => entry.id === id) ?? null
                        }
                    }),
                    name: entry[0]
                }
            }),
            mediaType: args.mediaType
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function getLibraries(token: string, info: any, client?: PoolClient): Promise<Soshiki.Library[]> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return [];
        const libraries = result.data.library
        if (typeof libraries === 'undefined') return [];
        const requiresEntry = requiresField(info, "Entry")
        return await Promise.all(
            Object.entries(libraries).map(async library => {
                const entries = requiresEntry ? await getEntries(token, { mediaType: getMediaType(library[0]), ids: Object.values(library[1] as any).flatMap(id => id as string) }, info, client) : []
                return {
                    categories: Object.entries(library[1] as any).map(entry => {
                        return {
                            entries: (entry[1] as any).map((id: any) => {
                                return {
                                    id,
                                    entry: entries.find(entry => entry.id === id) ?? null
                                }
                            }),
                            name: entry[0]
                        }
                    }),
                    mediaType: getMediaType(library[0])
                }
            })
        )
    } catch (e) {
        return [];
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function getHistory(token: string, args: Soshiki.QueryHistoryArgs, info: any, client?: PoolClient): Promise<Soshiki.History | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        const history = result.data.history?.[convertMediaType(args.mediaType)]
        if (typeof history === 'undefined') return null;
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: history.map((entry: any) => entry.id) }, info, client) : []
        return {
            entries: (history as any).map((entry: any) => {
                return {
                    lastTime: entry.lastReadTime,
                    ...entry,
                    trackerIds: mapTrackers(entry.tracker_ids),
                    status: getTrackerStatus(entry.status),
                    entry: entries.find(item => item.id === entry.id) ?? null
                }
            }),
            mediaType: args.mediaType
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function getHistories(token: string, info: any, client?: PoolClient): Promise<Soshiki.History[]> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return [];
        const requiresEntry = requiresField(info, "Entry")
        return Promise.all(
            Object.entries(result.data.history).map(async history => {
                const entries = requiresEntry ? await getEntries(token, { mediaType: getMediaType(history[0]), ids: (history[1] as any).map((entry: any) => entry.id) }, info, client) : []
                return {
                    entries: (history[1] as any).map((entry: any) => {
                        return {
                            lastTime: entry.lastReadTime,
                            ...entry,
                            trackerIds: mapTrackers(entry.tracker_ids),
                            status: getTrackerStatus(entry.status),
                            entry: entries.find(item => item.id === entry.id) ?? null
                        }
                    }),
                    mediaType: getMediaType(history[0])
                }
            })
        )
    } catch (e) {
        return [];
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function getHistoryEntry(token: string, args: Soshiki.QueryHistoryEntryArgs, info: any, client?: PoolClient): Promise<Soshiki.HistoryEntry | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        const history = result.data.history?.[convertMediaType(args.mediaType)]
        if (typeof history === 'undefined') return null;
        const entry = history.find((item: any) => item.id === args.id)
        if (typeof entry !== 'object') return null;
        return {
            lastTime: entry.lastReadTime,
            ...entry,
            trackerIds: mapTrackers(entry.tracker_ids),
            status: getTrackerStatus(entry.status),
            entry: requiresField(info, "Entry") ? await getEntry(token, { mediaType: args.mediaType, id: args.id }, info, client) : undefined
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function getHistoryEntries(token: string, args: Soshiki.QueryHistoryEntriesArgs, info: any, client?: PoolClient): Promise<Soshiki.HistoryEntry[]> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return [];
        const history = result.data.history?.[convertMediaType(args.mediaType)]
        if (typeof history === 'undefined') return [];
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: args.ids }, info, client) : []
        return args.ids.map(id => {
            const entry = history.find((item: any) => item.id === id)
            if (typeof entry !== 'object') return null;
            return {
                lastTime: entry.lastReadTime,
                ...entry,
                trackerIds: mapTrackers(entry.tracker_ids),
                status: getTrackerStatus(entry.status),
                entry: entries.find(item => item.id === id) ?? null
            }
        })
    } catch (e) {
        return [];
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function getEmbeddedHistoryEntry(_token: string, mediaType: Soshiki.MediaType, id: string | null, _info: any, client: PoolClient, userId: string, userData?: any): Promise<Soshiki.EmbeddedHistoryEntry | null> {
    try {
        const result = userData ?? (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        const history = result.data.history?.[convertMediaType(mediaType)]
        if (typeof history === 'undefined') return null;
        const entry = history.find((item: any) => item.id === id)
        if (typeof entry !== 'object') return null;
        return {
            lastTime: entry.lastReadTime,
            ...entry,
            trackerIds: mapTrackers(entry.tracker_ids),
            status: getTrackerStatus(entry.status)
        }
    } catch (e) {
        return null;
    }
}

async function getEmbeddedHistoryEntries(_token: string, mediaType: Soshiki.MediaType, ids: (string | null)[], _info: any, client: PoolClient, userId: string, userData?: any): Promise<Soshiki.EmbeddedHistoryEntry[]> {
    try {
        const result = userData ?? (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return [];
        const history = result.data.history?.[convertMediaType(mediaType)]
        if (typeof history === 'undefined') return [];
        return ids.map(id => {
            const entry = history.find((item: any) => item.id === id)
            if (typeof entry !== 'object') return null;
            return {
                lastTime: entry.lastReadTime,
                ...entry,
                trackerIds: mapTrackers(entry.tracker_ids),
                status: getTrackerStatus(entry.status)
            }
        })
    } catch (e) {
        return [];
    }
}

async function getEntry(token: string, args: Soshiki.QueryEntryArgs, info: any, client?: PoolClient): Promise<Soshiki.Entry | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select * from ${convertMediaType(args.mediaType)} where id = $1`, [args.id])).rows[0]
        if (typeof result === 'undefined') return null;
        return {
            id: result.id,
            info: {
                ...result.info,
                altTitles: result.info.alt_titles,
                anilist: typeof result.info.anilist === 'undefined' ? undefined : mapAnilistEntry(result.info.anilist),
                mal: typeof result.info.mal === 'undefined' ? undefined : mapMALEntry(result.info.mal),
            },
            platforms: mapPlatforms(result.source_ids),
            trackers: mapTrackers(result.tracker_ids),
            history: typeof userId === 'string' && requiresField(info, "EmbeddedHistoryEntry") ? await getEmbeddedHistoryEntry(token, args.mediaType, args.id, info, client!, userId) : null
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function getEntries(token: string, args: Soshiki.QueryEntriesArgs, info: any, client?: PoolClient): Promise<Soshiki.Entry[]> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const results = (await client!.query(`select * from ${convertMediaType(args.mediaType)} where id = ANY($1)`, [args.ids])).rows
        if (typeof results === 'undefined') return [];
        const historyEntries = typeof userId === 'string' && requiresField(info, "EmbeddedHistoryEntry") ? await getEmbeddedHistoryEntries(token, args.mediaType, results.map(result => result.id), info, client!, userId) : []
        return Promise.all(
            results.map(async result => {
                return {
                    id: result.id,
                    info: {
                        ...result.info,
                        altTitles: result.info.alt_titles,
                        anilist: typeof result.info.anilist === 'undefined' ? undefined : mapAnilistEntry(result.info.anilist),
                        mal: typeof result.info.mal === 'undefined' ? undefined : mapMALEntry(result.info.mal),
                    },
                    platforms: mapPlatforms(result.source_ids),
                    trackers: mapTrackers(result.tracker_ids),
                    history: historyEntries.find(historyEntry => historyEntry.id === result.id)
                }
            })
        )
    } catch (e) {
        return [];
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function getLink(token: string, args: Soshiki.QueryLinkArgs, info: any, client?: PoolClient): Promise<Soshiki.EntryConnection | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    try {
        const result = (await client!.query(`select * from ${convertMediaType(args.mediaType)} where source_ids->$1->$2->>'id' = $3`, [args.platform, args.source, args.sourceId])).rows[0]
        if (typeof result === 'undefined') return null;
        return {
            id: result.id,
            entry: requiresField(info, "Entry") ? await getEntry(token, { mediaType: args.mediaType, id: result.id }, info, client) : null
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function getSearchResults(token: string, args: Soshiki.QuerySearchArgs, info: any, client?: PoolClient): Promise<Soshiki.Entry[]> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        let results = (await client!.query(`select * from ${convertMediaType(args.mediaType)} where info->>'title' ilike $1`, [`%${args.query}%`])).rows
        results = results.concat((await client!.query(`select * from ${convertMediaType(args.mediaType)} where info->>'title' ilike $1`, [`%${args.query}%`])).rows.filter(item => !results.find(result => result.id === item.id)))
        const historyEntries = typeof userId === 'string' && requiresField(info, "EmbeddedHistoryEntry") ? await getEmbeddedHistoryEntries(token, args.mediaType, results.map(result => result.id), info, client!, userId) : []
        return Promise.all(
            results.map(async result => {
                return {
                    id: result.id,
                    info: {
                        ...result.info,
                        altTitles: result.info.alt_titles,
                        anilist: typeof result.info.anilist === 'undefined' ? undefined : mapAnilistEntry(result.info.anilist),
                        mal: typeof result.info.mal === 'undefined' ? undefined : mapMALEntry(result.info.mal),
                    },
                    platforms: mapPlatforms(result.source_ids),
                    trackers: mapTrackers(result.tracker_ids),
                    history: historyEntries.find(historyEntry => historyEntry.id === result.id)
                }
            })
        )
    } catch (e) {
        return [];
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function getUserId(token: string, client: PoolClient): Promise<string | null> {
    try {
        const result = await client.query(`
            SELECT id FROM sessions WHERE access = $1
        `, [token]
        );
        return result.rows[0].id;
    } catch (e) {
        return null;
    }
}

function mapPlatforms(data: any): Soshiki.Platform[] {
    try {
        return Object.entries(data).map(platform => { return {
            name: platform[0],
            sources: Object.entries(platform[1] as object).map(source => { return {
                name: source[0],
                id: source[1].id as string,
                user: source[1].user as string
            }})
        }})
    } catch (e) {
        return []
    }
}

function mapTrackers(data: any): Soshiki.Tracker[] {
    try {
        return Object.entries(data).map(tracker => { return {
            name: tracker[0],
            id: tracker[1] as string
        }})
    } catch (e) {
        return []
    }
}

function mapUserTrackers(data: any): Soshiki.UserTracker[] {
    try {
        return Object.entries(data).map(tracker => { return {
            name: tracker[0],
            id: tracker[1] as string
        }})
    } catch (e) {
        return []
    }
}

function mapAnilistEntry(data: any): Soshiki.AnilistEntry | undefined {
    try {
        return {
            ...data,
            relations: data.relations?.nodes as any,
            characters: data.characters?.nodes as any,
            staff: data.staff?.nodes as any,
            studios: data.studios?.nodes as any,
            recommendations: data.recommendations?.nodes as any
        }
    } catch (e) {
        return undefined
    }
}

function mapMALEntry(data: any): Soshiki.MalEntry | undefined {
    try {
        return {
            ...data,
            mainPicture: data.main_picture as any,
            alternativeTitles: data.alternative_titles as any,
            startDate: data.start_date as any,
            endDate: data.end_date as any,
            numListUsers: data.num_list_users as any,
            numScoringUsers: data.num_scoring_users as any,
            createdAt: data.created_at as any,
            updatedAt: data.updated_at as any,
            mediaType: data.media_type as any,
            authors: data.authors?.map((author: any) => { return {
                info: {
                    id: author.node?.id,
                    firstName: author.node?.first_name,
                    lastName: author.node?.last_name
                },
                role: author.role
            }}) as any,
            relatedAnime: data.related_anime?.map((relation: any) => { return {
                node: {
                    ...relation.node,
                    mainPicture: relation.node?.main_picture
                },
                relationType: relation.relation_type,
                relationTypeFormatted: relation.relation_type_formatted
            }}) as any,
            relatedManga: data.related_manga?.map((relation: any) => { return {
                node: {
                    ...relation.node,
                    mainPicture: relation.node?.main_picture
                },
                relationType: relation.relation_type,
                relationTypeFormatted: relation.relation_type_formatted
            }}) as any,
            recommendations: data.recommendations?.map((relation: any) => { return {
                node: {
                    ...relation.node,
                    mainPicture: relation.node?.main_picture
                },
                numRecommendations: relation.num_recommendations
            }}) as any
        }
    } catch (e) {
        return undefined
    }
}

async function setLink(token: string, args: Soshiki.MutationSetLinkArgs, info: any, client?: PoolClient): Promise<Soshiki.EntryConnection | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    if (typeof userId !== 'string') return null
    try {
        let result = (await client!.query(`select * from ${convertMediaType(args.mediaType)} where id = $1`, [args.id])).rows[0]
        if (typeof result.source_ids[args.platform] === 'undefined') result.source_ids[args.platform] = {}
        result.source_ids[args.platform][args.source] = { id: args.sourceId, user: userId }
        await client!.query(`update ${convertMediaType(args.mediaType)} set source_ids = $1 where id = $2`, [result.source_ids, args.id])
        return {
            id: args.id,
            entry: {
                id: args.id,
                info: {
                    ...result.info,
                    altTitles: result.info.alt_titles,
                    anilist: typeof result.info.anilist === 'undefined' ? undefined : mapAnilistEntry(result.info.anilist),
                    mal: typeof result.info.mal === 'undefined' ? undefined : mapMALEntry(result.info.mal),
                },
                platforms: mapPlatforms(result.source_ids),
                trackers: mapTrackers(result.tracker_ids),
                history: requiresField(info, "EmbeddedHistoryEntry") ? await getEmbeddedHistoryEntry(token, args.mediaType, args.id, info, client!, userId) : null
            }
        }
    } catch (e) {
        return null
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function removeLink(token: string, args: Soshiki.MutationRemoveLinkArgs, info: any, client?: PoolClient): Promise<Soshiki.EntryConnection | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    if (typeof userId !== 'string') return null
    try {
        let result = (await client!.query(`select * from ${convertMediaType(args.mediaType)} where id = $1`, [args.id])).rows[0]
        if (typeof result.source_ids[args.platform] !== 'undefined') {
            delete result.source_ids[args.platform][args.source]
        }
        await client!.query(`update ${convertMediaType(args.mediaType)} set source_ids = $1 where id = $2`, [result.source_ids, args.id])
        return {
            id: args.id,
            entry: {
                id: args.id,
                info: {
                    ...result.info,
                    altTitles: result.info.alt_titles,
                    anilist: typeof result.info.anilist === 'undefined' ? undefined : mapAnilistEntry(result.info.anilist),
                    mal: typeof result.info.mal === 'undefined' ? undefined : mapMALEntry(result.info.mal),
                },
                platforms: mapPlatforms(result.source_ids),
                trackers: mapTrackers(result.tracker_ids),
                history: requiresField(info, "EmbeddedHistoryEntry") ? await getEmbeddedHistoryEntry(token, args.mediaType, args.id, info, client!, userId) : null
            }
        }
    } catch (e) {
        return null
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function addLibraryItem(token: string, args: Soshiki.MutationAddLibraryItemArgs, info: any, client?: PoolClient): Promise<Soshiki.Library | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        let data = result.data
        let library = data.library?.[convertMediaType(args.mediaType)]
        if (typeof library === 'undefined') library = {};
        if (typeof library[""] === 'undefined') library[""] = [] as string[]
        library[""].push(args.id)
        if (typeof args.category === 'string' && args.category !== "" && typeof library[args.category] !== 'undefined') library[args.category].push(args.id)
        data.library[convertMediaType(args.mediaType)] = library
        await client!.query(`update users set data = $1 where id = $2`, [data, userId])
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: Object.values(library).flatMap(id => id as string) }, info, client) : []
        return {
            categories: Object.entries(library).map(entry => {
                return {
                    entries: (entry[1] as any).map((id: any) => {
                        return {
                            id,
                            entry: entries.find(entry => entry.id === id) ?? null
                        }
                    }),
                    name: entry[0]
                }
            }),
            mediaType: args.mediaType
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function addLibraryItems(token: string, args: Soshiki.MutationAddLibraryItemsArgs, info: any, client?: PoolClient): Promise<Soshiki.Library | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        let data = result.data
        let library = data.library?.[convertMediaType(args.mediaType)]
        if (typeof library === 'undefined') return null;
        if (typeof library[""] === 'undefined') library[""] = [] as string[]
        for (const id of args.ids) {
            library[""].push(id)
            if (typeof args.category === 'string' && args.category !== "" && typeof library[args.category] !== 'undefined') library[args.category].push(id)
        }
        data.library[convertMediaType(args.mediaType)] = library
        await client!.query(`update users set data = $1 where id = $2`, [data, userId])
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: Object.values(library).flatMap(id => id as string) }, info, client) : []
        return {
            categories: Object.entries(library).map(entry => {
                return {
                    entries: (entry[1] as any).map((id: any) => {
                        return {
                            id,
                            entry: entries.find(entry => entry.id === id) ?? null
                        }
                    }),
                    name: entry[0]
                }
            }),
            mediaType: args.mediaType
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function removeLibraryItem(token: string, args: Soshiki.MutationRemoveLibraryItemArgs, info: any, client?: PoolClient): Promise<Soshiki.Library | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        let data = result.data
        let library = data.library?.[convertMediaType(args.mediaType)]
        if (typeof library === 'undefined') return null;
        for (const key of Object.keys(library)) {
            if (library[key].includes(args.id)) library[key].splice(library[key].indexOf(args.id), 1)
        }
        data.library[convertMediaType(args.mediaType)] = library
        await client!.query(`update users set data = $1 where id = $2`, [data, userId])
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: Object.values(library).flatMap(id => id as string) }, info, client) : []
        return {
            categories: Object.entries(library).map(entry => {
                return {
                    entries: (entry[1] as any).map((id: any) => {
                        return {
                            id,
                            entry: entries.find(entry => entry.id === id) ?? null
                        }
                    }),
                    name: entry[0]
                }
            }),
            mediaType: args.mediaType
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function removeLibraryItems(token: string, args: Soshiki.MutationRemoveLibraryItemsArgs, info: any, client?: PoolClient): Promise<Soshiki.Library | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        let data = result.data
        let library = data.library?.[convertMediaType(args.mediaType)]
        if (typeof library === 'undefined') return null;
        for (const id of args.ids) {
            for (const key of Object.keys(library)) {
                if (library[key].includes(id)) library[key].splice(library[key].indexOf(id), 1)
            }
        }
        data.library[convertMediaType(args.mediaType)] = library
        await client!.query(`update users set data = $1 where id = $2`, [data, userId])
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: Object.values(library).flatMap(id => id as string) }, info, client) : []
        return {
            categories: Object.entries(library).map(entry => {
                return {
                    entries: (entry[1] as any).map((id: any) => {
                        return {
                            id,
                            entry: entries.find(entry => entry.id === id) ?? null
                        }
                    }),
                    name: entry[0]
                }
            }),
            mediaType: args.mediaType
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function addLibraryItemToCategory(token: string, args: Soshiki.MutationAddLibraryItemToCategoryArgs, info: any, client?: PoolClient): Promise<Soshiki.Library | null> {
    if (args.category === "") return null;
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        let data = result.data
        let library = data.library?.[convertMediaType(args.mediaType)]
        if (typeof library === 'undefined') return null;
        if (typeof library[""] === 'undefined' || !library[""].includes(args.id)) return null;
        if (typeof library[args.category] === 'undefined') library[args.category] = [] as string[]
        library[args.category].push(args.id)
        data.library[convertMediaType(args.mediaType)] = library
        await client!.query(`update users set data = $1 where id = $2`, [data, userId])
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: Object.values(library).flatMap(id => id as string) }, info, client) : []
        return {
            categories: Object.entries(library).map(entry => {
                return {
                    entries: (entry[1] as any).map((id: any) => {
                        return {
                            id,
                            entry: entries.find(entry => entry.id === id) ?? null
                        }
                    }),
                    name: entry[0]
                }
            }),
            mediaType: args.mediaType
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function addLibraryItemsToCategory(token: string, args: Soshiki.MutationAddLibraryItemsToCategoryArgs, info: any, client?: PoolClient): Promise<Soshiki.Library | null> {
    if (args.category === "") return null;
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        let data = result.data
        let library = data.library?.[convertMediaType(args.mediaType)]
        if (typeof library === 'undefined') return null;
        for (const id of args.ids) {
            if (typeof library[""] === 'undefined' || !library[""].includes(id)) continue;
            if (typeof library[args.category] === 'undefined') library[args.category] = [] as string[]
            library[args.category].push(id)
        }
        data.library[convertMediaType(args.mediaType)] = library
        await client!.query(`update users set data = $1 where id = $2`, [data, userId])
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: Object.values(library).flatMap(id => id as string) }, info, client) : []
        return {
            categories: Object.entries(library).map(entry => {
                return {
                    entries: (entry[1] as any).map((id: any) => {
                        return {
                            id,
                            entry: entries.find(entry => entry.id === id) ?? null
                        }
                    }),
                    name: entry[0]
                }
            }),
            mediaType: args.mediaType
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function removeLibraryItemFromCategory(token: string, args: Soshiki.MutationRemoveLibraryItemFromCategoryArgs, info: any, client?: PoolClient): Promise<Soshiki.Library | null> {
    if (args.category === "") return null;
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        let data = result.data
        let library = data.library?.[convertMediaType(args.mediaType)]
        if (typeof library === 'undefined') return null;
        if (typeof library[""] === 'undefined' || !library[""].includes(args.id)) return null;
        if (typeof library[args.category] !== "undefined" && library[args.category].includes(args.id)) library[args.category].splice(library[args.category].indexOf(args.id), 1)
        data.library[convertMediaType(args.mediaType)] = library
        await client!.query(`update users set data = $1 where id = $2`, [data, userId])
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: Object.values(library).flatMap(id => id as string) }, info, client) : []
        return {
            categories: Object.entries(library).map(entry => {
                return {
                    entries: (entry[1] as any).map((id: any) => {
                        return {
                            id,
                            entry: entries.find(entry => entry.id === id) ?? null
                        }
                    }),
                    name: entry[0]
                }
            }),
            mediaType: args.mediaType
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function removeLibraryItemsFromCategory(token: string, args: Soshiki.MutationRemoveLibraryItemsFromCategoryArgs, info: any, client?: PoolClient): Promise<Soshiki.Library | null> {
    if (args.category === "") return null;
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        let data = result.data
        let library = data.library?.[convertMediaType(args.mediaType)]
        if (typeof library === 'undefined') return null;
        for (const id of args.ids) {
            if (typeof library[""] === 'undefined' || !library[""].includes(id)) continue;
            if (typeof library[args.category] !== "undefined" && library[args.category].includes(id)) library[args.category].splice(library[args.category].indexOf(id), 1)
        }
        data.library[convertMediaType(args.mediaType)] = library
        await client!.query(`update users set data = $1 where id = $2`, [data, userId])
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: Object.values(library).flatMap(id => id as string) }, info, client) : []
        return {
            categories: Object.entries(library).map(entry => {
                return {
                    entries: (entry[1] as any).map((id: any) => {
                        return {
                            id,
                            entry: entries.find(entry => entry.id === id) ?? null
                        }
                    }),
                    name: entry[0]
                }
            }),
            mediaType: args.mediaType
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function addLibraryCategory(token: string, args: Soshiki.MutationAddLibraryCategoryArgs, info: any, client?: PoolClient): Promise<Soshiki.Library | null> {
    if (args.name === "") return null;
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        let data = result.data
        let library = data.library?.[convertMediaType(args.mediaType)]
        if (typeof library === 'undefined') return null;
        library[args.name] = [] as string[]
        data.library[convertMediaType(args.mediaType)] = library
        await client!.query(`update users set data = $1 where id = $2`, [data, userId])
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: Object.values(library).flatMap(id => id as string) }, info, client) : []
        return {
            categories: Object.entries(library).map(entry => {
                return {
                    entries: (entry[1] as any).map((id: any) => {
                        return {
                            id,
                            entry: entries.find(entry => entry.id === id) ?? null
                        }
                    }),
                    name: entry[0]
                }
            }),
            mediaType: args.mediaType
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function addLibraryCategories(token: string, args: Soshiki.MutationAddLibraryCategoriesArgs, info: any, client?: PoolClient): Promise<Soshiki.Library | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        let data = result.data
        let library = data.library?.[convertMediaType(args.mediaType)]
        if (typeof library === 'undefined') return null;
        for (const name of args.names) {
            if (name === "") continue;
            library[name] = [] as string[]
        }
        data.library[convertMediaType(args.mediaType)] = library
        await client!.query(`update users set data = $1 where id = $2`, [data, userId])
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: Object.values(library).flatMap(id => id as string) }, info, client) : []
        return {
            categories: Object.entries(library).map(entry => {
                return {
                    entries: (entry[1] as any).map((id: any) => {
                        return {
                            id,
                            entry: entries.find(entry => entry.id === id) ?? null
                        }
                    }),
                    name: entry[0]
                }
            }),
            mediaType: args.mediaType
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function removeLibraryCategory(token: string, args: Soshiki.MutationRemoveLibraryCategoryArgs, info: any, client?: PoolClient): Promise<Soshiki.Library | null> {
    if (args.name === "") return null;
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        let data = result.data
        let library = data.library?.[convertMediaType(args.mediaType)]
        if (typeof library === 'undefined') return null;
        delete library[args.name]
        data.library[convertMediaType(args.mediaType)] = library
        await client!.query(`update users set data = $1 where id = $2`, [data, userId])
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: Object.values(library).flatMap(id => id as string) }, info, client) : []
        return {
            categories: Object.entries(library).map(entry => {
                return {
                    entries: (entry[1] as any).map((id: any) => {
                        return {
                            id,
                            entry: entries.find(entry => entry.id === id) ?? null
                        }
                    }),
                    name: entry[0]
                }
            }),
            mediaType: args.mediaType
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function removeLibraryCategories(token: string, args: Soshiki.MutationRemoveLibraryCategoriesArgs, info: any, client?: PoolClient): Promise<Soshiki.Library | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        let data = result.data
        let library = data.library?.[convertMediaType(args.mediaType)]
        if (typeof library === 'undefined') return null;
        for (const name of args.names) {
            if (name === "") continue;
            delete library[name]
        }
        data.library[convertMediaType(args.mediaType)] = library
        await client!.query(`update users set data = $1 where id = $2`, [data, userId])
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: Object.values(library).flatMap(id => id as string) }, info, client) : []
        return {
            categories: Object.entries(library).map(entry => {
                return {
                    entries: (entry[1] as any).map((id: any) => {
                        return {
                            id,
                            entry: entries.find(entry => entry.id === id) ?? null
                        }
                    }),
                    name: entry[0]
                }
            }),
            mediaType: args.mediaType
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function setHistoryEntry(token: string, args: Soshiki.MutationSetHistoryEntryArgs, info: any, client?: PoolClient): Promise<Soshiki.HistoryEntry | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        let data = result.data
        let history = data.history?.[convertMediaType(args.mediaType)]
        if (typeof history === 'undefined') history = [];
        const entryIndex = history.findIndex((item: any) => item.id === args.id)
        if (entryIndex === -1) {
            const entry = {
                id: args.id,
                page: args.page,
                rating: args.rating,
                status: convertTrackerStatus(args.status ?? Soshiki.TrackerStatus.Unknown),
                chapter: args.chapter,
                volume: args.volume,
                timestamp: args.timestamp,
                episode: args.episode,
                startTime: args.startTime,
                lastTime: args.lastTime,
                tracker_ids: args.trackers?.reduce((obj, value) => { obj[value.name] = value.id; return obj }, {} as {[key: string]: string})
            }
            history.push(entry)
            data.history[convertMediaType(args.mediaType)] = history
            await client!.query(`update users set data = $1 where id = $2`, [data, userId])
            return {
                ...entry,
                trackerIds: mapUserTrackers(entry.tracker_ids),
                status: getTrackerStatus(entry.status),
                entry: requiresField(info, "Entry") ? await getEntry(token, { mediaType: args.mediaType, id: args.id }, info, client) : undefined
            }
        }
        let entry = history[entryIndex]
        for (const tracker of args.trackers ?? []) {
            entry.tracker_ids[tracker.name] = tracker.id
        }
        if (typeof args.status !== 'undefined' && args.status !== null) entry.status = convertTrackerStatus(args.status)
        for (const property of Object.entries(args).filter(item => !(["trackers", "id", "mediaType", "status"].includes(item[0])))) {
            entry[property[0]] = property[1]
        }
        history[entryIndex] = entry
        data.history[convertMediaType(args.mediaType)] = history
        await client!.query(`update users set data = $1 where id = $2`, [data, userId])
        return {
            lastTime: entry.lastReadTime,
            ...entry,
            trackerIds: mapUserTrackers(entry.tracker_ids),
            status: getTrackerStatus(entry.status),
            entry: requiresField(info, "Entry") ? await getEntry(token, { mediaType: args.mediaType, id: args.id }, info, client) : undefined
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}

async function removeHistoryEntry(token: string, args: Soshiki.MutationRemoveHistoryEntryArgs, info: any, client?: PoolClient): Promise<Soshiki.History | null> {
    const clientRequiresClosing = typeof client === 'undefined'
    if (clientRequiresClosing) client = await pool.connect();
    const userId = await getUserId(token, client!)
    try {
        const result = (await client!.query(`select data from users where id = $1`, [userId])).rows[0]
        if (typeof result === 'undefined') return null;
        let data = result.data
        let history = data.history?.[convertMediaType(args.mediaType)]
        if (typeof history === 'undefined') return null;
        const entryIndex = history.findIndex((entry: any) => entry.id === args.id)
        if (entryIndex !== -1) history.splice(entryIndex, 1)
        data.history[convertMediaType(args.mediaType)] = history
        await client!.query(`update users set data = $1 where id = $2`, [data, userId])
        const entries = requiresField(info, "Entry") ? await getEntries(token, { mediaType: args.mediaType, ids: history.map((entry: any) => entry.id) }, info, client) : []
        return {
            entries: (history as any).map((entry: any) => {
                return {
                    lastTime: entry.lastReadTime,
                    ...entry,
                    trackerIds: mapTrackers(entry.tracker_ids),
                    status: getTrackerStatus(entry.status),
                    entry: entries.find(item => item.id === entry.id) ?? null
                }
            }),
            mediaType: args.mediaType
        }
    } catch (e) {
        return null;
    } finally {
        if (clientRequiresClosing) client!.release();
    }
}
