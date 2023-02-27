import { MongoClient, Collection } from "mongodb"
import MUUID from "uuid-mongodb";
import { Entry, History, Library, LibraryCategory, MediaType } from "soshiki-types"
import { config } from "dotenv"
import crypto from "crypto"

config();

export type TestflightUser = {
    discord: string,
    email: string,
    id: string
}

type EntryCollections = {
    text: Collection,
    image: Collection,
    video: Collection
}

export type DatabaseEntry = Entry & {
    _id: MUUID.MUUID
}

export type Histories = {
    text: History[],
    image: History[],
    video: History[]
}

export type FullLibrary = {
    all: Library,
    categories: LibraryCategory[]
}

export type Libraries = {
    text: FullLibrary,
    image: FullLibrary,
    video: FullLibrary
}

export type Connection = {
    id: string,
    name: string,
    userId: string,
    userName: string,
    access: string,
    refresh: string,
    expiresIn: number
}

export type User = {
    _id: MUUID.MUUID,
    discord: string,
    histories?: Histories,
    isHistoryPublic: boolean,
    libraries?: Libraries,
    isLibraryPublic: boolean,
    connections?: Connection[],
    devices?: Device[],
    trackers?: UserTrackers
}

export type DatabaseUser = {
    _id: MUUID.MUUID,
    discord: string,
    histories: Histories,
    isHistoryPublic: boolean,
    libraries: Libraries,
    isLibraryPublic: boolean,
    connections: Connection[],
    devices?: Device[],
    trackers?: UserTrackers
}

export type Device = {
    id: string,
    badge: number,
    notifications: UserNotifications
}

export type UserNotifications = {
    text: UserNotification[],
    image: UserNotification[],
    video: UserNotification[]
}

export type UserNotification = {
    id: string,
    source: string
}

export type UserTrackers = {
    text: UserTracker[],
    image: UserTracker[],
    video: UserTracker[]
}

export type UserTracker = {
    id: string
    entryId: string
}

export class Database {
    entries: EntryCollections
    users: Collection
    testflight: Collection
    client: MongoClient

    private constructor(client: MongoClient, entries: EntryCollections, users: Collection, testflight: Collection) {
        this.client = client
        this.entries = entries
        this.users = users
        this.testflight = testflight
    }

    static async connect(): Promise<Database> {
        console.log(`Attempting to connect to database at '${process.env.DB_CONN_STRING!}'...`)
        const client = new MongoClient(process.env.DB_CONN_STRING!)
        await client.connect().catch(console.error)
        console.log(`Successfully connected.`)
        const db = client.db(process.env.DB_NAME!)
        console.log(`Connected to database '${db.databaseName}'.`)
        return new Database(client, {
            text: db.collection(process.env.TEXT_COLLECTION_NAME!),
            image: db.collection(process.env.IMAGE_COLLECTION_NAME!),
            video: db.collection(process.env.VIDEO_COLLECTION_NAME!)
        }, db.collection(process.env.USERS_COLLECTION_NAME!), db.collection(process.env.TESTFLIGHT_COLLECTION_NAME!))
    }

    collectionForType(mediaType: MediaType): Collection {
        switch (mediaType) {
            case MediaType.TEXT: return this.entries.text
            case MediaType.IMAGE: return this.entries.image
            case MediaType.VIDEO: return this.entries.video
        }
    }

    async addUser(discord: string): Promise<DatabaseUser> {
        const user: DatabaseUser = {
            _id: MUUID.from(crypto.randomUUID()) as any,
            discord,
            histories: { text: [], image: [], video: [] },
            isHistoryPublic: false,
            libraries: { text: { all: { ids: [] }, categories: [] }, image: { all: { ids: [] }, categories: [] }, video: { all: { ids: [] }, categories: [] } },
            isLibraryPublic: false,
            connections: [],
            devices: [],
            trackers: { text: [], image: [], video: [] }
        }
        await this.users.insertOne(user as any)
        return user
    }

    async getUser(query: { _id?: MUUID.MUUID, discord?: string }): Promise<DatabaseUser | null> {
        return (await this.users.findOne(query)) as any as (DatabaseUser | null)
    }

    async setUser(data: DatabaseUser) {
        await this.users.updateOne({ _id: data._id }, { $set: data })
    }

    async addDatabaseEntry(mediaType: MediaType, entry: Entry) {
        await this.collectionForType(mediaType).insertOne({ _id: MUUID.from(crypto.randomUUID()) as any, ...entry })
    }

    async addDatabaseEntries(mediaType: MediaType, entries: Entry[]) {
        await this.collectionForType(mediaType).insertMany(entries.map(entry => ({ _id: MUUID.from(crypto.randomUUID()) as any, ...entry })))
    }

    async setDatabaseEntry(mediaType: MediaType, entry: DatabaseEntry) {
        await this.collectionForType(mediaType).updateOne({ _id: entry._id }, { $set: entry })
    }

    async setDatabaseEntryByQuery(mediaType: MediaType, query: {[key: string]: any}, entry: Entry) {
        await this.collectionForType(mediaType).updateOne(query, { $set: entry })
    }

    async getDatabaseEntry(query: {[key: string]: any}, mediaType: MediaType): Promise<DatabaseEntry | null> {
        return (await this.collectionForType(mediaType).findOne(query)) as any as (DatabaseEntry | null)
    }

    async getDatabaseEntries(query: {[key: string]: any}, mediaType: MediaType, limit: number = 100): Promise<DatabaseEntry[]> {
        return (await this.collectionForType(mediaType).find(query).limit(limit).toArray()) as any as DatabaseEntry[]
    }

    async aggregateDatabaseEntries(pipeline: {[key: string]: any}[], mediaType: MediaType, limit: number = 100, skip: number = 0): Promise<DatabaseEntry[]> {
        return (await this.collectionForType(mediaType).aggregate(pipeline).skip(skip).limit(limit).toArray()) as any as DatabaseEntry[]
    }

    async getTestflightUser(discord: string | undefined, id: string | undefined): Promise<TestflightUser | null> {
        const query: {[key: string]: string} = {}
        if (typeof discord === 'string') query['discord'] = discord
        if (typeof id === 'string') query['id'] = id
        return await this.testflight.findOne(query) as any as TestflightUser
    }

    async addTestflightUser(discord: string, email: string, id: string): Promise<void> {
        await this.testflight.insertOne({ discord, email, id })
    }

    async removeTestflightUser(discord: string | undefined, id: string | undefined): Promise<void> {
        const query: {[key: string]: string} = {}
        if (typeof discord === 'string') query['discord'] = discord
        if (typeof id === 'string') query['id'] = id
        await this.testflight.deleteOne(query)
    }

    async close() {
        await this.client.close()
    }
}