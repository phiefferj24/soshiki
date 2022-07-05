import { Client } from 'pg';
type Medium = 'manga' | 'anime' | 'novel';
type Json = { [key: string]: any };
export default class Database {
    client: Client;
    private constructor(client: Client) {
        this.client = client;
    }

    static async connect(): Promise<Database> {
        const client = new Client();
        await client.connect();
        return new Database(client);
    }

    async add(type: Medium, info: Json, trackerIds: Json, sourceIds: Json): Promise<void> {
        switch(type) {
            case 'manga':
                await this.addManga(info, trackerIds, sourceIds);
                break;
            case 'anime':
                await this.addAnime(info, trackerIds, sourceIds);
                break;
            case 'novel':
                await this.addNovel(info, trackerIds, sourceIds);
                break;
        }
    }

    async addManga(info: Json, trackerIds: Json, sourceIds: Json): Promise<void> {
        await this.client.query(`
            INSERT INTO manga (
                info,
                tracker_ids,
                source_ids
            ) VALUES (
                $1,
                $2,
                $3
            )
        `, [info, trackerIds, sourceIds ]
        );
    }
    async addAnime(info: Json, trackerIds: Json, sourceIds: Json): Promise<void> {
        await this.client.query(`
            INSERT INTO anime (
                info,
                tracker_ids,
                source_ids
            ) VALUES (
                $1,
                $2,
                $3
            )
        `, [info, trackerIds, sourceIds ]
        );
    }
    async addNovel(info: Json, trackerIds: Json, sourceIds: Json): Promise<void> {
        await this.client.query(`
            INSERT INTO novels (
                info,
                tracker_ids,
                source_ids
            ) VALUES (
                $1,
                $2,
                $3
            )
        `, [info, trackerIds, sourceIds ]
        );
    }

    async get(type: Medium, id: string): Promise<Json> {
        switch(type) {
            case 'manga':
                return await this.getManga(id);
            case 'anime':
                return await this.getAnime(id);
            case 'novel':
                return await this.getNovel(id);
        }
    }
    async getManga(id: string): Promise<Json> {
        const result = await this.client.query(`
            SELECT * FROM manga WHERE id = $1
        `, [id]
        );
        return result.rows[0];
    }
    async getAnime(id: string): Promise<Json> {
        const result = await this.client.query(`
            SELECT * FROM anime WHERE id = $1
        `, [id]
        );
        return result.rows[0];
    }
    async getNovel(id: string): Promise<Json> {
        const result = await this.client.query(`
            SELECT * FROM novels WHERE id = $1
        `, [id]
        );
        return result.rows[0];
    }

    async getAll(type: Medium): Promise<Json[]> {
        switch(type) {
            case 'manga':
                return await this.getAllManga();
            case 'anime':
                return await this.getAllAnime();
            case 'novel':
                return await this.getAllNovel();
        }
    }
    async getAllManga(): Promise<Json[]> {
        const result = await this.client.query(`
            SELECT * FROM manga
        `);
        return result.rows;
    }
    async getAllAnime(): Promise<Json[]> {
        const result = await this.client.query(`
            SELECT * FROM anime
        `);
        return result.rows;
    }
    async getAllNovel(): Promise<Json[]> {
        const result = await this.client.query(`
            SELECT * FROM novels
        `);
        return result.rows;
    }

    async update(type: Medium, id: string, info: Json, trackerIds: Json, sourceIds: Json): Promise<void> {
        switch(type) {
            case 'manga':
                await this.updateManga(id, info, trackerIds, sourceIds);
                break;
            case 'anime':
                await this.updateAnime(id, info, trackerIds, sourceIds);
                break;
            case 'novel':
                await this.updateNovel(id, info, trackerIds, sourceIds);
                break;
        }
    }
    async updateManga(id: string, info: Json, trackerIds: Json, sourceIds: Json): Promise<void> {
        await this.client.query(`
            UPDATE manga SET
                info = $1,
                tracker_ids = $2,
                source_ids = $3
            WHERE id = $4
        `, [info, trackerIds, sourceIds, id]
        );
    }
    async updateAnime(id: string, info: Json, trackerIds: Json, sourceIds: Json): Promise<void> {
        await this.client.query(`
            UPDATE anime SET
                info = $1,
                tracker_ids = $2,
                source_ids = $3
            WHERE id = $4
        `, [info, trackerIds, sourceIds, id]
        );
    }
    async updateNovel(id: string, info: Json, trackerIds: Json, sourceIds: Json): Promise<void> {
        await this.client.query(`
            UPDATE novels SET
                info = $1,
                tracker_ids = $2,
                source_ids = $3
            WHERE id = $4
        `, [info, trackerIds, sourceIds, id]
        );
    }

    async delete(type: Medium, id: string): Promise<void> {
        switch(type) {
            case 'manga':
                await this.deleteManga(id);
                break;
            case 'anime':
                await this.deleteAnime(id);
                break;
            case 'novel':
                await this.deleteNovel(id);
                break;
        }
    }
    async deleteManga(id: string): Promise<void> {
        await this.client.query(`
            DELETE FROM manga WHERE id = $1
        `, [id]
        );
    }
    async deleteAnime(id: string): Promise<void> {
        await this.client.query(`
            DELETE FROM anime WHERE id = $1
        `, [id]
        );
    }
    async deleteNovel(id: string): Promise<void> {
        await this.client.query(`
            DELETE FROM novels WHERE id = $1
        `, [id]
        );
    }

    async find(type: Medium, query: string): Promise<Json[]> {
        switch(type) {
            case 'manga':
                return await this.findManga(query);
            case 'anime':
                return await this.findAnime(query);
            case 'novel':
                return await this.findNovel(query);
        }
    }
    async findManga(query: string): Promise<Json[]> {
        const all = await this.getAllManga();
        const queries = query.split(' ');
        let results: Json[] = [];
        for(let result of all) {
            const title = result.info.title || "";
            for (let q of queries) {
                if (title.toLowerCase().includes(q.toLowerCase())) {
                    results.push(result);
                    break;
                }
            }
        }
        for(let result of all) {
            if(results.some((value) => value.id === result.id)) continue;
            const altTitles = result.info.alt_titles || [];
            for (let q of queries) {
                for (let altTitle of altTitles) {
                    if (altTitle.toLowerCase().includes(q.toLowerCase())) {
                        results.push(result);
                        break;
                    }
                }
            }
        }
        for(let result of all) {
            if(results.some((value) => value.id === result.id)) continue;
            const author = result.info.author || "";
            for (let q of queries) {
                if (author.toLowerCase().includes(q.toLowerCase())) {
                    results.push(result);
                    break;
                }
            }
        }
        for(let result of all) {
            if(results.some((value) => value.id === result.id)) continue;
            const artist = result.info.artist || "";
            for (let q of queries) {
                if (artist.toLowerCase().includes(q.toLowerCase())) {
                    results.push(result);
                    break;
                }
            }
        }
        return results;
    }
    async findAnime(query: string): Promise<Json[]> {
        const all = await this.getAllAnime();
        const queries = query.split(' ');
        let results: Json[] = [];
        for(let result of all) {
            const title = result.info.title || "";
            for (let q of queries) {
                if (title.toLowerCase().includes(q.toLowerCase())) {
                    results.push(result);
                    break;
                }
            }
        }
        for(let result of all) {
            if(results.some((value) => value.id === result.id)) continue;
            const altTitles = result.info.alt_titles || [];
            for (let q of queries) {
                for (let altTitle of altTitles) {
                    if (altTitle.toLowerCase().includes(q.toLowerCase())) {
                        results.push(result);
                        break;
                    }
                }
            }
        }
        for(let result of all) {
            if(results.some((value) => value.id === result.id)) continue;
            const author = result.info.author || "";
            for (let q of queries) {
                if (author.toLowerCase().includes(q.toLowerCase())) {
                    results.push(result);
                    break;
                }
            }
        }
        for(let result of all) {
            if(results.some((value) => value.id === result.id)) continue;
            const artist = result.info.artist || "";
            for (let q of queries) {
                if (artist.toLowerCase().includes(q.toLowerCase())) {
                    results.push(result);
                    break;
                }
            }
        }
        return results;
    }
    async findNovel(query: string): Promise<Json[]> {
        const all = await this.getAllNovel();
        const queries = query.split(' ');
        let results: Json[] = [];
        for(let result of all) {
            const title = result.info.title || "";
            for (let q of queries) {
                if (title.toLowerCase().includes(q.toLowerCase())) {
                    results.push(result);
                    break;
                }
            }
        }
        for(let result of all) {
            if(results.some((value) => value.id === result.id)) continue;
            const author = result.info.author || "";
            for (let q of queries) {
                if (author.toLowerCase().includes(q.toLowerCase())) {
                    results.push(result);
                    break;
                }
            }
        }
        return results;
    }

    async updateInfo(type: Medium, id: string, info: Json): Promise<void> {
        switch(type) {
            case 'manga':
                await this.updateMangaInfo(id, info);
                break;
            case 'anime':
                await this.updateAnimeInfo(id, info);
                break;
            case 'novel':
                await this.updateNovelInfo(id, info);
                break;
        }
    }
    async updateMangaInfo(id: string, info: Json): Promise<void> {
        await this.client.query(`
            UPDATE manga SET info = $1 WHERE id = $2
        `, [info, id]
        );
    }
    async updateAnimeInfo(id: string, info: Json): Promise<void> {
        await this.client.query(`
            UPDATE anime SET info = $1 WHERE id = $2
        `, [info, id]
        );
    }
    async updateNovelInfo(id: string, info: Json): Promise<void> {
        await this.client.query(`
            UPDATE novels SET info = $1 WHERE id = $2
        `, [info, id]
        );
    }

    async updateTrackerIds(type: Medium, id: string, ids: Json): Promise<void> {
        switch(type) {
            case 'manga':
                await this.updateMangaTrackerIds(id, ids);
                break;
            case 'anime':
                await this.updateAnimeTrackerIds(id, ids);
                break;
            case 'novel':
                await this.updateNovelTrackerIds(id, ids);
                break;
        }
    }
    async updateMangaTrackerIds(id: string, ids: Json): Promise<void> {
        await this.client.query(`
            UPDATE manga SET tracker_ids = $1 WHERE id = $2
        `, [ids, id]
        );
    }
    async updateAnimeTrackerIds(id: string, ids: Json): Promise<void> {
        await this.client.query(`
            UPDATE anime SET tracker_ids = $1 WHERE id = $2
        `, [ids, id]
        );
    }
    async updateNovelTrackerIds(id: string, ids: Json): Promise<void> {
        await this.client.query(`
            UPDATE novels SET tracker_ids = $1 WHERE id = $2
        `, [ids, id]
        );
    }

    async updateSourceIds(type: Medium, id: string, ids: Json): Promise<void> {
        switch(type) {
            case 'manga':
                await this.updateMangaSourceIds(id, ids);
                break;
            case 'anime':
                await this.updateAnimeSourceIds(id, ids);
                break;
            case 'novel':
                await this.updateNovelSourceIds(id, ids);
                break;
        }
    } 
    async updateMangaSourceIds(id: string, ids: Json): Promise<void> {
        await this.client.query(`
            UPDATE manga SET source_ids = $1 WHERE id = $2
        `, [ids, id]
        );
    }
    async updateAnimeSourceIds(id: string, ids: Json): Promise<void> {
        await this.client.query(`
            UPDATE anime SET source_ids = $1 WHERE id = $2
        `, [ids, id]
        );
    }
    async updateNovelSourceIds(id: string, ids: Json): Promise<void> {
        await this.client.query(`
            UPDATE novels SET source_ids = $1 WHERE id = $2
        `, [ids, id]
        );
    }

    async setInfoProperty(type: Medium, id: string, property: string, value: string): Promise<void> {
        switch(type) {
            case 'manga':
                await this.setMangaInfoProperty(id, property, value);
                break;
            case 'anime':
                await this.setAnimeInfoProperty(id, property, value);
                break;
            case 'novel':
                await this.setNovelInfoProperty(id, property, value);
                break;
        }
    }
    async setMangaInfoProperty(id: string, property: string, value: string): Promise<void> {
        await this.client.query(`
            UPDATE manga SET info->>$1 = $2 WHERE id = $3
        `, [property, value, id]
        );
    }
    async setAnimeInfoProperty(id: string, property: string, value: string): Promise<void> {
        await this.client.query(`
            UPDATE anime SET info->>$1 = $2 WHERE id = $3
        `, [property, value, id]
        );
    }
    async setNovelInfoProperty(id: string, property: string, value: string): Promise<void> {
        await this.client.query(`
            UPDATE novels SET info->>$1 = $2 WHERE id = $3
        `, [property, value, id]
        );
    }

    async setTrackerId(type: Medium, id: string, property: string, value: string): Promise<void> {
        switch(type) {
            case 'manga':
                await this.setMangaTrackerId(id, property, value);
                break;
            case 'anime':
                await this.setAnimeTrackerId(id, property, value);
                break;
            case 'novel':
                await this.setNovelTrackerId(id, property, value);
                break;
        }
    }
    async setMangaTrackerId(id: string, property: string, value: string): Promise<void> {
        await this.client.query(`
            UPDATE manga SET tracker_ids->>$1 = $2 WHERE id = $3
        `, [property, value, id]
        );
    }
    async setAnimeTrackerId(id: string, property: string, value: string): Promise<void> {
        await this.client.query(`
            UPDATE anime SET tracker_ids->>$1 = $2 WHERE id = $3
        `, [property, value, id]
        );
    }
    async setNovelTrackerId(id: string, property: string, value: string): Promise<void> {
        await this.client.query(`
            UPDATE novels SET tracker_ids->>$1 = $2 WHERE id = $3
        `, [property, value, id]
        );
    }

    async setSourceId(type: Medium, id: string, property: string, value: string): Promise<void> {
        switch(type) {
            case 'manga':
                await this.setMangaSourceId(id, property, value);
                break;
            case 'anime':
                await this.setAnimeSourceId(id, property, value);
                break;
            case 'novel':
                await this.setNovelSourceId(id, property, value);
                break;
        }
    }
    async setMangaSourceId(id: string, property: string, value: string): Promise<void> {
        await this.client.query(`
            UPDATE manga SET source_ids->>$1 = $2 WHERE id = $3
        `, [property, value, id]
        );
    }
    async setAnimeSourceId(id: string, property: string, value: string): Promise<void> {
        await this.client.query(`
            UPDATE anime SET source_ids->>$1 = $2 WHERE id = $3
        `, [property, value, id]
        );
    }
    async setNovelSourceId(id: string, property: string, value: string): Promise<void> {
        await this.client.query(`
            UPDATE novels SET source_ids->>$1 = $2 WHERE id = $3
        `, [property, value, id]
        );
    }
}