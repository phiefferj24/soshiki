<script lang="ts" context="module">
    export async function load({ params, fetch }) {
        const info = await fetch(`https://api.soshiki.moe/info/manga/${params.id}`).then(res => res.json());
        return {
            stuff: { 
                info,
                head: {
                    title: `${info.info.anilist?.title?.english ?? info.info.mal?.alternative_titles?.en ?? info.info.title ?? ""}`,
                    description: `${info.info.anilist?.description ?? info.info.mal?.synopsis ?? ""}`,
                    image: `${info.info.anilist?.coverImage?.large ?? info.info.anilist?.coverImage?.medium ?? info.info.anilist?.coverImage?.small ?? info.info.anilist?.coverImage?.color ?? info.info.mal?.main_picture?.large ?? info.info.mal?.main_picture?.medium ?? info.info.cover ?? ""}`,
                }
            }
        }
    }
</script>

<slot />