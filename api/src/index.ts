import express from 'express';
import Database from 'soshiki-database';
import { Medium, TrackerStatus } from 'soshiki-types';
import manifest from 'soshiki-manifest';
import dotenv from 'dotenv';
import Discord from 'soshiki-discord';
import crypto from 'crypto';
import MAL, * as MALTypes from './mal';
import AniList, * as AniListTypes from './anilist';
import Cookie from 'cookie';

dotenv.config();

const app = express();

const whitelist = [
    "http://soshiki.moe", 
    "https://soshiki.moe", 
    "http://soshiki.war", 
    "https://soshiki.war", 
    "https://api.soshiki.moe",
    "https://api.soshiki.war",
    "https://discordapp.com", 
    "https://discord.com"];
const whitelistedPaths = [
    '/user/login/discord/redirect',
    '/user/login/discord',
    '/user/connect/mal/redirect',
    '/user/connect/mal',
    '/user/connect/anilist/redirect',
    '/user/connect/anilist',
];
const corsWhitelistedMethods = ['GET', 'OPTIONS'];
const unverifiedMethods = ['GET', 'OPTIONS'];
const connections = ['mal', 'anilist'];

const developmentMode = true;

let database: Database;

const isMedium = (medium: string): medium is Medium => {
    return medium === 'anime' || medium === 'manga' || medium === 'novel';
}

const cors = (req: any, res: any, next: any) => {
    if(corsWhitelistedMethods.includes(req.method) || whitelistedPaths.includes(req.path) || developmentMode) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        next();
        return;
    }
    if(!req.headers.origin || !whitelist.includes(req.headers.origin)) {
        res.status(403).send();
        return;
    }
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    next();
}

const verify = async (req: any, res: any, next: any) => {
    if(unverifiedMethods.includes(req.method) || whitelistedPaths.includes(req.path)) {
        next();
        return;
    }
    if(!req.headers.authorization) {
        res.status(401).send();
        return;
    }
    const [type, token] = req.headers.authorization.split(' ');
    if(type !== 'Bearer') {
        res.status(401).send();
        return;
    }
    if(!(await database.verify(token))) {
        res.status(401).send();
        return;
    }
    next();
}

function getToken(req: any) {
    console.log(req.headers)
    if(req.headers.authorization) {
        const [type, token] = req.headers.authorization.split(' ');
        if(type === 'Bearer') {
            return decodeURIComponent(token);
        }
    } 
    if (req.headers.cookie) {
        const access = Cookie.parse(req.headers.cookie).access;
        if(access) {
            return decodeURIComponent(access);
        }
    }
    return null;
}

app.use(cors);
app.use(verify);
app.use(express.json())

app.get("/link/:medium/:platform/:source/:id", async (req, res) => {
    const medium = req.params.medium;
    const platform = req.params.platform;
    const source = req.params.source;
    const id = req.params.id;
    if(!isMedium(medium)) {
        res.status(400).send();
        return;
    }
    let entry = await database.getLink(medium, platform, source, id);
    res.send({id: entry});
});

app.post("/link/:medium/:platform/:source/:id/:soshikiId", async (req, res) => {
    const medium = req.params.medium;
    const platform = req.params.platform;
    const source = req.params.source;
    const id = req.params.id;
    const soshikiId = req.params.soshikiId;
    if(!isMedium(medium) || !soshikiId) {
        res.status(400).send();
        return;
    }
    const token = getToken(req);
    if(!token) {
        res.status(401).send();
        return;
    }
    let user = await database.getUserId(token);
    await database.setLink(medium, platform, source, id, user, soshikiId);
    res.send();
});

app.get("/info/:medium/:id", async (req, res) => {
    if(!isMedium(req.params.medium)) {
        res.status(400).send("Invalid medium");
        return;
    }
    let entry = await database.get(req.params.medium as Medium, req.params.id);
    if(!entry) {
        res.status(404).send("Entry not found");
        return;
    }
    let token = getToken(req);
    if(token) {
        let userId = await database.getUserId(token);
        if(userId) {
            let user = await database.getUser(userId);
            if(user && user.connections) {
                let mal = user.connections.mal;
                if(mal && entry.tracker_ids.mal) {
                    if(req.params.medium === 'anime') {
                        let malEntry = await MAL.getAnime(entry.tracker_ids.mal, mal.access);
                        if(malEntry) {
                            entry.info.mal = malEntry;
                            await database.setInfoProperty(req.params.medium as Medium, req.params.id, 'mal', malEntry);
                        } else {
                            await refreshMAL(userId);
                            let malEntry = await MAL.getAnime(entry.tracker_ids.mal, mal.access);
                            if(malEntry) {
                                entry.info.mal = malEntry;
                                await database.setInfoProperty(req.params.medium as Medium, req.params.id, 'mal', malEntry);
                            }
                        }
                    } else {
                        let malEntry = await MAL.getManga(entry.tracker_ids.mal, mal.access);
                        if(malEntry) {
                            entry.info.mal = malEntry;
                            await database.setInfoProperty(req.params.medium as Medium, req.params.id, 'mal', malEntry);
                        } else {
                            await refreshMAL(userId);
                            let malEntry = await MAL.getManga(entry.tracker_ids.mal, mal.access);
                            if(malEntry) {
                                entry.info.mal = malEntry;
                                await database.setInfoProperty(req.params.medium as Medium, req.params.id, 'mal', malEntry);
                            }
                        }
                    }
                }
                let anilist = user.connections.anilist;
                if(anilist && entry.tracker_ids.anilist) {
                    if(req.params.medium === 'anime') {
                        let anilistEntry = await AniList.getAnime(entry.tracker_ids.anilist, anilist.access);
                        if(anilistEntry) {
                            entry.info.anilist = anilistEntry;
                            await database.setInfoProperty(req.params.medium as Medium, req.params.id, 'anilist', anilistEntry);
                        }
                    } else {
                        let anilistEntry = await AniList.getManga(entry.tracker_ids.anilist, anilist.access);
                        if(anilistEntry) {
                            entry.info.anilist = anilistEntry;
                            await database.setInfoProperty(req.params.medium as Medium, req.params.id, 'anilist', anilistEntry);
                        }
                    }
                }
            }
        }
    }
    res.send(entry);
});

app.get("/info/:medium/search/:query", async (req, res) => {
    if(!isMedium(req.params.medium)) {
        res.status(400).send("Invalid medium");
        return;
    }
    let entries = await database.find(req.params.medium as Medium, decodeURIComponent(req.params.query));
    res.send(entries);
});

app.get('/user/login/discord/redirect', async (req, res) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${manifest.discord.client.id}&redirect_uri=https%3A%2F%2Fapi.soshiki.moe%2Fuser%2Flogin%2Fdiscord&response_type=code&scope=identify`);
});

app.get('/user/login/discord', async (req, res) => {
    let code = req.query.code.toString();
    let json = await Discord.authorize(code);
    let daccess = json.access_token;
    let drefresh = json.refresh_token;
    let expires = json.expires_in;
    let user = await fetch(`${manifest.discord.url}/users/@me`, { headers: { Authorization: `Bearer ${daccess}` } }).then(res => res.json());
    let {id, access, refresh} = await database.login(user.id, daccess, drefresh, expires);
    res.redirect(`${manifest.site.url}/account/redirect?type=discord&id=${id}&access=${access}&refresh=${refresh}&expires=${expires * 1000}`);
});

app.get('/user/login/discord/refresh', async (req, res) => {
    let id = req.query.access.toString();
    let user = await database.getUser(id);
    let discord = await Discord.refresh(user.refresh);
    let login = await database.login(user.discord, discord.access, discord.refresh, discord.expires);
    res.send(login);
});

app.get('/user/login/refresh', async (req, res) => {
    let refresh = req.query.refresh.toString();
    let session = await database.refreshSession(refresh, new Date().getTime() + 1000 * 60 * 60 * 24 * 14);
    res.send(session);
});

function generateChallenge() {
    return crypto.randomBytes(64).toString('hex');
}

app.get('/user/connect/:type/redirect', async (req, res) => {
    let type = req.params.type;
    if (!connections.includes(type)) {
        res.status(400).send("Invalid connection type");
        return;
    }
    let token = req.query.access?.toString() || getToken(req);
    if (!token) {
        res.status(401).send();
        return;
    }
    let userId = await database.getUserId(token);
    if (!userId) {
        res.status(401).send();
        return;
    }
    if (type === "mal") {
        let challenge = generateChallenge();
        await database.setUserConnection(userId, type, challenge);
        res.redirect(`https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${manifest.mal.id}&code_challenge=${challenge}&state=${userId}&redirect_uri=https%3A%2F%2Fapi.soshiki.moe%2Fuser%2Fconnect%2Fmal`);
        return;
    } else if (type === "anilist") {
        res.redirect(`https://anilist.co/api/v2/oauth/authorize?client_id=${manifest.anilist.id}&redirect_uri=${encodeURIComponent(`https://api.soshiki.moe/user/connect/anilist`)}&response_type=code&state=${userId}`);
        return;
    }
});

app.get("/user/connect/:type", async (req, res) => {
    let type = req.params.type;
    if(!connections.includes(type)) {
        res.status(400).send("Invalid connection type");
        return;
    }
    if(type === "mal") {
        let id = req.query.state.toString();
        let code = req.query.code.toString();
        let user = await database.getUser(id);
        if(!user) {
            res.status(401).send();
            return;
        }
        let challenge = user.connections.mal;
        let resp = await fetch("https://myanimelist.net/v1/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `grant_type=authorization_code&code=${code}&code_verifier=${challenge}&redirect_uri=https%3A%2F%2Fapi.soshiki.moe%2Fuser%2Fconnect%2Fmal&client_id=${manifest.mal.id}&client_secret=${manifest.mal.secret}`
        });
        let json = await resp.json();
        let access = json.access_token;
        let refresh = json.refresh_token;
        let expires = json.expires_in;
        await database.setUserConnection(user.id, type, {
            access,
            refresh,
            expires: Date.now() + expires * 1000
        });
        let userdata = await fetch(`https://api.myanimelist.net/v2/users/@me`, { headers: { Authorization: `Bearer ${access}` } }).then(res => res.json());
        await database.setUserData(user.id, "mal", userdata);
        res.redirect(`${manifest.site.url}/account/redirect?type=mal`);
    } else if(type === "anilist") {
        let id = req.query.state.toString();
        let code = req.query.code.toString();
        let user = await database.getUser(id);
        if(!user) {
            res.status(401).send();
            return;
        }
        let resp = await fetch("https://anilist.co/api/v2/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                grant_type: "authorization_code",
                client_id: manifest.anilist.id,
                client_secret: manifest.anilist.secret,
                redirect_uri: `https://api.soshiki.moe/user/connect/anilist`,
                code: code
            })
        });
        let json = await resp.json();
        let access = json.access_token;
        await database.setUserConnection(user.id, type, { access });
        const gql = `
            query {
                Viewer {
                    id,
                    name, 
                    avatar {
                        large
                        medium
                    }
                }
            }
            `;
        let userdata = await fetch(`https://graphql.anilist.co`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access}`
            },
            body: JSON.stringify({
                query: gql
            })
        }).then(res => res.json());
        await database.setUserData(user.id, "anilist", userdata.data.Viewer);
        res.redirect(`${manifest.site.url}/account/redirect?type=anilist`);
    }
});

app.get("/user/connect/:type/refresh", async (req, res) => {
    let type = req.params.type;
    if(!connections.includes(type)) {
        res.status(400).send("Invalid connection type");
        return;
    }
    let token = getToken(req);
    if(!token) {
        res.status(401).send();
        return;
    }
    let userId = await database.getUserId(token);
    if(!userId) {
        res.status(401).send();
        return;
    }
    if(type === "mal") {
        refreshMAL(userId);
    }
});

app.delete("/user/connect/:type", async (req, res) => {
    let type = req.params.type;
    if(!connections.includes(type)) {
        res.status(400).send("Invalid connection type");
        return;
    }
    let token = getToken(req);
    if(!token) {
        res.status(401).send();
        return;
    }
    let userId = await database.getUserId(token);
    if(!userId) {
        res.status(401).send();
        return;
    }
    await database.deleteUserConnection(userId, type);
    await database.deleteUserData(userId, type);
    res.send();
});

app.get("/user/:id", async (req, res) => {
    let user = await database.getPublicUser(req.params.id);
    if(!user) {
        res.status(404).send("User not found");
        return;
    }
    res.send(user);
});

app.get("/user/:id/avatar", async (req, res) => {
    let user = await database.getPublicUser(req.params.id);
    if(!user) {
        res.status(404).send("User not found");
        return;
    }
    let avatar = await Discord.getUserAvatar(user.discord);
    if(!avatar) {
        res.status(404).send("User has no avatar");
        return;
    }
    res.send(avatar);
});

app.get("/user/:id/info", async (req, res) => {
    let user = await database.getPublicUser(req.params.id);
    if(!user) {
        res.status(404).send("User not found");
        return;
    }
    res.send(await Discord.getUserInfo(user.discord));
});

app.get("/user", async (req, res) => {
    let userId = await database.getUserId(getToken(req));
    if(!userId) {
        res.status(404).send("User not found");
        return;
    }
    let user = await database.getPublicUser(userId);
    if(!user) {
        res.status(404).send("User not found");
        return;
    }
    res.send(user);
});

app.get("/library/:medium", async (req, res) => {
    let userId = await database.getUserId(getToken(req));
    if(!userId) {
        res.status(403).send("Unauthorized")
        return
    }
    let json = await database.getUser(userId);
    if (!json.data["library"]) json.data["library"] = {};
    if (!json.data["library"][req.params.medium]) json.data["library"][req.params.medium] = [];
    res.status(200).send(json.data["library"][req.params.medium]);
});

app.put("/library/:medium/:id", async (req, res) => {
    if(!isMedium(req.params.medium)) res.status(400).send("Invalid medium");
    let userId = await database.getUserId(getToken(req));
    if(!userId) {
        res.status(403).send("Unauthorized")
        return
    }
    let json = await database.getUser(userId);
    if (!json.data["library"]) json.data["library"] = {};
    if (!json.data["library"][req.params.medium]) json.data["library"][req.params.medium] = [];
    if (!json.data["library"][req.params.medium].includes(req.params.id)) json.data["library"][req.params.medium].push(req.params.id);
    await database.setUserData(userId, "library", json.data["library"]);
    res.status(200).send();
});

app.delete("/library/:medium/:id", async (req, res) => {
    if(!isMedium(req.params.medium)) res.status(400).send("Invalid medium");
    let userId = await database.getUserId(getToken(req));
    if(!userId) {
        res.status(403).send("Unauthorized")
        return
    }
    let json = await database.getUser(userId);
    if (!json.data["library"]) json.data["library"] = [];
    if (!json.data["library"][req.params.medium]) json.data["library"][req.params.medium] = [];
    if (!json.data["library"][req.params.medium].includes(req.params.id)) json.data["library"][req.params.medium].splice(json.data["library"][req.params.medium].indexOf(req.params.id), 1);
    await database.setUserData(userId, "library", json.data["library"]);
    res.status(200).send();
});

app.get("/history/:medium", async (req, res) => {
    let userId = await database.getUserId(getToken(req));
    if(!userId) {
        res.status(403).send("Unauthorized")
        return
    }
    let json = await database.getUser(userId);
    if (!json.data["history"]) json.data["history"] = {};
    if (!json.data["history"][req.params.medium]) json.data["history"][req.params.medium] = [];
    res.status(200).send(json.data["history"][req.params.medium]);
});

app.get("/history/:medium/:id", async (req, res) => {
    let userId = await database.getUserId(getToken(req));
    if(!userId) {
        res.status(403).send("Unauthorized")
        return
    }
    let json = await database.getUser(userId);
    if (!json.data["history"]) json.data["history"] = {};
    if (!json.data["history"][req.params.medium]) json.data["history"][req.params.medium] = [];
    res.status(200).send(json.data["history"][req.params.medium].find(entry => entry.id === req.params.id) ?? {});
});

app.post("/history/:medium/:id", async (req, res) => {
    if(!isMedium(req.params.medium)) res.status(400).send("Invalid medium");
    let userId = await database.getUserId(getToken(req));
    if(!userId) {
        res.status(403).send("Unauthorized")
        return
    }
    let data = req.body;
    let json = await database.getUser(userId);
    if (!json.data["history"]) json.data["history"] = {};
    if (!json.data["history"][req.params.medium]) json.data["history"][req.params.medium] = [];
    let history = json.data["history"][req.params.medium];
    let entryIndex = history.findIndex(item => item.id === req.params.id);
    if (entryIndex === -1) {
        let entry = {
            id: req.params.id,
            startTime: Date.now(),
            page: data.page ?? 0,
            status: data.status as TrackerStatus ?? TrackerStatus.ongoing,
            lastReadTime: Date.now(),
            rating: data.rating ?? 0,
        }
        if (req.params.medium === "anime") entry["episode"] = data.episode ?? 0;
        else entry["chapter"] = data.chapter ?? 0;
        history.push(entry);
        entryIndex = history.length - 1;
    } else {
        let entry = history[entryIndex];
        if (typeof data.chapter === "number") entry.chapter = data.chapter;
        if (typeof data.page === "number") entry.page = data.page;
        if (typeof data.rating === "number") entry.rating = data.rating;
        entry.lastReadTime = Date.now();
        history[entryIndex] = entry;
    }
    if (data.trackers) {
        let user = await database.getUser(userId);
        for (let tracker of data.trackers) {
            if (tracker === "mal") {
                let mal = user.connections.mal;
                let status: MALTypes.MediaStatus;
                if (data.status) {
                    switch (data.status as TrackerStatus) {
                        case TrackerStatus.completed: status = "completed"; break;
                        case TrackerStatus.dropped: status = "dropped"; break;
                        case TrackerStatus.ongoing: status = req.params.medium === "anime" ? "watching" : "reading"; break;
                        case TrackerStatus.paused: status = "on_hold"; break;
                        case TrackerStatus.planned: status = req.params.medium === "anime" ? "plan_to_watch" : "plan_to_read"; break;
                    }
                }
                if (mal && history[entryIndex].tracker_ids && history[entryIndex].tracker_ids["mal"]) {
                    if (req.params.medium === "anime") history[entryIndex].tracker_ids["mal"] = await MAL.updateAnimeStatus(history[entryIndex].tracker_ids["mal"], mal.access, { episode: data.episode, status, rating: data.rating });
                    else history[entryIndex].tracker_ids["mal"] = await MAL.updateMangaStatus(history[entryIndex].tracker_ids["mal"], mal.access, { chapter: data.chapter, status, rating: data.rating });
                } else if (mal) {
                    if (!history[entryIndex].tracker_ids) history[entryIndex].tracker_ids = {};
                    let media = await database.get(req.params.medium as Medium, req.params.id);
                    if (media.tracker_ids && media.tracker_ids["mal"]) {
                        if (req.params.medium === "anime") history[entryIndex].tracker_ids["mal"] = await MAL.createAnimeStatus(media.tracker_ids["mal"], mal.access, { episode: data.episode, status, rating: data.rating });
                        else history[entryIndex].tracker_ids["mal"] = await MAL.createMangaStatus(media.tracker_ids["mal"], mal.access, { chapter: data.chapter, status, rating: data.rating });
                    }
                }
            } else if (tracker === "anilist") {
                let anilist = user.connections.anilist;
                let status: AniListTypes.MediaStatus;
                if (data.status) {
                    switch (data.status as TrackerStatus) {
                        case TrackerStatus.completed: status = "COMPLETED"; break;
                        case TrackerStatus.dropped: status = "DROPPED"; break;
                        case TrackerStatus.ongoing: status = "CURRENT"; break;
                        case TrackerStatus.paused: status = "PAUSED"; break;
                        case TrackerStatus.planned: status = "PLANNING"; break;
                    }
                }
                if (anilist && history[entryIndex].tracker_ids && history[entryIndex].tracker_ids["anilist"]) {
                    if (req.params.medium === "anime") history[entryIndex].tracker_ids["anilist"] = await AniList.updateAnimeStatus(history[entryIndex].tracker_ids["anilist"], anilist.access, { episode: data.episode, status, rating: data.rating });
                    else history[entryIndex].tracker_ids["anilist"] = await AniList.updateMangaStatus(history[entryIndex].tracker_ids["anilist"], anilist.access, { chapter: data.chapter, status, rating: data.rating });
                } else if (anilist) {
                    if (!history[entryIndex].tracker_ids) history[entryIndex].tracker_ids = {};
                    let media = await database.get(req.params.medium as Medium, req.params.id);
                    if (media.tracker_ids && media.tracker_ids["anilist"]) {
                        if (req.params.medium === "anime") history[entryIndex].tracker_ids["anilist"] = await AniList.createAnimeStatus(media.tracker_ids["anilist"], anilist.access, { episode: data.episode, status, rating: data.rating });
                        else history[entryIndex].tracker_ids["anilist"] = await AniList.createMangaStatus(media.tracker_ids["anilist"], anilist.access, { chapter: data.chapter, status, rating: data.rating });
                    }
                }
            }
        }
    }
    json.data["history"][req.params.medium] = history;
    await database.setUserData(userId, "history", json.data["history"]);
    res.status(200).send();
});

app.delete("/history/:medium/:id", async (req, res) => {
    if(!isMedium(req.params.medium)) res.status(400).send("Invalid medium");
    let userId = await database.getUserId(getToken(req));
    if(!userId) {
        res.status(403).send("Unauthorized")
        return
    }
    let data = req.body;
    let json = await database.getUser(userId);
    if (!json.data["history"]) json.data["history"] = {};
    if (!json.data["history"][req.params.medium]) json.data["history"][req.params.medium] = [];
    let history = json.data["history"][req.params.medium];
    let entryIndex = history.findIndex(item => item.id === req.params.id);
    if (entryIndex === -1) {
        res.status(200).send();
        return;
    }
    let spliced = history.splice(entryIndex, 1)[0];
    if (data.trackers) {
        let user = await database.getUser(userId);
        for (let tracker of data.trackers) {
            if (tracker === "mal") {
                let mal = user.connections.mal;
                if (mal && spliced.tracker_ids && spliced.tracker_ids["mal"]) {
                    if (req.params.medium === "anime") await MAL.deleteAnimeStatus(spliced.tracker_ids["mal"], mal.access);
                    else MAL.deleteMangaStatus(spliced.tracker_ids["mal"], mal.access);
                }
            } else if (tracker === "anilist") {
                let anilist = user.connections.anilist;
                if (anilist && spliced.tracker_ids && spliced.tracker_ids["anilist"]) {
                    if (req.params.medium === "anime") await AniList.deleteAnimeStatus(spliced.tracker_ids["anilist"], anilist.access);
                    else AniList.deleteMangaStatus(spliced.tracker_ids["anilist"], anilist.access);
                }
            }
        }
    }
    json.data["history"][req.params.medium] = history;
    await database.setUserData(userId, "history", json.data["history"]);
    res.status(200).send()
});

app.listen(manifest.api.port, async () => {
    database = await Database.connect();
    console.log(`Server started on port ${manifest.api.port}`);
});

async function refreshMAL(userId: string) {
    let user = await database.getUser(userId);
    let res = await fetch("https://myanimelist.net/v1/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `grant_type=refresh_token&refresh_token=${user.connections.mal.refresh}&redirect_uri=https%3A%2F%2Fapi.soshiki.moe%2Fuser%2Fconnect%2Fmal&client_id=${manifest.mal.id}&client_secret=${manifest.mal.secret}`
    });
    let json = await res.json();
    let access = json.access_token;
    let refresh = json.refresh_token;
    let expires = json.expires_in;
    await database.setUserConnection(user.id, "mal", {
        access,
        refresh,
        expires: Date.now() + expires * 1000
    });
}