import express from 'express';
import Database from 'soshiki-database';
import type { Medium } from 'soshiki-types';
import manifest from 'soshiki-manifest';
import dotenv from 'dotenv';
import Discord from 'soshiki-discord';

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

app.get('/user/redirect/discord', async (req, res) => {
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