import express from "express"
import { Database, User, UserNotification, UserTracker } from "soshiki-database-new"
import { Entry, History, LibraryCategory, MediaType } from "soshiki-types"
import MUUID from "uuid-mongodb"
import { config } from "dotenv"
import jwt from "jsonwebtoken"
import { readFileSync } from "fs"
import { join } from "path"
import fetch from "node-fetch"

const CURRENT_URL = 'https://api.soshiki.moe'

const PUBLIC_PATHS = ["/entry", "/oauth2", "/user"]
const PUBLIC_PATH_OVERRIDES = ["/user/me"]

const PRIVATE_KEY = readFileSync("./jwtRS256.key")
const PUBLIC_KEY = readFileSync("./jwtRS256.key.pub")

const EXPIRY_BUFFER = 3000 // give five minutes less than discord's access

const manifest = JSON.parse(readFileSync(join(__filename, '..', '..', '..', 'manifest.json'), 'utf8'))

config()

let database: Database

const app = express()

app.use(express.json())

app.use(async (req, res, next) => {
    if (typeof req.params["mediaType"] === 'string' && req.params["mediaType"].toUpperCase() !== 'TEXT' && req.params["mediaType"].toUpperCase() !== 'IMAGE' && req.params["mediaType"].toUpperCase() !== 'VIDEO') {
        res.status(400).send("Invalid mediaType")
        return
    }
    next()
})

app.use(async (req, res, next) => {
    try {
        if (req.method === 'GET' && PUBLIC_PATHS.some(path => req.path.startsWith(path)) && !PUBLIC_PATH_OVERRIDES.some(path => req.path.startsWith(path))) {
            next()
            return
        }
        const bearer = req.headers.authorization
        if (typeof bearer !== 'string' || !bearer.startsWith('Bearer ')) {
            res.status(401).send("No bearer token provided.")
            return
        }
        const verified = jwt.verify(bearer.substring('Bearer '.length), PUBLIC_KEY) as any;
        console.log("YOU" + JSON.stringify(verified, null, 2))
        if (typeof verified?.access === 'undefined') {
            res.status(401).send("Incorrect bearer token provided.")
            return
        }
        (req as any).userId = verified.id
        next()
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {res.status(401).send("Token has expired.")
        console.log("token expired")
    }
        else if (error instanceof jwt.NotBeforeError) res.status(401).send("Token is not active.")
        else if (error instanceof jwt.JsonWebTokenError) res.status(401).send("Token is invalid.")
        else res.status(500).send()
    }
})

function mediaType(mediaType: string): MediaType | undefined {
    switch (mediaType.toUpperCase()) {
        case 'TEXT': return MediaType.TEXT
        case 'IMAGE': return MediaType.IMAGE
        case 'VIDEO': return MediaType.VIDEO
    }
}

function isValidStatus(status: string) {
    return status.toUpperCase() === Entry.Status.CANCELLED || status.toUpperCase() === Entry.Status.COMPLETED || status.toUpperCase() === Entry.Status.HIATUS || status.toUpperCase() === Entry.Status.RELEASING || status.toUpperCase() === Entry.Status.UNKNOWN || status.toUpperCase() === Entry.Status.UNRELEASED
}

function isValidHistoryStatus(status: string) {
    return status.toUpperCase() === History.Status.COMPLETED || status.toUpperCase() === History.Status.DROPPED || status.toUpperCase() === History.Status.IN_PROGRESS || status.toUpperCase() === History.Status.PAUSED || status.toUpperCase() === History.Status.PLANNED || status.toUpperCase() === History.Status.UNKNOWN
}

function isValidContentRating(contentRating: string) {
    return contentRating.toUpperCase() === Entry.ContentRating.SAFE || contentRating.toUpperCase() === Entry.ContentRating.SUGGESTIVE || contentRating.toUpperCase() === Entry.ContentRating.NSFW || contentRating.toUpperCase() === Entry.ContentRating.UNKNOWN
}

{ // entry
    app.get("/entry/:mediaType/link", async (req, res) => {
        if (typeof req.query.entryId !== 'string' ) {
            res.status(400).send("Missing query field.")
            return
        }
        let limit = (!isNaN(parseInt(req.query.limit as string))) ? parseInt(req.query.limit as string) : 100
        let offset = (!isNaN(parseInt(req.query.offset as string))) ? parseInt(req.query.offset as string) : 0
        if (limit <= 0 || limit > 100) {
            res.status(400).send("Limit must be between 1 and 100.")
            return
        } else if (offset < 0) {
            res.status(400).send("Offset must be positive.")
            return
        }
        if (typeof req.query.platformId === 'string' && typeof req.query.sourceId === 'string') {
            const entries = await database.aggregateDatabaseEntries([
                { $match: { platforms: { $elemMatch: { id: req.query.platformId as string } } } },
                { $match: { platforms: { $elemMatch: { sources: { $elemMatch: { $and: [
                    { id: req.query.sourceId as string },
                    { entryId: req.query.entryId as string }
                ] } } } } } }
            ], mediaType(req.params.mediaType)!, limit, offset)
            res.status(200).send(entries)
        } else if (typeof req.query.trackerId === 'string') {
            const entries = await database.aggregateDatabaseEntries([
                { $match: { trackers: { $elemMatch: { $and: [
                    { id: req.query.trackerId as string },
                    { entryId: req.query.entryId as string }
                ] } } } }
            ], mediaType(req.params.mediaType)!, limit, offset)
            res.status(200).send(entries)
        } else {
            res.status(400).send("Missing query field")
        }
    })

    app.get("/entry/:mediaType/:id", async (req, res) => {
        try {
            const entry = await database.getDatabaseEntry({ _id: MUUID.from(req.params.id) }, mediaType(req.params.mediaType)!)
            if (entry === null) {
                res.status(404).send("Entry not found")
                return
            }
            res.status(200).send(entry)
        } catch(error) {
            console.error(error)
            res.status(500).send()
        }
    })

    app.get("/entry/:mediaType", async (req, res) => {
        let limit = 100
        let offset = 0
        try {
            let pipeline: {[key: string]: any}[] = []
            for (const param of Object.entries(req.query)) {
                switch(param[0]) {
                    case "title": pipeline = [{ $match: { $text: { $search: param[1] as string } } }, { $set: { _score: { $meta: 'textScore' } } }, { $sort: { _score: { $meta: 'textScore' } } }, { $unset: '_score' }, ...pipeline]; break
                    case "ids": pipeline.push({ $match: { _id: { $in: (param[1] as string[]).map(MUUID.from) } } }); break
                    case "status": if ((param[1] as string[]).filter(isValidStatus).length > 0) pipeline.push({ $match: { status: { $in: (param[1] as string[]).filter(isValidStatus).map(status => status.toUpperCase()) } } }); break
                    case "contentRating": if ((param[1] as string[]).filter(isValidContentRating).length > 0) pipeline.push({ $match: { contentRating: { $in: (param[1] as string[]).filter(isValidContentRating).map(contentRating => contentRating.toUpperCase()) } } }); break
                    case "limit": if (!isNaN(parseInt(param[1] as string))) limit = parseInt(param[1] as string); break
                    case "offset": if (!isNaN(parseInt(param[1] as string))) offset = parseInt(param[1] as string); break
                }
            }
            if (limit <= 0 || limit > 100) {
                res.status(400).send("Limit must be between 1 and 100.")
                return
            } else if (offset < 0) {
                res.status(400).send("Offset must be positive.")
                return
            }
            const entries = await database.aggregateDatabaseEntries(pipeline, mediaType(req.params.mediaType)!, limit, offset)
            res.status(200).send(entries)
        } catch(error) {
            console.error(error)
            res.status(500).send()
        }
    })

    app.put("/entry/:mediaType/:id/link", async (req, res) => {
        try {
            if (typeof req.query.entryId !== 'string' || typeof req.query.platformId !== 'string' || typeof req.query.platformName !== 'string' || typeof req.query.sourceId !== 'string' || typeof req.query.sourceName !== 'string') {
                res.status(400).send("Missing query field.")
                return
            }
            const bearer = req.headers.authorization
            if (typeof bearer !== 'string' || !bearer.startsWith('Bearer ')) {
                res.status(401).send("No bearer token provided.")
                return
            }
            const verified = jwt.verify(bearer.substring('Bearer '.length), PUBLIC_KEY) as any
            const entry = await database.getDatabaseEntry({ _id: MUUID.from(req.params.id) }, mediaType(req.params.mediaType)!)
            if (entry === null) {
                res.status(404).send("Entry not found")
                return
            }
            const newLink = {
                id: req.query.sourceId,
                name: req.query.sourceName,
                entryId: req.query.entryId,
                user: verified.id
            }
            const platformIndex = entry.platforms.findIndex(platform => platform.id === req.query.platformId)
            if (platformIndex === -1) {
                entry.platforms.push({
                    id: req.query.platformId as string,
                    name: req.query.platformName as string,
                    sources: [newLink]
                })
            } else {
                const sourceIndex = entry.platforms[platformIndex].sources.findIndex(source => source.id === req.query.sourceId)
                if (sourceIndex === -1) {
                    entry.platforms[platformIndex].sources.push(newLink)
                } else {
                    entry.platforms[platformIndex].sources[sourceIndex] = newLink
                }
            }
            await database.setDatabaseEntry(mediaType(req.params.mediaType)!, entry)
            res.status(200).send()
        } catch(error) {
            if (error instanceof jwt.TokenExpiredError) res.status(401).send("Token has expired.")
            else if (error instanceof jwt.NotBeforeError) res.status(401).send("Token is not active.")
            else if (error instanceof jwt.JsonWebTokenError) res.status(401).send("Token is invalid.")
            else res.status(500).send()
            console.error(error)
        }
    })
}

{ // user
    app.get("/user/:id", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from(req.params.id === 'me' ? (req as any).userId : req.params.id) }) as User
        if (user === null) {
            res.status(404).send("No user found.")
            return
        }
        const includes = (req.query.includes ?? []) as string[]
        const isReferencingSelf = req.params.id === 'me' || req.params.id === (req as any).userId
        if ((!isReferencingSelf && !user.isHistoryPublic) || !includes.includes('history')) delete user.histories
        if ((!isReferencingSelf && !user.isLibraryPublic) || !includes.includes('library')) delete user.libraries
        if (!isReferencingSelf || !includes.includes('connections')) delete user.connections
        if (!isReferencingSelf || !includes.includes('devices')) delete user.devices
        if (!isReferencingSelf || !includes.includes('trackers')) delete user.trackers
        res.status(200).send({ ...user, _id: user._id.toString() })
    })
}

{ // history 
    app.get("/history/:mediaType/:entryId", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const history = (user.histories as any)[req.params.mediaType.toLowerCase()].find((history: History) => history.id === req.params.entryId)
        if (typeof history === 'undefined') {
            res.status(404).send()
            return
        }
        res.status(200).send(history)
    })

    app.get("/history/:mediaType", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const history = (user.histories as any)[req.params.mediaType.toLowerCase()]
        res.status(200).send(history)
    })

    app.get("/history", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const history = user.histories
        res.status(200).send(history)
    })

    app.put("/history/:mediaType/:entryId", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const newHistory: {[key: string]: any} = {
            id: req.params.entryId,
            status: History.Status.UNKNOWN
        }
        for (const param of Object.entries(req.query)) {
            switch (param[0]) {
                case 'page': if (typeof param[1] === 'string' && !isNaN(parseInt(param[1]))) newHistory.page = parseInt(param[1]); break
                case 'chapter': if (typeof param[1] === 'string' && !isNaN(parseFloat(param[1]))) newHistory.chapter = parseFloat(param[1]); break
                case 'volume': if (typeof param[1] === 'string' && !isNaN(parseFloat(param[1]))) newHistory.volume = parseFloat(param[1]); break
                case 'timestamp': if (typeof param[1] === 'string' && !isNaN(parseInt(param[1]))) newHistory.timestamp = parseInt(param[1]); break
                case 'episode': if (typeof param[1] === 'string' && !isNaN(parseFloat(param[1]))) newHistory.episode = parseFloat(param[1]); break
                case 'percent': if (typeof param[1] === 'string' && !isNaN(parseFloat(param[1]))) newHistory.percent = parseFloat(param[1]); break
                case 'score': if (typeof param[1] === 'string' && !isNaN(parseFloat(param[1]))) newHistory.score = parseFloat(param[1]); break
                case 'status': if (typeof param[1] === 'string' && isValidHistoryStatus(param[1])) newHistory.status = param[1].toUpperCase()
            }
        }
        const historyIndex = (user.histories as any)[req.params.mediaType.toLowerCase()].findIndex((item: History) => item.id === req.params.entryId)
        if (historyIndex === -1) {
            (user.histories as any)[req.params.mediaType.toLowerCase()].push(newHistory)
        } else {
            (user.histories as any)[req.params.mediaType.toLowerCase()][historyIndex] = { ...(user.histories as any)[req.params.mediaType.toLowerCase()][historyIndex], ...newHistory }
        }
        await database.setUser(user)
        res.status(200).send()
    })

    app.delete("/history/:mediaType/:entryId", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const historyIndex = (user.histories as any)[req.params.mediaType.toLowerCase()].findIndex((history: History) => history.id === req.params.entryId)
        if (historyIndex !== -1) {
            (user.histories as any)[req.params.mediaType.toLowerCase()].splice(historyIndex, 1)
        }
        await database.setUser(user)
        res.status(200).send()
    })
}

{ // library
    app.get("/library/:mediaType/category/:category", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const library = ((user.libraries as any)[req.params.mediaType.toLowerCase()].categories as LibraryCategory[]).find(category => category.id === req.params.category)
        if (library === null) {
            res.status(404).send()
            return
        }
        res.status(200).send(library)
    })
    app.get("/library/:mediaType/all", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const library = (user.libraries as any)[req.params.mediaType.toLowerCase()].all
        res.status(200).send(library)
    })
    app.get("/library/:mediaType", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const library = (user.libraries as any)[req.params.mediaType.toLowerCase()]
        res.status(200).send(library)
    })
    app.get("/library", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const library = user.libraries
        res.status(200).send(library)
    })
    app.put("/library/:mediaType/category/:category/:id", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const libraryIndex = ((user.libraries as any)[req.params.mediaType.toLowerCase()].categories as LibraryCategory[]).findIndex(category => category.id === req.params.category)
        if (libraryIndex === -1) {
            res.status(400).send("Category does not exist.")
            return
        }
        const entry = await database.getDatabaseEntry({ _id: MUUID.from(req.params.id) }, mediaType(req.params.mediaType)!)
        if (entry === null) {
            res.status(400).send("Entry does not exist.")
            return
        }
        ((user.libraries as any)[req.params.mediaType.toLowerCase()].categories as LibraryCategory[])[libraryIndex].ids.push(req.params.id);
        (user.libraries as any)[req.params.mediaType.toLowerCase()].all.ids.push(req.params.id)
        await database.setUser(user)
        res.status(200).send()
    })

    app.put("/library/:mediaType/all/:id", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const entry = await database.getDatabaseEntry({ _id: MUUID.from(req.params.id) }, mediaType(req.params.mediaType)!)
        if (entry === null) {
            res.status(400).send("Entry does not exist.")
            return
        }
        (user.libraries as any)[req.params.mediaType.toLowerCase()].all.ids.push(req.params.id)
        await database.setUser(user)
        res.status(200).send()
    })

    app.put("/library/:mediaType/category/:category", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        if (typeof req.query.name !== 'string') {
            res.status(400).send("Invalid category name.")
            return
        }
        const libraryIndex = ((user.libraries as any)[req.params.mediaType.toLowerCase()].categories as LibraryCategory[]).findIndex(category => category.id === req.params.category)
        if (libraryIndex === -1) {
            ((user.libraries as any)[req.params.mediaType.toLowerCase()].categories as LibraryCategory[]).push({ id: req.params.category, name: req.query.name as string, ids: [] })
        } else {
            ((user.libraries as any)[req.params.mediaType.toLowerCase()].categories as LibraryCategory[])[libraryIndex] = { id: req.params.category, name: req.query.name as string, ids: [] }
        }
        await database.setUser(user)
        res.status(200).send()
    })

    app.delete("/library/:mediaType/category/:category", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const libraryIndex = ((user.libraries as any)[req.params.mediaType.toLowerCase()].categories as LibraryCategory[]).findIndex(category => category.id === req.params.category)
        if (libraryIndex !== -1) {
            ((user.libraries as any)[req.params.mediaType.toLowerCase()].categories as LibraryCategory[]).splice(libraryIndex, 1)
        }
        await database.setUser(user)
        res.status(200).send()
    })

    app.delete("/library/:mediaType/category/:category/:id", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const libraryIndex = ((user.libraries as any)[req.params.mediaType.toLowerCase()].categories as LibraryCategory[]).findIndex(category => category.id === req.params.category)
        if (libraryIndex === -1) {
            res.status(400).send("Invalid category.")
            return
        }
        const entryIndex = ((user.libraries as any)[req.params.mediaType.toLowerCase()].categories as LibraryCategory[])[libraryIndex].ids.findIndex(id => id === req.params.id)
        if (entryIndex !== -1) {
            ((user.libraries as any)[req.params.mediaType.toLowerCase()].categories as LibraryCategory[])[libraryIndex].ids.splice(entryIndex, 1)
            const allEntryIndex = (user.libraries as any)[req.params.mediaType.toLowerCase()].all.ids.findIndex((id: string) => id === req.params.id)
            if (allEntryIndex !== -1) {
                (user.libraries as any)[req.params.mediaType.toLowerCase()].all.ids.splice(allEntryIndex, 1)
            }
        }
        await database.setUser(user)
        res.status(200).send()
    })

    app.delete("/library/:mediaType/all/:id", async (req, res) => {
        const user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const entryIndex = (user.libraries as any)[req.params.mediaType.toLowerCase()].all.ids.findIndex((id: string) => id === req.params.id)
        if (entryIndex !== -1) {
            (user.libraries as any)[req.params.mediaType.toLowerCase()].all.ids.splice(entryIndex, 1)
        }
        await database.setUser(user)
        res.status(200).send()
    })
}

{ // oauth2
    app.get("/oauth2/redirect", async (req, res) => {
        if (typeof req.query.code !== 'string') {
            res.status(400).send()
            return
        }
        const data = await fetch(`https://discord.com/api/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=authorization_code&code=${req.query.code}&redirect_uri=${encodeURIComponent(CURRENT_URL + '/oauth2/redirect')}&client_id=${manifest.discord.client.id!}&client_secret=${manifest.discord.client.secret!}`
        }).then(res => res.json())
        const user = await fetch(`https://discord.com/api/users/@me`, { headers: { Authorization: `Bearer ${data.access_token}` } }).then(res => res.json())
        let dbUser = await database.getUser({ discord: user.id })
        if (dbUser === null) dbUser = await database.addUser(user.id)
        const generatedAccess = jwt.sign({ 
            id: dbUser._id.toString(),
            discord: user.id,
            access: data.access_token
        }, PRIVATE_KEY, {
            algorithm: 'RS256',
            expiresIn: data.expires_in - EXPIRY_BUFFER
        })
        const generatedRefresh = jwt.sign({ 
            id: dbUser._id.toString(),
            discord: user.id,
            refresh: data.refresh_token
        }, PRIVATE_KEY, {
            algorithm: 'RS256',
            expiresIn: 60 * 60 * 24 * 90
        })
        const redirectUrl = req.query.state
        if (typeof redirectUrl === 'string') {
            res.redirect(decodeURIComponent(redirectUrl) + (decodeURIComponent(redirectUrl).includes('?') ? '&' : '?') + `access=${generatedAccess}&refresh=${generatedRefresh}&id=${dbUser._id.toString()}&discord=${user.id}`)
        } else {
            res.status(400).send()
        }
    })

    app.get("/oauth2/login", async (req, res) => {
        if (typeof req.query.redirectUrl !== 'string') {
            res.status(400).send("No redirect URL provided.")
            return
        }
        res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${manifest.discord.client.id!}&redirect_uri=${encodeURIComponent(CURRENT_URL + '/oauth2/redirect')}&response_type=code&scope=identify&state=${req.query.redirectUrl}`)
    })

    app.get("/oauth2/refresh", async (req, res) => {
        try {
            const bearer = req.headers.authorization
            if (typeof bearer !== 'string' || !bearer.startsWith('Bearer ')) {
                res.status(401).send("No bearer token provided.")
                return
            }
            const verified = jwt.verify(bearer.substring('Bearer '.length), PUBLIC_KEY) as any;
            if (typeof verified?.refresh === 'undefined') {
                res.status(401).send("Incorrect bearer token provided.")
                return
            }
            let params = new URLSearchParams()
            params.append("grant_type", "refresh_token")
            params.append("refresh_token", verified.refresh)
            params.append("client_id", manifest.discord.client.id!)
            params.append("client_secret", manifest.discord.client.secret!)
            const data = await fetch(`https://discord.com/api/oauth2/token`, {
                method: 'POST',
                body: params,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }).then(res => res.json())
            const user = await fetch(`https://discord.com/api/users/@me`, { headers: { Authorization: `Bearer ${data.access_token}` } }).then(res => res.json())
            let dbUser = await database.getUser({ discord: user.id })
            if (dbUser === null) dbUser = await database.addUser(user.id)
            const generatedAccess = jwt.sign({ 
                id: dbUser._id.toString(),
                discord: user.id,
                access: data.access_token
            }, PRIVATE_KEY, {
                algorithm: 'RS256',
                expiresIn: data.expires_in - EXPIRY_BUFFER
            })
            const generatedRefresh = jwt.sign({ 
                id: dbUser._id.toString(),
                discord: user.id,
                refresh: data.refresh_token
            }, PRIVATE_KEY, {
                algorithm: 'RS256',
                expiresIn: 60 * 60 * 24 * 90
            })
            res.status(200).send({
                access: generatedAccess,
                refresh: generatedRefresh,
                expiresIn: data.expires_in - EXPIRY_BUFFER,
                id: dbUser._id.toString(),
                discord: user.id
            })
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) res.status(401).send("Token has expired.")
            else if (error instanceof jwt.NotBeforeError) res.status(401).send("Token is not active.")
            else if (error instanceof jwt.JsonWebTokenError) res.status(401).send("Token is invalid.")
            else res.status(500).send()
        }
    })
}

{ // notifications
    app.put("/notifications/:id", async (req, res) => {
        let user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        if (typeof user.devices === 'undefined') {
            user.devices = []
        }
        if (!user.devices.some(device => device.id === req.params.id)) {
            user.devices.push({
                id: req.params.id,
                badge: 0,
                notifications: { text: [], image: [], video: [] }
            })
        }
        await database.setUser(user)
        res.status(200).send()
    })

    app.delete("/notifications/:id", async (req, res) => {
        let user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const idIndex = user.devices?.findIndex(device => device.id === req.params.id)
        if (typeof idIndex === 'number' && idIndex !== -1) {
            user.devices?.splice(idIndex, 1)
        }
        await database.setUser(user)
        res.status(200).send()
    })

    app.put("/notifications/:id/badge/:count", async (req, res) => {
        const count = parseInt(req.params.count)
        if (typeof count !== 'number' || isNaN(count)) {
            res.status(400).send("Invalid badge count.")
            return
        }
        let user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        const idIndex = user.devices?.findIndex(device => device.id === req.params.id) ?? -1
        if (typeof user.devices !== 'undefined' && idIndex !== -1) {
            user.devices[idIndex].badge = count
        }
        await database.setUser(user)
        res.status(200).send()
    })

    app.put("/notifications/:id/:mediaType/:entryId/:sourceId", async (req, res) => {
        let user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        if (typeof user.devices === 'undefined') {
            user.devices = []
        }
        const deviceIndex = user.devices!.findIndex(device => device.id === req.params.id)
        if (deviceIndex === -1) {
            let device = {
                id: req.params.entryId,
                badge: 0,
                notifications: { text: [], image: [], video: [] }
            };
            (device as any).notifications[req.params.mediaType.toLowerCase()].push({
                id: req.params.entryId,
                source: req.params.sourceId
            })
            user.devices.push(device)
        } else {
            const notificationIndex = (user.devices![deviceIndex].notifications as any)[req.params.mediaType].findIndex((notification: UserNotification) => notification.id === req.params.entryId)
            if (notificationIndex === -1) {
                (user.devices![deviceIndex].notifications as any)[req.params.mediaType].push({
                    id: req.params.entryId,
                    source: req.params.sourceId
                })
            } else {
                (user.devices![deviceIndex].notifications as any)[req.params.mediaType][notificationIndex].source = req.params.sourceId
            }
        }
        await database.setUser(user)
        res.status(200).send()
    })

    app.delete("/notifications/:id/:mediaType/:entryId", async (req, res) => {
        let user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        if (typeof user.devices === 'undefined') {
            user.devices = []
        }
        const deviceIndex = user.devices!.findIndex(device => device.id === req.params.id)
        if (deviceIndex !== -1) {
            const entryIndex = (user.devices![deviceIndex] as any).notifications[req.params.mediaType.toLowerCase()].findIndex((notification: UserNotification) => notification.id === req.params.entryId)
            if (entryIndex !== -1) {
                (user.devices![deviceIndex] as any).notifications[req.params.mediaType.toLowerCase()].splice(entryIndex, 1)
            }
        }
        await database.setUser(user)
        res.status(200).send()
    })
}

{ // trackers
    app.put("/trackers/:mediaType/:id/:trackerId", async (req, res) => {
        let user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        if (typeof user.trackers === 'undefined') {
            user.trackers = { text: [], image: [], video: [] }
        }
        const trackerIndex = (user.trackers as any)[req.params.mediaType.toLowerCase()].findIndex((tracker: UserTracker) => tracker.entryId === req.params.id && tracker.id === req.params.trackerId)
        if (trackerIndex === -1) {
            (user.trackers as any)[req.params.mediaType.toLowerCase()].push({
                entryId: req.params.id,
                id: req.params.trackerId
            })
        }
        await database.setUser(user)
        res.status(200).send()
    })

    app.delete("/trackers/:mediaType/:id/:trackerId", async (req, res) => {
        let user = await database.getUser({ _id: MUUID.from((req as any).userId) })
        if (user === null) {
            res.status(500).send()
            return
        }
        if (typeof user.trackers === 'undefined') {
            user.trackers = { text: [], image: [], video: [] }
        }
        const trackerIndex = (user.trackers as any)[req.params.mediaType.toLowerCase()].findIndex((tracker: UserTracker) => tracker.entryId === req.params.id && tracker.id === req.params.trackerId)
        if (trackerIndex !== -1) {
            (user.trackers as any)[req.params.mediaType.toLowerCase()].splice(trackerIndex, 1)
        }
        await database.setUser(user)
        res.status(200).send()
    })
}

app.listen(3604, async () => {
    database = await Database.connect()
    console.log("Started server on port 3604")
})