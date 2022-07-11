import express from 'express';
import Database from 'soshiki-database';
import type { Medium } from 'soshiki-types';
import manifest from 'soshiki-manifest';
import dotenv from 'dotenv';
import Discord from 'soshiki-discord';
import crypto from 'crypto';
import MAL from './mal';
import AniList from './anilist';

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
    '/user/login/discord',
    '/user/redirect/discord'
];
const connections = ['mal', 'anilist'];


let database: Database;

const isMedium = (medium: string): medium is Medium => {
    return medium === 'anime' || medium === 'manga' || medium === 'novel';
}

const cors = (req: any, res: any, next: any) => {
    if(whitelistedPaths.includes(req.path) || req.method === 'OPTIONS' || req.method === 'GET') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
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
    next();
}

const verify = async (req: any, res: any, next: any) => {
    if(req.method === 'OPTIONS' || req.method === 'GET') {
        next();
        return;
    }
    if(whitelistedPaths.includes(req.path)) {
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
    if(req.headers.authorization) {
        const [type, token] = req.headers.authorization.split(' ');
        if(type === 'Bearer') {
            return token;
        }
    }
    return null;
}

app.use(cors);
app.use(verify);

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
                        }
                    } else {
                        let malEntry = await MAL.getManga(entry.tracker_ids.mal, mal.access);
                        if(malEntry) {
                            entry.info.mal = malEntry;
                            await database.setInfoProperty(req.params.medium as Medium, req.params.id, 'mal', malEntry);
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
    let access = json.access_token;
    let refresh = json.refresh_token;
    let expires = json.expires_in;
    let user = await fetch(`${manifest.discord.url}/users/@me`, { headers: { Authorization: `Bearer ${access}` } }).then(res => res.json());
    let {id, session} = await database.login(user.id, access, refresh, expires);
    res.redirect(`${manifest.site.url}/account/redirect?type=discord&id=${id}&session=${session}&expires=${expires}`);
});

app.get('/user/login/discord/refresh', async (req, res) => {
    let id = req.query.id.toString();
    let user = await database.getUser(id);
    let discord = await Discord.refresh(user.refresh);
    let login = await database.login(user.discord, discord.access, discord.refresh, discord.expires);
    res.send(login);
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
    let token = req.query.token?.toString() || getToken(req);
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
        await database.setUserConnection(user.id, type, {
            access,
            refresh,
            expires: Date.now() + expires * 1000
        });
    }
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

app.post("/", (req, res) => {
    res.status(200).send("Niceu");
});

app.listen(manifest.api.port, async () => {
    database = await Database.connect();
    console.log(`Server started on port ${manifest.api.port}`);
});