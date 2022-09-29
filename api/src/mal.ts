import { Json } from "soshiki-types";
import fetch from 'node-fetch';

export default class MAL {
    static async getAnime(id: string, token: string): Promise<Json> {
        return await fetch(`https://api.myanimelist.net/v2/anime/${id}?fields=id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then((res) => res.json());
    }
    static async getManga(id: string, token: string): Promise<Json> {
        return await fetch(`https://api.myanimelist.net/v2/manga/${id}?fields=id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_volumes,num_chapters,authors{first_name,last_name},pictures,background,related_anime,related_manga,recommendations,serialization{name}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then((res) => res.json());
    }
    static async createAnimeStatus(id: string, token: string, data: {episode?: number, status?: MediaStatus, rating?: number}) {
        let formData: string[] = [];
        if (typeof data.episode !== "undefined") formData.push(`num_watched_episodes=${Math.floor(data.episode)}`);
        if (typeof data.status !== "undefined") formData.push(`status=${data.status}`);
        if (typeof data.rating !== "undefined") formData.push(`score=${data.rating}`);
        await fetch(`https://api.myanimelist.net/v2/anime/${id}/my_list_status`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "PATCH",
            body: formData.join("&")
        });
        return id;
    }
    static async createMangaStatus(id: string, token: string, data: {chapter?: number, status?: MediaStatus, rating?: number}) {
        let formData: string[] = [];
        if (typeof data.chapter !== "undefined") formData.push(`num_chapters_read=${Math.floor(data.chapter)}`);
        if (typeof data.status !== "undefined") formData.push(`status=${data.status}`);
        if (typeof data.rating !== "undefined") formData.push(`score=${data.rating}`);
        await fetch(`https://api.myanimelist.net/v2/manga/${id}/my_list_status`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "PATCH",
            body: formData.join("&")
        });
        return id;
    }
    static async updateAnimeStatus(id: string, token: string, data: {episode?: number, status?: MediaStatus, rating?: number}) {
        return await this.createAnimeStatus(id, token, data);
    }
    static async updateMangaStatus(id: string, token: string, data: {chapter?: number, status?: MediaStatus, rating?: number}) {
        return await this.createMangaStatus(id, token, data);
    }
    static async deleteAnimeStatus(id: string, token: string) {
        await fetch(`https://api.myanimelist.net/v2/anime/${id}/my_list_status`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            method: "DELETE"
        });
    }
    static async deleteMangaStatus(id: string, token: string) {
        await fetch(`https://api.myanimelist.net/v2/manga/${id}/my_list_status`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            method: "DELETE"
        });
    }
}

export type MediaStatus = "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch" | "reading" | "plan_to_read"