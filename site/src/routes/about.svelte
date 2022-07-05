<div class="about">
    <div class="about-header">
        <span class="about-header-kanji">織</span>
        <span class="about-header-heading">Soshiki</span>
        <span class="about-header-subheading">A new generation website for watching anime, reading manga, or reading light novels.</span>
    </div>
    <div class="about-section">
        <span class="about-section-heading">What is Soshiki?</span>
        <span class="about-section-paragraph">
            Soshiki is a completely ad-free website for watching anime, reading manga, or reading light novels.<br/>
            Using sources from your favorite apps and websites, Soshiki pulls data from everywhere - meaning it will almost never go down.<br/>
            Soshiki also has built-in tracking with sites like MyAnimeList, AniList, and MangaUpdates.<br/>
            It also has linking between sources, so you'll be as updated as the most recent source.
        </span>
    </div>
    <div class="about-section">
        <span class="about-section-heading">Legal Disclaimer</span>
        <span class="about-section-paragraph">
            Soshiki does not take responsibility for any illegal actions committed using it.<br/>
            By using Soshiki, you assume full legal responsibility over anything you watch/read.<br/>
            Soshiki is not responsible for any copyrighted content that you may find on the site.<br/>
            Copyright complaints should be settled with the source that is hosting the copyrighted material.
        </span>
    </div>
    <div class="about-section">
        <span class="about-section-heading">Contact Us</span>
        <span class="about-section-paragraph">
            For suggestions, email <a href="mailto:suggestions@soshiki.moe" class="about-email">suggestions@soshiki.moe</a><br/>
            For support, email <a href="mailto:support@soshiki.moe" class="about-email">support@soshiki.moe</a><br/>
            For legal issues, email <a href="mailto:legal@soshiki.moe" class="about-email">legal@soshiki.moe</a><br/>
            For content removal, contact the source that hosts the content.
        </span>
    </div>
</div>

<style lang=scss>
    @use "../styles/global.scss" as *;
    .about {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        &-header {
            padding: 5rem 5rem 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #eee;
            width: 100%;
            text-align: center;
            @media (prefers-color-scheme: dark) {
                background-color: #2d2d2d;
            }
            &-kanji {
                font-size: 8rem;
                font-weight: 600;
            }
            &-heading {
                font-size: 3rem;
                font-weight: 700;
            }
            &-subheading {
                padding-top: 1rem;
                font-size: 1.25rem;
                font-weight: 600;
            }
        }
        &-section {
            padding: 2rem 5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            &-heading {
                font-size: 2rem;
                font-weight: 700;
            }
            &-paragraph {
                width: min(100%, 50rem);
                padding-top: 1rem;
                font-size: 1rem;
                font-weight: 600;
            }
        }
        &-email {
            color: $link-color-light;
            @media (prefers-color-scheme: dark) {
                color: $link-color-dark;
            }
            &:hover {
                text-decoration: underline;
            }
        }
    }
    br {
        display: block;
        margin: 0.25rem 0;
    }
</style>