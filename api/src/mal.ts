import { Json } from "soshiki-types";

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
}