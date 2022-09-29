import dotenv from 'dotenv';
import Database from 'soshiki-database';
import { readFileSync, rmdirSync, readdirSync } from 'fs';
import { spawnSync } from 'child_process';

dotenv.config();

const REPO_URL = "https://github.com/MALSync/MAL-Sync-Backup.git";

let mangaToAdd: {[key: string]: any}[] = [];
let animeToAdd: {[key: string]: any}[] = [];
let novelsToAdd: {[key: string]: any}[] = [];
let database: Database;

async function main() {
    console.log("Connecting to database");
    database = await Database.connect();
    console.log("Connected to database");
    console.log("Cloning repo");
    if (!readdirSync("./").includes("MAL-Sync-Backup")) {
        spawnSync("git", ["clone", REPO_URL]);
        console.log("Cloned repo");
    } else {
        console.log("Repo already cloned");
    }
    let malManga: {[key: string]: any}[] = [];
    let malAnime: {[key: string]: any}[] = [];
    let alManga: {[key: string]: any}[] = [];
    let alAnime: {[key: string]: any}[] = [];
    console.log("Reading directories");
    let malMangaFiles = readdirSync("./MAL-Sync-Backup/data/myanimelist/manga");
    let malAnimeFiles = readdirSync("./MAL-Sync-Backup/data/myanimelist/anime");
    let alMangaFiles = readdirSync("./MAL-Sync-Backup/data/anilist/manga");
    let alAnimeFiles = readdirSync("./MAL-Sync-Backup/data/anilist/anime");
    console.log("Read directories");
    console.log("Total MAL manga files: " + malMangaFiles.length);
    console.log("Total MAL anime files: " + malAnimeFiles.length);
    console.log("Total AL manga files: " + alMangaFiles.length);
    console.log("Total AL anime files: " + alAnimeFiles.length);
    console.log("Reading MAL manga files");
    for(let malMangaFile of malMangaFiles) {
        let data = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/myanimelist/manga/${malMangaFile}`, 'utf8'));
        let json: {[key: string]: any} = {};
        json["trackerIds"] = {
            "mal": data.id,
        };
        let info: {[key: string]: any} = {};
        if(data.title) {
            info["title"] = data.title;
        }
        if(data.altTitle) {
            info["alt_titles"] = data.altTitle;
        }
        if(data.authors && data.authors.length > 0) {
            info["author"] = data.authors.join(", ");
        }
        if(data.artists && data.artists.length > 0) {
            info["artist"] = data.artists.join(", ");
        }
        if(typeof data.hentai === "boolean") {
            info["nsfw"] = data.hentai;
        } else {
            info["nsfw"] = false;
        }
        if(data.image) {
            info["cover"] = data.image;
        }
        json["info"] = info;
        json["category"] = data.category;
        malManga.push(json);
    }
    console.log("Read MAL manga files");
    console.log("Reading MAL anime files");
    for(let malAnimeFile of malAnimeFiles) {
        let data = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/myanimelist/anime/${malAnimeFile}`, 'utf8'));
        let json: {[key: string]: any} = {};
        json["trackerIds"] = {
            "mal": data.id,
        };
        let info: {[key: string]: any} = {};
        if(data.title) {
            info["title"] = data.title;
        }
        if(data.altTitle) {
            info["alt_titles"] = data.altTitle;
        }
        if(typeof data.hentai === "boolean") {
            info["nsfw"] = data.hentai;
        } else {
            info["nsfw"] = false;
        }
        if(data.image) {
            info["cover"] = data.image;
        }
        json["info"] = info;
        malAnime.push(json);
    }
    console.log("Read MAL anime files");
    console.log("Reading AL manga files");
    for(let alMangaFile of alMangaFiles) {
        let data = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/anilist/manga/${alMangaFile}`, 'utf8'));
        let json: {[key: string]: any} = {};
        let malId = data.malId;
        json["trackerIds"] = {
            "anilist": data.id,
        };
        if(malId) {
            json["trackerIds"]["mal"] = malId;
        }
        let info: {[key: string]: any} = {};
        if(data.title) {
            info["title"] = data.title;
        }
        if(data.altTitle) {
            info["alt_titles"] = data.altTitle;
        }
        if(data.authors && data.authors.length > 0) {
            info["author"] = data.authors.join(", ");
        }
        if(data.artists && data.artists.length > 0) {
            info["artist"] = data.artists.join(", ");
        }
        if(typeof data.hentai === "boolean") {
            info["nsfw"] = data.hentai;
        } else {
            info["nsfw"] = false;
        }
        if(data.image) {
            info["cover"] = data.image;
        }
        json["info"] = info;
        json["category"] = data.category;
        alManga.push(json);
    }
    console.log("Read AL manga files");
    console.log("Reading AL anime files");
    for(let alAnimeFile of alAnimeFiles) {
        let data = JSON.parse(readFileSync(`./MAL-Sync-Backup/data/anilist/anime/${alAnimeFile}`, 'utf8'));
        let json: {[key: string]: any} = {};
        let malId = data.malId;
        json["trackerIds"] = {
            "anilist": data.id,
        };
        if(malId) {
            json["trackerIds"]["mal"] = malId;
        }
        let info: {[key: string]: any} = {};
        if(data.title) {
            info["title"] = data.title;
        }
        if(data.altTitle) {
            info["alt_titles"] = data.altTitle;
        }
        if(typeof data.hentai === "boolean") {
            info["nsfw"] = data.hentai;
        } else {
            info["nsfw"] = false;
        }
        if(data.image) {
            info["cover"] = data.image;
        }
        json["info"] = info;
        alAnime.push(json);
    }
    console.log("Read AL anime files");
    console.log("Deduping and splitting novels");
    for(let anime of malAnime) {
        let id = anime["trackerIds"]["mal"];
        if(!animeToAdd.some(x => x["trackerIds"]["mal"] === id)) {
            animeToAdd.push(anime);
        }
    }
    for(let manga of malManga) {
        let id = manga["trackerIds"]["mal"];
        let category = manga["category"];
        if(category === "Light Novel") {
            if(!novelsToAdd.some(x => x["trackerIds"]["mal"] === id)) {
                novelsToAdd.push(manga);
            }
        } else {
            if(!mangaToAdd.some(x => x["trackerIds"]["mal"] === id)) {
                mangaToAdd.push(manga);
            }
        }
    }
    for(let anime of alAnime) {
        let id = anime["trackerIds"]["anilist"];
        let malId = anime["trackerIds"]["mal"];
        if(malId) {
            let found = animeToAdd.find(x => x["trackerIds"]["mal"] === malId);
            if(found) {
                found["trackerIds"]["anilist"] = id;
            } else {
                animeToAdd.push(anime);
            }
        } else {
            if(!animeToAdd.some(x => x["trackerIds"]["anilist"] === id)) {
                animeToAdd.push(anime);
            }
        }
    }
    for(let manga of alManga) {
        let id = manga["trackerIds"]["anilist"];
        let malId = manga["trackerIds"]["mal"];
        let category = manga["category"];
        if(category === "novel") {
            if(malId) {
                let found = novelsToAdd.find(x => x["trackerIds"]["mal"] === malId);
                if(found) {
                    found["trackerIds"]["anilist"] = id;
                } else {
                    novelsToAdd.push(manga);
                }
            } else {
                if(!novelsToAdd.some(x => x["trackerIds"]["anilist"] === id)) {
                    novelsToAdd.push(manga);
                }
            }
        } else {
            if(malId) {
                let found = mangaToAdd.find(x => x["trackerIds"]["mal"] === malId);
                if(found) {
                    found["trackerIds"]["anilist"] = id;
                } else {
                    mangaToAdd.push(manga);
                }
            } else {
                if(!mangaToAdd.some(x => x["trackerIds"]["anilist"] === id)) {
                    mangaToAdd.push(manga);
                }
            }
        }
    }
    console.log("Done deduping and splitting novels");
    console.log("Total anime to add: " + animeToAdd.length);
    console.log("Total manga to add: " + mangaToAdd.length);
    console.log("Total novels to add: " + novelsToAdd.length);
    console.log("Clearing anime");
    await database.removeAllAnime();
    console.log("Cleared anime");
    console.log("Adding anime to database");
    let count = 0;
    for(let anime of animeToAdd) {
        count++;
        if(count % 100 === 0) {
            console.log(`${count}/${animeToAdd.length}`);
        }
        await database.addAnime(anime.info, anime.trackerIds, {});
    }
    console.log("Added anime to database");
    console.log("Clearing manga");
    await database.removeAllManga();
    console.log("Cleared manga");
    console.log("Adding manga to database");
    count = 0;
    for(let manga of mangaToAdd) {
        count++;
        if(count % 100 === 0) {
            console.log(`${count}/${mangaToAdd.length}`);
        }
        await database.addManga(manga.info, manga.trackerIds, {});
    }
    console.log("Added manga to database");
    console.log("Clearing novels");
    await database.removeAllNovels();
    console.log("Cleared novels");
    console.log("Adding novels to database");
    count = 0;
    for(let novel of novelsToAdd) {
        count++;
        if(count % 100 === 0) {
            console.log(`${count}/${novelsToAdd.length}`);
        }
        await database.addNovel(novel.info, novel.trackerIds, {});
    }
    console.log("Added novels to database");
    console.log("Cleaning up");
    rmdirSync(`./MAL-Sync-Backup`, {recursive: true});
    console.log("Done cleaning up");
    process.exit(0);
}
main();