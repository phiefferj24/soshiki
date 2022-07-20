<script lang="ts">
    import manifest from "$lib/manifest";
    import type { MangaSource, MangaChapter, MangaPage } from "soshiki-packages/manga/mangaSource";
    import { page } from "$app/stores"
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import LoadingBar from "$lib/LoadingBar.svelte";
import List from "$lib/List.svelte";

    export let source: MangaSource;
    let chapters: MangaChapter[];
    let chapterPages: MangaPage[];
    let previousChapterPages: MangaPage[];
    let nextChapterPages: MangaPage[];
    let chapterIndex: number;
    let pageNum: number;
    let mounted = false;
    let mangaId = $page.params.id;
    let chapterId = $page.params.chapter;

    let pagesDiv: HTMLDivElement;
    let rawScroll = 0;
    let rawPagesWidth = 0;
    let dpr = window.devicePixelRatio;
    $: pagesWidth = rawPagesWidth / dpr;
    $: scroll = rawScroll / dpr;

    let overlay: HTMLDivElement;

    let ignoreNextScroll = false;

    let changingChapter = false;

    let previousPage = pageNum;

    let loadedPages = 0;

    let settingsOpen = false;

    $: {
        if (mounted && loadedPages === previousChapterPages.length + chapterPages.length + nextChapterPages.length) {
            scrollToPage();
        }
    }

    $: updatePageNumber(scroll);

    function updatePageNumber(scroll: number) {
        if (!mounted) return;
        let newPageNumber = Math.floor(scroll / pagesWidth + 0.5) - previousChapterPages.length;
        if (newPageNumber !== pageNum) {
            let params = new URLSearchParams();
            params.set("page", newPageNumber.toString());
            goto(`?${params.toString()}`, { replaceState: true, noscroll: true })
            previousPage = pageNum;
            pageNum = newPageNumber;
        }
        if (scroll / pagesWidth - previousChapterPages.length <= 0 && !changingChapter && previousPage > pageNum) changeChapter(Direction.reverse);
        else if (scroll / pagesWidth - previousChapterPages.length >= chapterPages.length + 1 && !changingChapter && previousPage < pageNum) changeChapter(Direction.forward);
    }

    enum Direction {
        forward,
        reverse,
        none
    }

    async function init() {
        chapters = await source.getMangaChapters(mangaId);
        chapterIndex = chapters.findIndex(c => c.id === chapterId);
        chapterPages = await source.getMangaChapterPages(mangaId, chapterId);
        pageNum = parseInt($page.url.searchParams.get("page") ?? "1");
        await loadChapters(Direction.none);
        for (let item of previousChapterPages) {
            pagesDiv.appendChild(createPage(item, chapterIndex + 1));
        }
        pagesDiv.appendChild(createInfoPage(chapterIndex));
        for (let item of chapterPages) {
            pagesDiv.appendChild(createPage(item, chapterIndex));
        }
        pagesDiv.appendChild(createInfoPage(chapterIndex - 1));
        for (let item of nextChapterPages) {
            pagesDiv.appendChild(createPage(item, chapterIndex - 1));
        }
        ignoreNextScroll = true;
        pagesDiv.scrollTo({ left: (previousChapterPages.length + pageNum) * pagesWidth * dpr });
        mounted = true;
    }

    async function changeChapter(direction: Direction) {
        if (direction === Direction.forward) {
            if (chapterIndex === 0) return;
            changingChapter = true;
            pagesDiv.style.overflowX = "hidden";
            if (overlay.children.length > 1) overlay.removeChild(overlay.lastChild);
            overlay.appendChild(createInfoPage(chapterIndex - 1));
            overlay.style.display = "flex";
            overlay.style.left = rawScroll.toString() + "px";
            chapterIndex--;
            for (let i = 0; i < pagesDiv.children.length; i++) {
                let item = pagesDiv.children.item(i);
                if (item.getAttribute("data-chapter") === (chapterIndex + 2).toString() || item.getAttribute("data-chapterprev") === (chapterIndex + 2).toString()) {
                    item.remove();
                    i--; 
                }
            }
            await loadChapters(direction);
            pagesDiv.appendChild(createInfoPage(chapterIndex - 1))
            for (let item of nextChapterPages) {
                pagesDiv.appendChild(createPage(item, chapterIndex - 1));
            }
            ignoreNextScroll = true;
            pagesDiv.scrollTo({ left: (previousChapterPages.length) * pagesWidth * dpr });
            pageNum = 0;
            await goto($page.url.toString().replace(/\/read\/([^/]*)/, `/read/${chapters[chapterIndex].id}`), { noscroll: true });
        } else if (direction === Direction.reverse) {
            if (chapterIndex === chapters.length - 1) return;
            changingChapter = true;
            pagesDiv.style.overflowX = "hidden";
            if (overlay.children.length > 1) overlay.removeChild(overlay.lastChild);
            overlay.appendChild(createInfoPage(chapterIndex));
            overlay.style.display = "flex";
            overlay.style.left = rawScroll.toString() + "px";
            chapterIndex++;
            for (let i = 0; i < pagesDiv.children.length; i++) {
                let item = pagesDiv.children.item(i);
                if (item.getAttribute("data-chapter") === (chapterIndex - 2).toString() || item.getAttribute("data-chapternext") === (chapterIndex - 2).toString()) {
                    item.remove();
                    i--; 
                }
            }
            await loadChapters(direction);
            pagesDiv.insertBefore(createInfoPage(chapterIndex), pagesDiv.firstChild);
            for (let item of previousChapterPages.reverse()) {
                pagesDiv.insertBefore(createPage(item, chapterIndex + 1), pagesDiv.firstChild);
            }
            ignoreNextScroll = true;
            pagesDiv.scrollTo({ left: (previousChapterPages.length + chapterPages.length + 1) * pagesWidth * dpr });
            pageNum = chapterPages.length + 1;
            await goto($page.url.toString().replace(/\/read\/([^/]*)/, `/read/${chapters[chapterIndex].id}`), { noscroll: true });
        }
        overlay.style.display = "none";
        pagesDiv.style.overflowX = "scroll";
        changingChapter = false;
    }

    async function loadChapters(direction: Direction) {
        loadedPages = 0;
        if (direction === Direction.forward) {
            previousChapterPages = chapterPages;
            chapterPages = nextChapterPages;
            nextChapterPages = await source.getMangaChapterPages(mangaId, chapters[chapterIndex - 1].id);
        } else if (direction === Direction.reverse) {
            nextChapterPages = chapterPages;
            chapterPages = previousChapterPages;
            previousChapterPages = await source.getMangaChapterPages(mangaId, chapters[chapterIndex + 1].id);
        } else {
            previousChapterPages = await source.getMangaChapterPages(mangaId, chapters[chapterIndex - 1].id);
            chapterPages = await source.getMangaChapterPages(mangaId, chapterId);
            nextChapterPages = await source.getMangaChapterPages(mangaId, chapters[chapterIndex + 1].id);
        }
    }

    function createInfoPage(chapterIndex: number): HTMLDivElement {
        let infoPage = document.createElement("div");
        infoPage.classList.add("reader-info-page");
        infoPage.innerHTML = `
            ${chapterIndex === 0 ? "" : `<span class="reader-info-page-span">Previous: Chapter ${chapters[chapterIndex + 1].chapter}</span>`}
            ${chapterIndex === chapters.length - 1 ? "" : `<span class="reader-info-page-span">Next: Chapter ${chapters[chapterIndex].chapter}</span>`}
        `;
        infoPage.dataset.chapterprev = (chapterIndex + 1).toString();
        infoPage.dataset.chapternext = chapterIndex.toString();
        return infoPage;
    }

    function createPage(page: MangaPage, chapterIndex: number): HTMLImageElement {
        let img = document.createElement("img");
        img.src = page.base64 && page.base64.length > 0 ? page.base64 : `${manifest.proxy.url}/${page.url}`;
        img.classList.add("reader-page");
        img.dataset.chapter = chapterIndex.toString();
        img.onload = () => {loadedPages++};
        return img;
    }

    function scrollToPage() {
        ignoreNextScroll = true;
        pagesDiv.scrollTo({ left: (previousChapterPages.length + pageNum) * pagesWidth * dpr });
    }

    onMount(init);
</script>

<div class="container">
    <div class="reader">
        <div class="reader-controls reader-controls-top">
            <a href={$page.url.toString().replace(/\/read\/([^/]*)/, "/info")}>
                <i class="f7-icons reader-controls-glyph">xmark</i>
            </a>
            <div class="reader-controls-group">
                {#if chapters}
                    {#if chapters[chapterIndex + 1]}
                        <i class="f7-icons reader-controls-glyph" on:click={() => changeChapter(Direction.reverse)}>chevron_left</i>
                    {:else}
                        <div class="reader-controls-placeholder"></div>
                    {/if}
                    <span class="reader-controls-title">{`Chapter ${chapters[chapterIndex].chapter} ${chapters[chapterIndex].title ? `- ${chapters[chapterIndex].title}` : ""}`}</span>
                    {#if chapters[chapterIndex - 1]}
                        <i class="f7-icons reader-controls-glyph" on:click={() => changeChapter(Direction.forward)}>chevron_right</i>
                    {:else}
                        <div class="reader-controls-placeholder"></div>
                    {/if}
                {:else}
                    <div class="reader-controls-placeholder"></div>
                {/if}
            </div>
            <i class="f7-icons reader-controls-glyph" on:click={() => {settingsOpen = true}}>gear</i>
        </div>
        <div class="reader-pages" bind:this={pagesDiv} on:scroll={() => { 
                if (!ignoreNextScroll) rawScroll = pagesDiv.scrollLeft;
                else ignoreNextScroll = false;
            }} bind:clientWidth={rawPagesWidth}>
            <div class="reader-overlay" bind:this={overlay}>
                <div class="reader-overlay-loader">
                    <LoadingBar />
                </div>
            </div>
        </div>
        <div class="reader-controls reader-controls-bottom">
            {#if chapterPages}
                {#if pageNum > 0}
                    <i class="f7-icons reader-controls-glyph" on:click={() => {
                        pagesDiv.scrollBy({ left: -pagesWidth, behavior: "smooth" })
                    }}>chevron_left</i>
                {:else}
                    <div class="reader-controls-placeholder"></div>
                {/if}
                <span class="reader-controls-title">{`Page ${pageNum}`}</span>
                {#if pageNum < chapterPages.length + 1}
                    <i class="f7-icons reader-controls-glyph" on:click={() => {
                        pagesDiv.scrollBy({ left: pagesWidth, behavior: "smooth" })
                    }}>chevron_right</i>
                {:else}
                    <div class="reader-controls-placeholder"></div>
                {/if}
            {:else}
                <div class="reader-controls-placeholder"></div>
            {/if}
        </div>
    </div>
    <div class="settings" class:hidden={!settingsOpen}>
        <List title="Settings" exiting={true} on:click={() => settingsOpen = false}>

        </List>
    </div>
</div>
<style lang="scss">
    @use "../../styles/global.scss" as *;
    .reader {
        border: 2px solid $dropdown-border-color-light;
        background-color: $accent-background-color-light;
        @media (prefers-color-scheme: dark) {
            border-color: $dropdown-border-color-dark;
            background-color: $accent-background-color-dark;
        }
        display: flex;
        flex-direction: column;
        border-radius: 0.5rem;
        font-weight: bold;
        height: 100%;
        overflow: hidden;
        &-controls {
            padding: 0.25rem;
            width: 100%;
            gap: 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            &-top {
                border-bottom: 2px solid $dropdown-border-color-light;
                @media (prefers-color-scheme: dark) {
                    border-bottom-color: $dropdown-border-color-dark;
                }
            }
            &-bottom {
                border-top: 2px solid $dropdown-border-color-light;
                @media (prefers-color-scheme: dark) {
                    border-top-color: $dropdown-border-color-dark;
                }
            }
            &-group {
                gap: 2rem;
                display: flex;
                align-items: center;
                justify-content: stretch;
                min-width: 0;
            }
            &-title {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                min-width: 0;
            }
            &-glyph {
                width: fit-content;
            }
            &-placeholder {
                width: 1.5rem;
                height: 1.5rem;
                @media (max-width: 480px) {
                    width: 1.125rem;
                    height: 1.125rem;
                }
            }
        }
        &-pages {
            scroll-snap-type: x mandatory;
            overflow-x: scroll;
            overflow-y: hidden;
            display: flex;
            &::-webkit-scrollbar {
                display: none;
            }
            scroll-behavior: auto;
            scrollbar-width: none;
            align-items: stretch;
            flex-shrink: 0;
        }
        &-overlay {
            position: absolute;
            top: 0;
            z-index: 1;
            width: 100%;
            height: 100%;
            flex-shrink: 0;
            background-color: $accent-background-color-light;
            @media (prefers-color-scheme: dark) {
                background-color: $accent-background-color-dark;
            }
            &-loader {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                z-index: 2;
            }
        }
    }
    :global(.reader-page) {
        width: 100%;
        height: 100%;
        flex-shrink: 0;
        object-fit: contain;
        scroll-snap-align: center;
    }
    :global(.reader-info-page) {
        width: 100%;
        flex-shrink: 0;
        scroll-snap-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 1rem;
    }
    :global(.reader-info-page-span) {
        font-size: 1.5rem;
    }
    [class*="-glyph"] {
        cursor: pointer;
    }

    .settings {
        margin: 4rem 2rem;
        z-index: 3;
        height: 600px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
    }
    .hidden {
        display: none;
    }

    .container {
        position: relative;
    }
</style>