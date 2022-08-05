import { Json } from "soshiki-types";

export default class AniList {
    static async getAnime(id: string, token: string): Promise<Json> {
        const gql = `
        query ($id: Int) {
            Media(id: $id, type: ANIME) {
                id
                idMal
                type
                title {
                    romaji
                    english
                    native
                    userPreferred
                }
                format
                status
                episodes
                description (asHtml: false)
                startDate {
                    year
                    month
                    day
                }
                endDate {
                    year
                    month
                    day
                }
                season
                seasonYear
                duration
                countryOfOrigin
                isLicensed
                source
                hashtag
                trailer {
                    id
                    site
                }
                updatedAt
                coverImage {
                    large: extraLarge
                    medium: large
                    small: medium
                    color
                }
                bannerImage
                genres
                synonyms
                averageScore
                meanScore
                favourites
                popularity
                trending
                tags {
                    name
                    isMediaSpoiler
                }
                relations {
                    nodes {
                        id
                        title {
                            english
                            native
                            romaji
                            userPreferred
                        }
                        coverImage {
                            large: extraLarge
                            medium: large
                            small: medium
                            color
                        }
                        type
                    }
                }
                characters {
                    nodes {
                        id
                        image {
                            large
                            medium
                        }
                        name {
                            first
                            middle
                            last
                            full
                            native
                            alternative
                            alternativeSpoiler
                            userPreferred
                        }
                    }
                }
                staff {
                    nodes {
                        id
                        image {
                            large
                            medium
                        }
                        name {
                            first
                            middle
                            last
                            full
                            native
                            alternative
                            userPreferred
                        }
                    }
                }
                studios {
                    nodes {
                        id
                        name
                        isAnimationStudio
                    }
                }
                isFavourite
                isAdult
                isLocked
                nextAiringEpisode {
                    timeUntilAiring
                    airingAt
                    episode
                }
                airingSchedule {
                    nodes {
                        airingAt
                        timeUntilAiring
                        episode
                    }
                }
                externalLinks {
                    url
                }
                streamingEpisodes {
                    title
                    thumbnail
                    url
                    site
                }
                rankings {
                    rank
                    type
                    context
                    year
                    season
                }
                mediaListEntry {
                    id
                    status
                }
                siteUrl
                modNotes
                stats {
                    scoreDistribution {
                        score
                        amount
                    }
                    statusDistribution {
                        status
                        amount
                    }
                }
                isRecommendationBlocked
                recommendations {
                    nodes {
                        mediaRecommendation {
                            id
                            title {
                                romaji
                                english
                                native
                                userPreferred
                            }
                            type
                            coverImage {
                                large: extraLarge
                                medium: large
                                small: medium
                                color
                            }
                        }
                    }
                }
            }
        }
        `;
        const variables = {
            id,
        };
        const res = await fetch(`https://graphql.anilist.co`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                query: gql,
                variables,
            }),
        });
        return (await res.json()).data.Media;
    }
    static async getManga(id: string, token: string): Promise<Json> {
        const gql = `
        query ($id: Int) {
            Media(id: $id, type: MANGA) {
                id
                idMal
                type
                title {
                    romaji
                    english
                    native
                    userPreferred
                }
                format
                status
                chapters
                volumes
                description (asHtml: false)
                startDate {
                    year
                    month
                    day
                }
                endDate {
                    year
                    month
                    day
                }
                season
                seasonYear
                countryOfOrigin
                isLicensed
                source
                hashtag
                trailer {
                    id
                    site
                }
                updatedAt
                coverImage {
                    large: extraLarge
                    medium: large
                    small: medium
                    color
                }
                bannerImage
                genres
                synonyms
                averageScore
                meanScore
                favourites
                popularity
                trending
                tags {
                    name
                    isMediaSpoiler
                }
                relations {
                    nodes {
                        id
                        title {
                            english
                            native
                            romaji
                            userPreferred
                        }
                        coverImage {
                            large: extraLarge
                            medium: large
                            small: medium
                            color
                        }
                        type
                    }
                }
                characters {
                    nodes {
                        id
                        image {
                            large
                            medium
                        }
                        name {
                            first
                            middle
                            last
                            full
                            native
                            alternative
                            alternativeSpoiler
                            userPreferred
                        }
                    }
                }
                staff {
                    nodes {
                        id
                        image {
                            large
                            medium
                        }
                        name {
                            first
                            middle
                            last
                            full
                            native
                            alternative
                            userPreferred
                        }
                    }
                }
                studios {
                    nodes {
                        id
                        name
                        isAnimationStudio
                    }
                }
                isFavourite
                isAdult
                isLocked
                rankings {
                    rank
                    type
                    context
                    year
                    season
                }
                mediaListEntry {
                    id
                    status
                }
                siteUrl
                modNotes
                stats {
                    scoreDistribution {
                        score
                        amount
                    }
                    statusDistribution {
                        status
                        amount
                    }
                }
                isRecommendationBlocked
                recommendations {
                    nodes {
                        mediaRecommendation {
                            id
                            title {
                                romaji
                                english
                                native
                                userPreferred
                            }
                            type
                            coverImage {
                                large: extraLarge
                                medium: large
                                small: medium
                                color
                            }
                        }
                    }
                }
            }
        }
        `;
        const variables = {
            id,
        };
        const res = await fetch(`https://graphql.anilist.co`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                query: gql,
                variables,
            }),
        });
        return (await res.json()).data.Media;
    }

    static async createAnimeStatus(aniId: number, token: string, data: {episode?: number, status?: MediaStatus, rating?: number}): Promise<number> {
        return await this.createMangaStatus(aniId, token, {chapter: data.episode, status: data.status});
    }

    static async createMangaStatus(aniId: number, token: string, data: {chapter?: number, status?: MediaStatus, rating?: number}): Promise<number> {
        const gql = `
        mutation ($mediaId: Int, $status: MediaListStatus, $progress: Int, $scoreRaw: Int) {
            SaveMediaListEntry (mediaId: $mediaId, status: $status, progress: $progress, scoreRaw: $scoreRaw) {
                id
            }
        }
        `
        let variables = { mediaId: aniId };
        if (typeof data.chapter !== "undefined") variables["progress"] = Math.floor(data.chapter);
        if (typeof data.status !== "undefined") variables["status"] = data.status;
        if (typeof data.rating !== "undefined") variables["scoreRaw"] = data.rating * 10;
        const res = await fetch(`https://graphql.anilist.co`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                query: gql,
                variables,
            }),
        });
        return (await res.json()).data.SaveMediaListEntry.id;
    }

    static async updateAnimeStatus(entryId: number, token: string, data: {episode?: number, status?: MediaStatus, rating?: number}): Promise<number> {
        return await this.updateMangaStatus(entryId, token, {chapter: data.episode, status: data.status});
    }

    static async updateMangaStatus(entryId: number, token: string, data: {chapter?: number, status?: MediaStatus, rating?: number}): Promise<number> {
        const gql = `
        mutation ($id: Int, $status: MediaListStatus, $progress: Int, $scoreRaw: Int) {
            SaveMediaListEntry (id: $id, status: $status, progress: $progress, scoreRaw: $scoreRaw) {
                id
            }
        }
        `
        let variables = { id: entryId };
        if (typeof data.chapter !== "undefined") variables["progress"] = Math.floor(data.chapter);
        if (typeof data.status !== "undefined") variables["status"] = data.status;
        if (typeof data.rating !== "undefined") variables["scoreRaw"] = data.rating * 10;
        const res = await fetch(`https://graphql.anilist.co`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                query: gql,
                variables,
            }),
        });
        return (await res.json()).data.SaveMediaListEntry.id;
    }
    static async deleteAnimeStatus(entryId: number, token: string) {
        const gql = `
        mutation ($id: Int) {
            DeleteMediaListEntry (id: $id) { deleted }
        }
        `
        const variables = { id: entryId }
        await fetch(`https://graphql.anilist.co`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                query: gql,
                variables,
            }),
        });
    }
    static async deleteMangaStatus(entryId: number, token: string) {
        return await this.deleteAnimeStatus(entryId, token);
    }
}
export type MediaStatus = "CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REPEATING";