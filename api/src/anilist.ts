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
}