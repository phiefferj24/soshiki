import { Client } from 'pg';
import type { Medium, Json } from 'soshiki-types';
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

    async login(discord: string, access: string, refresh: string, expires: number): Promise<{id: string, access: string, refresh: string} | null> {
        try {
            let existing = await this.client.query(`
                SELECT * FROM users WHERE discord = $1
            `, [discord]);
            if (existing.rows.length === 0) {
                let id = await this.client.query(`
                    INSERT INTO users (discord, access, refresh)
                    VALUES ($1, $2, $3)
                    RETURNING id
                `, [discord, access, refresh]);
                let session = await this.getSession(id.rows[0].id, expires * 1000);
                return {id: id.rows[0].id, access: session.access, refresh: session.refresh};
            } else {
                let id = await this.client.query(`
                    UPDATE users SET access = $1, refresh = $2 WHERE discord = $3 RETURNING id
                `, [access, refresh, discord]
                );
                let session = await this.getSession(id.rows[0].id, expires * 1000);
                return {id: id.rows[0].id, access: session.access, refresh: session.refresh};
            }
        } catch (e) {
            return null;
        }
    }

    async verify(token: string): Promise<boolean> {
        try {
            let res = await this.client.query(`
                SELECT * FROM sessions WHERE access = $1
            `, [token]);
            if (res.rows.length === 0) {
                return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    async getSession(id: string, expires: number): Promise<Json | null> {
        try {
            let token = await this.client.query(`
                INSERT INTO sessions (id, expires) VALUES ($1, CAST ($2 AS TIMESTAMP))
                RETURNING *
            `, [id, new Date(Date.now() + expires)]);
            return token.rows[0];
        } catch (e) {
            return null;
        }
    }

    async refreshSession(token: string, expires: number): Promise<Json | null> {
        try {
            let session = await this.client.query(`
                DELETE FROM sessions WHERE refresh = $1 RETURNING *
            `, [token]);
            return await this.getSession(session.rows[0].id, expires);
        } catch (e) {
            return null;
        }
    }

    async logout(token: string): Promise<boolean> {
        try {
            await this.client.query(`
                DELETE FROM sessions WHERE access = $1
            `, [token]);
            return true;
        } catch (e) {
            return false;
        }
    }

    async getUser(id: string): Promise<Json | null> {
        try {
            const result = await this.client.query(`
                SELECT * FROM users WHERE id = $1
            `, [id]
            );
            return result.rows[0];
        } catch (e) {
            return null;
        }
    }

    async getPublicUser(id: string): Promise<Json | null> {
        try {
            const result = await this.client.query(`
                SELECT id, discord, data FROM users WHERE id = $1
            `, [id]);
            return result.rows[0];
        } catch (e) {
            return null;
        }
    }
    
    async getUserId(token: string): Promise<string | null> {
        try {
            const result = await this.client.query(`
                SELECT id FROM sessions WHERE access = $1
            `, [token]
            );
            return result.rows[0].id;
        } catch (e) {
            return null;
        }
    }

    async addUser(discord: string): Promise<string | null> {
        try {
            let id = await this.client.query(`
                INSERT INTO users (discord) VALUES ($1)
                RETURNING id
            `, [discord]);
            return id.rows[0].id;
        } catch (e) {
            return null;
        }
    }

    async deleteUser(id: string): Promise<boolean> {
        try {
            await this.client.query(`
                DELETE FROM users WHERE id = $1
            `, [id]
            );
            return true;
        } catch (e) {
            return false;
        }
    }

    async setUserConnection(id: string, connection: string, value: any): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT connections FROM users WHERE id = $1
            `, [id]);
            data = data.rows[0].connections;
            data[connection] = value;
            await this.client.query(`
                UPDATE users SET connections = $1 WHERE id = $2
            `, [data, id]);
            return true;
        } catch (e) {
            return false;
        }
    }

    async deleteUserConnection(id: string, connection: string): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT connections FROM users WHERE id = $1
            `, [id]);
            data = data.rows[0].connections;
            delete data[connection];
            await this.client.query(`
                UPDATE users SET connections = $1 WHERE id = $2
            `, [data, id]);
            return true;
        } catch (e) {
            return false;
        }
    }

    async setUserData(id: string, key: string, value: any): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT data FROM users WHERE id = $1
            `, [id]);
            data = data.rows[0].data;
            data[key] = value;
            await this.client.query(`
                UPDATE users SET data = $1 WHERE id = $2
            `, [data, id]);
            return true;
        } catch (e) {
            return false;
        }
    }

    async deleteUserData(id: string, key: string): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT data FROM users WHERE id = $1
            `, [id]);
            data = data.rows[0].data;
            delete data[key];
            await this.client.query(`
                UPDATE users SET data = $1 WHERE id = $2
            `, [data, id]);
            return true;
        } catch (e) {
            return false;
        }
    }

    async add(type: Medium, info: Json, trackerIds: Json, sourceIds: Json): Promise<boolean> {
        switch(type) {
            case 'manga': return await this.addManga(info, trackerIds, sourceIds);
            case 'anime': return await this.addAnime(info, trackerIds, sourceIds);
            case 'novel': return await this.addNovel(info, trackerIds, sourceIds);
            default: return false;
        }
    }

    async addManga(info: Json, trackerIds: Json, sourceIds: Json): Promise<boolean> {
        try {
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
            `, [info, trackerIds, sourceIds]
            );
            return true;
        } catch (e) {
            return false;
        }
    }
    async addAnime(info: Json, trackerIds: Json, sourceIds: Json): Promise<boolean> {
        try {
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
            return true;
        } catch (e) {
            return false;
        }
    }
    async addNovel(info: Json, trackerIds: Json, sourceIds: Json): Promise<boolean> {
        try {
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
            return true;
        } catch (e) {
            return false;
        }
    }

    async get(type: Medium, id: string): Promise<Json | null> {
        switch(type) {
            case 'manga':
                return await this.getManga(id);
            case 'anime':
                return await this.getAnime(id);
            case 'novel':
                return await this.getNovel(id);
        }
    }
    async getManga(id: string): Promise<Json | null> {
        try {
            const result = await this.client.query(`
                SELECT * FROM manga WHERE id = $1
            `, [id]
            );
            return result.rows[0];
        } catch (e) {
            return null;
        }
    }
    async getAnime(id: string): Promise<Json | null> {
        try {
            const result = await this.client.query(`
                SELECT * FROM anime WHERE id = $1
            `, [id]
            );
            return result.rows[0];
        } catch (e) {
            return null;
        }
    }
    async getNovel(id: string): Promise<Json | null> {
        try {
            const result = await this.client.query(`
                SELECT * FROM novels WHERE id = $1
            `, [id]
            );
            return result.rows[0];
        } catch (e) {
            return null;
        }
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

    async update(type: Medium, id: string, info: Json, trackerIds: Json, sourceIds: Json): Promise<boolean> {
        switch(type) {
            case 'manga': return await this.updateManga(id, info, trackerIds, sourceIds);
            case 'anime': return await this.updateAnime(id, info, trackerIds, sourceIds);
            case 'novel': return await this.updateNovel(id, info, trackerIds, sourceIds);
            default: return false;
        }
    }
    async updateManga(id: string, info: Json, trackerIds: Json, sourceIds: Json): Promise<boolean> {
        try {
            await this.client.query(`
                UPDATE manga SET
                    info = $1,
                    tracker_ids = $2,
                    source_ids = $3
                WHERE id = $4
            `, [info, trackerIds, sourceIds, id]
            );
            return true;
        } catch (e) {
            return false;
        }
    }
    async updateAnime(id: string, info: Json, trackerIds: Json, sourceIds: Json): Promise<boolean> {
        try {
            await this.client.query(`
                UPDATE anime SET
                    info = $1,
                    tracker_ids = $2,
                    source_ids = $3
                WHERE id = $4
            `, [info, trackerIds, sourceIds, id]
            );
            return true;
        } catch (e) {
            return false;
        }
    }
    async updateNovel(id: string, info: Json, trackerIds: Json, sourceIds: Json): Promise<boolean> {
        try {
            await this.client.query(`
                UPDATE novels SET
                    info = $1,
                    tracker_ids = $2,
                    source_ids = $3
                WHERE id = $4
            `, [info, trackerIds, sourceIds, id]
            );
            return true;
        } catch (e) {
            return false;
        }
    }

    async delete(type: Medium, id: string): Promise<boolean> {
        switch(type) {
            case 'manga': return await this.deleteManga(id);
            case 'anime': return await this.deleteAnime(id);
            case 'novel': return await this.deleteNovel(id);
            default: return false;
        }
    }
    async deleteManga(id: string): Promise<boolean> {
        try {
            await this.client.query(`
                DELETE FROM manga WHERE id = $1
            `, [id]
            );
            return true;
        } catch (e) {
            return false;
        }
    }
    async deleteAnime(id: string): Promise<boolean> {
        try {
            await this.client.query(`
                DELETE FROM anime WHERE id = $1
            `, [id]
            );
            return true;
        } catch (e) {
            return false;
        }
    }
    async deleteNovel(id: string): Promise<boolean> {
        try {
            await this.client.query(`
                DELETE FROM novels WHERE id = $1
            `, [id]
            );
            return true;
        } catch (e) {
            return false;
        }
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
        let results = (await this.client.query(`
                SELECT * FROM manga WHERE info->>'title' ILIKE $1
            `, [`%${query}%`]
        )).rows as Json[];
        results = results.concat(((await this.client.query(`
                SELECT * FROM manga WHERE info->>'alt_titles' ILIKE $1
            `, [`%${query}%`]
        )).rows as Json[]).filter((manga => !results.find(result => result.id === manga.id))));
        return results;
    }
    async findAnime(query: string): Promise<Json[]> {
        let results = (await this.client.query(`
                SELECT * FROM anime WHERE info->>'title' ILIKE $1
            `, [`%${query}%`]
        )).rows as Json[];
        results = results.concat(((await this.client.query(`
                SELECT * FROM anime WHERE info->>'alt_titles' ILIKE $1
            `, [`%${query}%`]
        )).rows as Json[]).filter(anime => !results.find(result => result.id === anime.id)));
        return results;
    }
    async findNovel(query: string): Promise<Json[]> {
        let results = (await this.client.query(`
                SELECT * FROM novels WHERE info->>'title' ILIKE $1
            `, [`%${query}%`]
        )).rows as Json[];
        results = results.concat(((await this.client.query(`
                SELECT * FROM novels WHERE info->>'alt_titles' ILIKE $1
            `, [`%${query}%`]
        )).rows as Json[]).filter(novel => !results.find(result => result.id === novel.id)));
        return results;
    }

    async updateInfo(type: Medium, id: string, info: Json): Promise<boolean> {
        switch(type) {
            case 'manga': return await this.updateMangaInfo(id, info);
            case 'anime': return await this.updateAnimeInfo(id, info);
            case 'novel': return await this.updateNovelInfo(id, info);
            default: return false;
        }
    }
    async updateMangaInfo(id: string, info: Json): Promise<boolean> {
        try {
            await this.client.query(`
                UPDATE manga SET info = $1 WHERE id = $2
            `, [info, id]
            );
            return true;
        } catch (e) {
            return false;
        }
    }
    async updateAnimeInfo(id: string, info: Json): Promise<boolean> {
        try {
            await this.client.query(`
                UPDATE anime SET info = $1 WHERE id = $2
            `, [info, id]
            );
            return true;
        } catch (e) {
            return false;
        }
    }
    async updateNovelInfo(id: string, info: Json): Promise<boolean> {
        try {
            await this.client.query(`
                UPDATE novels SET info = $1 WHERE id = $2
            `, [info, id]
            );
            return true;
        } catch (e) {
            return false;
        }
    }

    async updateTrackerIds(type: Medium, id: string, ids: Json): Promise<boolean> {
        switch(type) {
            case 'manga': return await this.updateMangaTrackerIds(id, ids);
            case 'anime': return await this.updateAnimeTrackerIds(id, ids);
            case 'novel': return await this.updateNovelTrackerIds(id, ids);
            default: return false;
        }
    }
    async updateMangaTrackerIds(id: string, ids: Json): Promise<boolean> {
        try {
            await this.client.query(`
                UPDATE manga SET tracker_ids = $1 WHERE id = $2
            `, [ids, id]
            );
            return true;
        } catch (e) {
            return false;
        }
    }
    async updateAnimeTrackerIds(id: string, ids: Json): Promise<boolean> {
        try {
            await this.client.query(`
                UPDATE anime SET tracker_ids = $1 WHERE id = $2
            `, [ids, id]
            );
            return true;
        } catch (e) {
            return false;
        }
    }
    async updateNovelTrackerIds(id: string, ids: Json): Promise<boolean> {
        try {
            await this.client.query(`
                UPDATE novels SET tracker_ids = $1 WHERE id = $2
            `, [ids, id]
            );
            return true;
        } catch (e) {
            return false;
        }
    }

    async updateSourceIds(type: Medium, id: string, ids: Json): Promise<boolean> {
        switch(type) {
            case 'manga': return await this.updateMangaSourceIds(id, ids);
            case 'anime': return await this.updateAnimeSourceIds(id, ids);
            case 'novel': return await this.updateNovelSourceIds(id, ids);
            default: return false;
        }
    } 
    async updateMangaSourceIds(id: string, ids: Json): Promise<boolean> {
        try {
            await this.client.query(`
                UPDATE manga SET source_ids = $1 WHERE id = $2
            `, [ids, id]
            );
            return true;
        } catch (e) {
            return false;
        }
    }
    async updateAnimeSourceIds(id: string, ids: Json): Promise<boolean> {
        try {
            await this.client.query(`
                UPDATE anime SET source_ids = $1 WHERE id = $2
            `, [ids, id]
            );
            return true;
        } catch (e) {
            return false;
        }
    }
    async updateNovelSourceIds(id: string, ids: Json): Promise<boolean> {
        try {
            await this.client.query(`
                UPDATE novels SET source_ids = $1 WHERE id = $2
            `, [ids, id]
            );
            return true;
        } catch (e) {
            return false;
        }
    }

    async setInfoProperty(type: Medium, id: string, property: string, value: any): Promise<boolean> {
        switch(type) {
            case 'manga': return await this.setMangaInfoProperty(id, property, value);
            case 'anime': return await this.setAnimeInfoProperty(id, property, value);
            case 'novel': return await this.setNovelInfoProperty(id, property, value);
            default: return false;
        }
    }
    async setMangaInfoProperty(id: string, property: string, value: any): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT info FROM manga WHERE id = $1
            `, [id]);
            if (!data.rows.length) return false;
            let info = data.rows[0].info;
            info[property] = value;
            await this.client.query(`
                UPDATE manga SET info = $1 WHERE id = $2
            `, [info, id]);
            return true;
        } catch (e) {
            return false;
        }
    }
    async setAnimeInfoProperty(id: string, property: string, value: any): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT info FROM anime WHERE id = $1
            `, [id]);
            if (!data.rows.length) return false;
            let info = data.rows[0].info;
            info[property] = value;
            await this.client.query(`
                UPDATE anime SET info = $1 WHERE id = $2
            `, [info, id]);
            return true;
        } catch (e) {
            return false;
        }
    }
    async setNovelInfoProperty(id: string, property: string, value: any): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT info FROM novels WHERE id = $1
            `, [id]);
            if (!data.rows.length) return false;
            let info = data.rows[0].info;
            info[property] = value;
            await this.client.query(`
                UPDATE novels SET info = $1 WHERE id = $2
            `, [info, id]);
            return true;
        } catch (e) {
            return false;
        }
    }

    async setTrackerId(type: Medium, id: string, property: string, value: string): Promise<boolean> {
        switch(type) {
            case 'manga': return await this.setMangaTrackerId(id, property, value);
            case 'anime': return await this.setAnimeTrackerId(id, property, value);
            case 'novel': return await this.setNovelTrackerId(id, property, value);
            default: return false;
        }
    }
    async setMangaTrackerId(id: string, property: string, value: string): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT tracker_ids FROM manga WHERE id = $1
            `, [id]);
            if (!data.rows.length) return false;
            let tracker_ids = data.rows[0].tracker_ids;
            tracker_ids[property] = value;
            await this.client.query(`
                UPDATE manga SET tracker_ids = $1 WHERE id = $2
            `, [tracker_ids, id]);
            return true;
        } catch (e) {
            return false;
        }
    }
    async setAnimeTrackerId(id: string, property: string, value: string): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT tracker_ids FROM anime WHERE id = $1
            `, [id]);
            if (!data.rows.length) return false;
            let tracker_ids = data.rows[0].tracker_ids;
            tracker_ids[property] = value;
            await this.client.query(`
                UPDATE anime SET tracker_ids = $1 WHERE id = $2
            `, [tracker_ids, id]);
            return true;
        } catch (e) {
            return false;
        }
    }
    async setNovelTrackerId(id: string, property: string, value: string): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT tracker_ids FROM novels WHERE id = $1
            `, [id]);
            if (!data.rows.length) return false;
            let tracker_ids = data.rows[0].tracker_ids;
            tracker_ids[property] = value;
            await this.client.query(`
                UPDATE novels SET tracker_ids = $1 WHERE id = $2
            `, [tracker_ids, id]);
            return true;
        } catch (e) {
            return false;
        }
    }

    async setSourceId(type: Medium, id: string, property: string, value: string): Promise<boolean> {
        switch(type) {
            case 'manga': return await this.setMangaSourceId(id, property, value);
            case 'anime': return await this.setAnimeSourceId(id, property, value);
            case 'novel': return await this.setNovelSourceId(id, property, value);
            default: return false;
        }
    }
    async setMangaSourceId(id: string, property: string, value: string): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT source_ids FROM manga WHERE id = $1
            `, [id]);
            if (!data.rows.length) return false;
            let source_ids = data.rows[0].source_ids;
            source_ids[property] = value;
            await this.client.query(`
                UPDATE manga SET source_ids = $1 WHERE id = $2
            `, [source_ids, id]);
            return true;
        } catch (e) {
            return false;
        }
    }
    async setAnimeSourceId(id: string, property: string, value: string): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT source_ids FROM anime WHERE id = $1
            `, [id]);
            if (!data.rows.length) return false;
            let source_ids = data.rows[0].source_ids;
            source_ids[property] = value;   
            await this.client.query(`
                UPDATE anime SET source_ids = $1 WHERE id = $2
            `, [source_ids, id]);
            return true;
        } catch (e) {
            return false;
        }
    }
    async setNovelSourceId(id: string, property: string, value: string): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT source_ids FROM novels WHERE id = $1
            `, [id]);
            if (!data.rows.length) return false;
            let source_ids = data.rows[0].source_ids;
            source_ids[property] = value;
            await this.client.query(`
                UPDATE novels SET source_ids = $1 WHERE id = $2
            `, [source_ids, id]);
            return true;
        } catch (e) {
            return false;
        }
    }

    async removeAll(type: Medium): Promise<boolean> {
        switch(type) {
            case 'manga': return await this.removeAllManga();
            case 'anime': return await this.removeAllAnime();
            case 'novel': return await this.removeAllNovels();
            default: return false;
        }
    }
    async removeAllManga(): Promise<boolean> {
        try {
            await this.client.query(`
                DELETE FROM manga
            `);
            return true;
        } catch (e) {
            return false;
        }
    }
    async removeAllAnime(): Promise<boolean> {
        try {
            await this.client.query(`
                DELETE FROM anime
            `);
            return true;
        } catch (e) {
            return false;
        }
    }
    async removeAllNovels(): Promise<boolean> {
        try {
            await this.client.query(`
                DELETE FROM novels
            `);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    async getLink(type: Medium, platform: string, source: string, id: string): Promise<string | null> {
        switch(type) {
            case 'manga': return await this.getMangaLink(platform, source, id);
            case 'anime': return await this.getAnimeLink(platform, source, id);
            case 'novel': return await this.getNovelLink(platform, source, id);
            default: return '';
        }
    }
    async getMangaLink(platform: string, source: string, id: string): Promise<string | null> {
        try {
            let data = await this.client.query(`
                SELECT * FROM manga WHERE source_ids->$1->$2->>'id' = $3
            `, [platform, source, id]);
            if (!data.rows.length) return null;
            return data.rows[0].id;
        } catch (e) {
            return null;
        }
    }
    async getAnimeLink(platform: string, source: string, id: string): Promise<string | null> {
        try {
            let data = await this.client.query(`
                SELECT * FROM anime WHERE source_ids->$1->$2->>'id' = $3
            `, [platform, source, id]);
            if (!data.rows.length) return null;
            return data.rows[0].id;
        } catch (e) {
            return null;
        }
    }
    async getNovelLink(platform: string, source: string, id: string): Promise<string | null> {
        try {
            let data = await this.client.query(`
                SELECT * FROM novels WHERE source_ids->$1->$2->>'id' = $3
            `, [platform, source, id]);
            if (!data.rows.length) return null;
            return data.rows[0].id;
        } catch (e) {
            return null;
        }
    }

    async setLink(type: Medium, platform: string, source: string, id: string, user: string, soshikiId: string): Promise<boolean> {
        switch(type) {
            case 'manga': return await this.setMangaLink(platform, source, id, user, soshikiId);
            case 'anime': return await this.setAnimeLink(platform, source, id, user, soshikiId);
            case 'novel': return await this.setNovelLink(platform, source, id, user, soshikiId);
            default: return false;
        }
    }
    async setMangaLink(platform: string, source: string, id: string, user: string, soshikiId: string): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT source_ids FROM manga WHERE id = $1
            `, [soshikiId]);
            if (!data.rows.length) return false;
            let source_ids = data.rows[0].source_ids;
            if (!source_ids[platform]) source_ids[platform] = {};
            source_ids[platform][source] = {id: id, user: user};
            await this.client.query(`
                UPDATE manga SET source_ids = $1 WHERE id = $2
            `, [source_ids, soshikiId]);
            return true;
        } catch (e) {
            return false;
        }
    }
    async setAnimeLink(platform: string, source: string, id: string, user: string, soshikiId: string): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT source_ids FROM anime WHERE id = $1
            `, [soshikiId]);
            if (!data.rows.length) return false;
            let source_ids = data.rows[0].source_ids;
            if (!source_ids[platform]) source_ids[platform] = {};
            source_ids[platform][source] = {id: id, user: user};
            await this.client.query(`
                UPDATE anime SET source_ids = $1 WHERE id = $2
            `, [source_ids, soshikiId]);
            return true;
        } catch (e) {
            return false;
        }
    }
    async setNovelLink(platform: string, source: string, id: string, user: string, soshikiId: string): Promise<boolean> {
        try {
            let data = await this.client.query(`
                SELECT source_ids FROM novels WHERE id = $1
            `, [soshikiId]);
            if (!data.rows.length) return false;
            let source_ids = data.rows[0].source_ids;
            if (!source_ids[platform]) source_ids[platform] = {};
            source_ids[platform][source] = {id: id, user: user};
            await this.client.query(`
                UPDATE novels SET source_ids = $1 WHERE id = $2
            `, [source_ids, soshikiId]);
            return true;
        } catch (e) {
            return false;
        }
    }
}