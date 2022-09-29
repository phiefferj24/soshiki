<script lang="ts">
    import type { MangaSource, MangaChapter, MangaPage } from "soshiki-packages/manga/mangaSource";
    import { page } from "$app/stores"
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import LoadingBar from "$lib/LoadingBar.svelte";
    import List from "$lib/List.svelte";
    import Dropdown from "$lib/Dropdown.svelte";
    import Cookie from "js-cookie";
    import { tracker, proxy } from "$lib/stores";

    export let fullscreen: boolean;
    $: updateFullscreen(fullscreen);

    async function updateFullscreen(fullscreen: boolean) {
        let params = $page.url.searchParams;
        if (fullscreen) {
            params.set("fullscreen", "true");
        } else {
            params.delete("fullscreen")
        }
        await goto(`?${params.toString()}`, { replaceState: true, noscroll: true });
        await new Promise(res => setTimeout(() => {res(void 0)}, 50));
        scrollToPage();
    }

    export let sources: {[platform: string]: {[sourceId: string]: MangaSource}};
    export let chapters: MangaChapter[];
    let chapterPages: MangaPage[];
    let previousChapterPages: MangaPage[];
    let nextChapterPages: MangaPage[];
    let chapterIndex = parseInt($page.params.chapter);
    let pageNum: number;
    let mounted = false;

    let pagesDiv: HTMLDivElement;
    let rawScrollLeft = 0;
    let rawScrollTop = 0;
    let rawPagesWidth = 0;
    let dpr = window.devicePixelRatio;
    $: pagesWidth = rawPagesWidth / dpr;
    $: scrollLeft = rawScrollLeft / dpr;
    $: scrollTop = rawScrollTop / dpr;

    let overlay: HTMLDivElement;

    let ignoreNextScroll = false;

    let changingChapter = false;

    let previousPage = pageNum;

    let loadedPages = 0;

    let settingsOpen = false;

    enum ReadingMode {
        ltr = "Left to Right",
        rtl = "Right to Left",
        vertical = "Vertical"
    }
    export let readingMode = ReadingMode.ltr;
    $: updateReadingMode(readingMode);

    $: {
        if (mounted && loadedPages === previousChapterPages.length + chapterPages.length + nextChapterPages.length) {
            scrollToPage();
        }
    }

    $: updatePageNumber(scrollTop, scrollLeft);

    function updatePageNumber(scrollTop: number, scrollLeft: number) {
        let scroll = readingMode === ReadingMode.vertical ? scrollTop : scrollLeft;
        if (!mounted) return;
        if (readingMode === ReadingMode.vertical) {
            let offset = 0;
            let newPageNumber = -previousChapterPages.length;
            for (let i = 0; i < pagesDiv.children.length && offset < scroll * dpr - pagesDiv.children.item(i).clientHeight / 2; i++) {
                let item = pagesDiv.children.item(i);
                if (item.getAttribute("data-chapter") || item.getAttribute("data-chapterprev")) {
                    offset += item.clientHeight;
                    newPageNumber++;
                }
            }
            if (newPageNumber !== pageNum) {
                let params = $page.url.searchParams;
                params.set("page", newPageNumber.toString());
                goto(`?${params.toString()}`, { replaceState: true, noscroll: true })
                previousPage = pageNum;
                pageNum = newPageNumber;
            }
            if (scroll * dpr <= getRawVerticalPageOffset(0) && !changingChapter && previousPage > pageNum) changeChapter(Direction.reverse);
            else if (scroll * dpr >= getRawVerticalPageOffset(chapterPages.length + 1) && !changingChapter && previousPage < pageNum) changeChapter(Direction.forward);
        } else {
            let newPageNumber = readingMode === ReadingMode.rtl ? chapterPages.length + 1 - Math.floor(scroll / pagesWidth + 0.5) + nextChapterPages.length : Math.floor(scroll / pagesWidth + 0.5) - previousChapterPages.length;
            if (newPageNumber !== pageNum) {
                let params = $page.url.searchParams;
                params.set("page", newPageNumber.toString());
                goto(`?${params.toString()}`, { replaceState: true, noscroll: true })
                previousPage = pageNum;
                pageNum = newPageNumber;
            }
            if (readingMode === ReadingMode.rtl) {
                if (chapterPages.length + 1 - scroll / pagesWidth + nextChapterPages.length <= 0 && !changingChapter && previousPage > pageNum) changeChapter(Direction.reverse);
                else if (chapterPages.length + 1 - scroll / pagesWidth + nextChapterPages.length >= chapterPages.length + 1 && !changingChapter && previousPage < pageNum) changeChapter(Direction.forward);
            } else {
                if (scroll / pagesWidth - previousChapterPages.length <= 0 && !changingChapter && previousPage > pageNum) changeChapter(Direction.reverse);
                else if (scroll / pagesWidth - previousChapterPages.length >= chapterPages.length + 1 && !changingChapter && previousPage < pageNum) changeChapter(Direction.forward);
            }
        }
    }

    function updateReadingMode(mode: ReadingMode) {
        if (!mounted) return;
        loadedPages = 0;
        for (let i = 0; i < pagesDiv.children.length; i++) {
            let item = pagesDiv.children.item(i);
            if (item.getAttribute("data-chapter") || item.getAttribute("data-chapterprev")) {
                item.remove();
                i--; 
            }
        }
        if (mode === ReadingMode.ltr) {
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
        } else if (mode === ReadingMode.rtl) {
            for (let item of nextChapterPages.reverse()) {
                pagesDiv.appendChild(createPage(item, chapterIndex - 1));
            }
            pagesDiv.appendChild(createInfoPage(chapterIndex - 1));
            for (let item of chapterPages.reverse()) {
                pagesDiv.appendChild(createPage(item, chapterIndex));
            }
            pagesDiv.appendChild(createInfoPage(chapterIndex));
            for (let item of previousChapterPages.reverse()) {
                pagesDiv.appendChild(createPage(item, chapterIndex + 1));
            }
            ignoreNextScroll = true;
            pagesDiv.scrollTo({ left: (previousChapterPages.length + pageNum) * pagesWidth * dpr });
        } else {
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
            pagesDiv.scrollTo({ top: getRawVerticalPageOffset(pageNum) });
        }
    }

    enum Direction {
        forward,
        reverse,
        none
    }

    async function init() {
        chapterPages = await sources[chapters[chapterIndex]["platform"]][chapters[chapterIndex]["sourceId"]].getMangaChapterPages(chapters[chapterIndex]["mangaId"], chapters[chapterIndex].id);
        pageNum = parseInt($page.url.searchParams.get("page") ?? "1");
        await loadChapters(Direction.none);
        if (readingMode === ReadingMode.rtl) {
            for (let item of nextChapterPages.reverse()) {
                pagesDiv.appendChild(createPage(item, chapterIndex - 1));
            }
            pagesDiv.appendChild(createInfoPage(chapterIndex - 1));
            for (let item of chapterPages.reverse()) {
                pagesDiv.appendChild(createPage(item, chapterIndex));
            }
            pagesDiv.appendChild(createInfoPage(chapterIndex));
            for (let item of previousChapterPages.reverse()) {
                pagesDiv.appendChild(createPage(item, chapterIndex + 1));
            }
        } else {
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
        }
        ignoreNextScroll = true;
        if (readingMode === ReadingMode.rtl) {
            pagesDiv.scrollTo({ left: (nextChapterPages.length + chapterPages.length + 1 - pageNum) * pagesWidth * dpr });
        } else if (readingMode === ReadingMode.ltr) {
            pagesDiv.scrollTo({ left: (previousChapterPages.length + pageNum) * pagesWidth * dpr });
        } else {
            pagesDiv.scrollTo({ top: getRawVerticalPageOffset(pageNum) });
        }
        mounted = true;
    }

    function getRawVerticalPageOffset(page: number) {
        let offset = 0;
        for (let i = 0; i < pagesDiv.children.length; i++) {
            let item = pagesDiv.children.item(i);
            if ((item.getAttribute("data-chapter") === chapterIndex.toString() || item.getAttribute("data-chapternext") === chapterIndex.toString()) && item.getAttribute("data-page") === page.toString() || item.getAttribute("data-chapterprev") === chapterIndex.toString()) {
                break;
            }
            if (item.getAttribute("data-chapter") || item.getAttribute("data-chapterprev")) {
                //console.log(chapterIndex, page, item.getAttribute("data-chapter"), item.getAttribute("data-chapterprev"), item.getAttribute("data-page"))
                offset += item.clientHeight;
            }
        }
        return offset;
    }

    async function changeChapter(direction: Direction) {
        if (direction === Direction.forward) {
            if (chapterIndex === 0) return;
            changingChapter = true;
            if (readingMode === ReadingMode.vertical) {
                pagesDiv.style.overflowY = "hidden";
            } else {    
                pagesDiv.style.overflowX = "hidden";
            }
            if (overlay.children.length > 1) overlay.removeChild(overlay.lastChild);
            overlay.appendChild(createInfoPage(chapterIndex - 1));
            overlay.style.display = "flex";
            if (readingMode === ReadingMode.vertical) {
                overlay.style.left = "0";
                overlay.style.top = rawScrollTop.toString() + "px";
            } else {
                overlay.style.left = rawScrollLeft.toString() + "px";
                overlay.style.top = "0";
            }
            chapterIndex--;
            for (let i = 0; i < pagesDiv.children.length; i++) {
                let item = pagesDiv.children.item(i);
                if (item.getAttribute("data-chapter") === (chapterIndex + 2).toString() || item.getAttribute("data-chapterprev") === (chapterIndex + 2).toString()) {
                    item.remove();
                    i--; 
                }
            }
            await loadChapters(direction);
            if (readingMode === ReadingMode.rtl) {
                pagesDiv.insertBefore(createInfoPage(chapterIndex - 1), pagesDiv.firstChild);
                for (let item of nextChapterPages.reverse()) {
                    pagesDiv.insertBefore(createPage(item, chapterIndex - 1), pagesDiv.firstChild);
                }
                ignoreNextScroll = true;
                pagesDiv.scrollTo({ left: (nextChapterPages.length + chapterPages.length + 1) * pagesWidth * dpr });
            } else {
                pagesDiv.appendChild(createInfoPage(chapterIndex - 1))
                for (let item of nextChapterPages) {
                    pagesDiv.appendChild(createPage(item, chapterIndex - 1));
                }
                ignoreNextScroll = true;
                if (readingMode === ReadingMode.ltr) {
                    pagesDiv.scrollTo({ left: (previousChapterPages.length) * pagesWidth * dpr });
                } else {
                    pagesDiv.scrollTo({ top: getRawVerticalPageOffset(0) });
                }
            }
            pageNum = 0;
            await goto($page.url.toString().replace(/\/read\/([^/]*)/, `/read/${chapterIndex}`) + "?" + $page.url.searchParams.toString(), { noscroll: true });
        } else if (direction === Direction.reverse) {
            if (chapterIndex === chapters.length - 1) return;
            changingChapter = true;
            if (readingMode === ReadingMode.vertical) {
                pagesDiv.style.overflowY = "hidden";
            } else {    
                pagesDiv.style.overflowX = "hidden";
            }
            if (overlay.children.length > 1) overlay.removeChild(overlay.lastChild);
            overlay.appendChild(createInfoPage(chapterIndex));
            overlay.style.display = "flex";
            if (readingMode === ReadingMode.vertical) {
                overlay.style.left = "0";
                overlay.style.top = rawScrollTop.toString() + "px";
            } else {
                overlay.style.left = rawScrollLeft.toString() + "px";
                overlay.style.top = "0";
            }
            chapterIndex++;
            for (let i = 0; i < pagesDiv.children.length; i++) {
                let item = pagesDiv.children.item(i);
                if (item.getAttribute("data-chapter") === (chapterIndex - 2).toString() || item.getAttribute("data-chapternext") === (chapterIndex - 2).toString()) {
                    item.remove();
                    i--; 
                }
            }
            await loadChapters(direction);
            if (readingMode === ReadingMode.rtl) {
                pagesDiv.appendChild(createInfoPage(chapterIndex));
                for (let item of previousChapterPages) {
                    pagesDiv.appendChild(createPage(item, chapterIndex + 1));
                }
                ignoreNextScroll = true;
                pagesDiv.scrollTo({ left: (nextChapterPages.length) * pagesWidth * dpr });
            } else {
                pagesDiv.insertBefore(createInfoPage(chapterIndex), pagesDiv.firstChild);
                for (let item of previousChapterPages.reverse()) {
                    pagesDiv.insertBefore(createPage(item, chapterIndex + 1), pagesDiv.firstChild);
                }
                ignoreNextScroll = true;
                if (readingMode === ReadingMode.ltr) {
                    pagesDiv.scrollTo({ left: (previousChapterPages.length + chapterPages.length + 1) * pagesWidth * dpr });
                } else {
                    pagesDiv.scrollTo({ top: getRawVerticalPageOffset(chapterPages.length + 1) });
                }
            }
            pageNum = chapterPages.length + 1;
            await goto($page.url.toString().replace(/\/read\/([^/]*)/, `/read/${chapterIndex}`) + "?" + $page.url.searchParams.toString(), { noscroll: true });
        }
        overlay.style.display = "none";
        if (readingMode === ReadingMode.vertical) {
                pagesDiv.style.overflowY = "scroll";
        } else {    
            pagesDiv.style.overflowX = "scroll";
        }
        await $tracker.updateHistoryItem("manga", $page.params.id, {
            page: 1,
            chapter: chapters[chapterIndex].chapter,
            trackers: ["mal", "anilist"]
        });
        changingChapter = false;
    }

    async function loadChapters(direction: Direction) {
        loadedPages = 0;
        if (direction === Direction.forward) {
            previousChapterPages = chapterPages;
            chapterPages = nextChapterPages;
            if (chapterIndex > 0) nextChapterPages = await sources[chapters[chapterIndex]["platform"]][chapters[chapterIndex]["sourceId"]].getMangaChapterPages(chapters[chapterIndex - 1]["mangaId"], chapters[chapterIndex - 1].id);
            else nextChapterPages = [];
        } else if (direction === Direction.reverse) {
            nextChapterPages = chapterPages;
            chapterPages = previousChapterPages;
            if (chapterIndex < chapters.length - 1) previousChapterPages = await sources[chapters[chapterIndex]["platform"]][chapters[chapterIndex]["sourceId"]].getMangaChapterPages(chapters[chapterIndex + 1]["mangaId"], chapters[chapterIndex + 1].id);
            else previousChapterPages = [];
        } else {
            if (chapterIndex < chapters.length - 1) previousChapterPages = await sources[chapters[chapterIndex]["platform"]][chapters[chapterIndex]["sourceId"]].getMangaChapterPages(chapters[chapterIndex + 1]["mangaId"], chapters[chapterIndex + 1].id);
            else previousChapterPages = [];
            chapterPages = await sources[chapters[chapterIndex]["platform"]][chapters[chapterIndex]["sourceId"]].getMangaChapterPages(chapters[chapterIndex]["mangaId"], chapters[chapterIndex].id);
            if (chapterIndex > 0) nextChapterPages = await sources[chapters[chapterIndex]["platform"]][chapters[chapterIndex]["sourceId"]].getMangaChapterPages(chapters[chapterIndex - 1]["mangaId"], chapters[chapterIndex - 1].id);
            else nextChapterPages = [];
        }
    }

    function createInfoPage(chapterIndex: number): HTMLDivElement {
        let infoPage = document.createElement("div");
        infoPage.classList.add("reader-info-page");
        infoPage.innerHTML = `
            ${chapterIndex === chapters.length - 1 ? "" : `<span class="reader-info-page-span">Previous: Chapter ${chapters[chapterIndex + 1].chapter}</span>`}
            ${chapterIndex === -1 ? "" : `<span class="reader-info-page-span">Next: Chapter ${chapters[chapterIndex].chapter}</span>`}
        `;
        infoPage.dataset.chapterprev = (chapterIndex + 1).toString();
        infoPage.dataset.chapternext = chapterIndex.toString();
        infoPage.dataset.page = "0";
        if (readingMode === ReadingMode.vertical) {
            infoPage.style.height = "100%";
        }
        return infoPage;
    }

    function createPage(page: MangaPage, chapterIndex: number): HTMLImageElement {
        let img = document.createElement("img");
        if (page.base64 && page.base64.length > 0) {
            img.src = page.base64;
        } else {
            sources[chapters[chapterIndex]["platform"]][chapters[chapterIndex]["sourceId"]].modifyImageRequest(new Request($proxy + "/" + page.url)).then(req => fetch(req)).then(res => res.blob()).then(blob => img.src = URL.createObjectURL(blob));
        }
        img.classList.add("reader-page");
        img.dataset.chapter = chapterIndex.toString();
        img.dataset.page = (page.index + 1).toString();
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            loadedPages++;
        }
        return img;
    }

    function scrollToPage() {
        ignoreNextScroll = true;
        if (readingMode === ReadingMode.rtl) {
            pagesDiv.scrollTo({ left: (nextChapterPages.length + chapterPages.length + 1 - pageNum) * pagesWidth * dpr });
        } else if (readingMode === ReadingMode.ltr) {
            pagesDiv.scrollTo({ left: (previousChapterPages.length + pageNum) * pagesWidth * dpr });
        } else {
            pagesDiv.scrollTo({ top: getRawVerticalPageOffset(pageNum) })
        }
    }

    onMount(init);

    let exiting = false;
    async function exit() {
        if (exiting) return;
        exiting = true;
        await $tracker.updateHistoryItem("manga", $page.params.id, {
            page: pageNum,
            chapter: chapters[chapterIndex].chapter,
            trackers: ["mal", "anilist"]
        });
        await goto($page.url.toString().replace(/\/read\/([^/]*)/, "/info"));
    }
</script>

<svelte:head>
    {#if mounted}
        <title>{(chapters[chapterIndex].volume !== null && typeof chapters[chapterIndex].volume !== "undefined") ? `Volume ${chapters[chapterIndex].volume} ` : ""}Chapter {chapters[chapterIndex].chapter} {chapters[chapterIndex].title ? `- ${chapters[chapterIndex].title}` : ""} - Soshiki</title>
    {/if}
</svelte:head>

<div class="overlay" class:hidden={!settingsOpen}></div>

<div class="container">
    <div class="reader" class:reader-windowed={!fullscreen}>
        <div class="reader-controls reader-controls-top">
            <div class="reader-controls-tight-group">
                <i class="f7-icons reader-controls-glyph" on:click={() => exit()}>xmark</i>
                <div class="reader-controls-placeholder"></div>
            </div>
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
            <div class="reader-controls-tight-group">
                <i class="f7-icons reader-controls-glyph" on:click={() => {settingsOpen = true}}>gear</i>
                <i class="f7-icons reader-controls-glyph" on:click={() => {fullscreen = !fullscreen}}>{fullscreen ? "arrow_down_right_arrow_up_left" : "arrow_up_left_arrow_down_right"}</i>
            </div>
        </div>
        <div class:reader-pages-horizontal={readingMode !== ReadingMode.vertical} class:reader-pages-vertical={readingMode === ReadingMode.vertical} bind:this={pagesDiv} on:scroll={() => { 
                if (!ignoreNextScroll) {
                    rawScrollLeft = pagesDiv.scrollLeft;
                    rawScrollTop = pagesDiv.scrollTop;
                }
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
                        if (readingMode === ReadingMode.vertical) {
                            pagesDiv.scrollTo({ top: getRawVerticalPageOffset(pageNum - 1), behavior: "smooth" })
                        } else {
                            pagesDiv.scrollBy({ left: -pagesWidth, behavior: "smooth" });
                        }
                    }}>chevron_left</i>
                {:else}
                    <div class="reader-controls-placeholder"></div>
                {/if}
                <span class="reader-controls-title">{`Page ${pageNum}`}</span>
                {#if pageNum < chapterPages.length + 1}
                    <i class="f7-icons reader-controls-glyph" on:click={() => {
                        if (readingMode === ReadingMode.vertical) {
                            pagesDiv.scrollTo({ top: getRawVerticalPageOffset(pageNum + 1), behavior: "smooth" })
                        } else {
                            pagesDiv.scrollBy({ left: pagesWidth, behavior: "smooth" });
                        }
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
            <div class="settings-item">
                <span class="settings-item-title">Reading Mode</span>
                <Dropdown title={readingMode.toString()}>
                    {#each Object.values(ReadingMode) as mode}
                        <span class="settings-dropdown-item" on:click={() => readingMode = mode}>{mode.toString()}</span>
                    {/each}
                </Dropdown>
            </div>
        </List>
    </div>
</div>
<style lang="scss">
    @use "../../styles/global.scss" as *;
    .reader {
        background-color: $accent-background-color-light;
        @media (prefers-color-scheme: dark) {
            background-color: $accent-background-color-dark;
        }
        display: flex;
        flex-direction: column;
        font-weight: bold;
        height: 100%;
        overflow: hidden;
        &-windowed {
            border: 2px solid $dropdown-border-color-light;
            border-radius: 0.5rem;
            @media (prefers-color-scheme: dark) {
                border-color: $dropdown-border-color-dark;
            }
        }
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
            &-tight-group {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                flex-shrink: 0;
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
            &-horizontal {
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
            &-vertical {
                overflow-x: hidden;
                overflow-y: scroll;
                display: flex;
                flex-direction: column;
                &::-webkit-scrollbar {
                    display: none;
                }
                scroll-behavior: auto;
                scrollbar-width: none;
                flex-shrink: 0;
                align-items: stretch;
                height: 80vh;
            }
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
            display: none;
        }
    }
    :global(.reader-page) {
        width: 100%;
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
        margin: 10rem 2rem;
        z-index: 4;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        font-weight: bold;
        &-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem;
            background-color: $background-color-light;
            &:hover {
                background-color: $hover-color-light;
            }
            @media (prefers-color-scheme: dark) {
                background-color: $background-color-dark;
                &:hover {
                    background-color: $hover-color-dark;
                }
            }
        }
        &-dropdown-item {
            padding: 0.5rem;
            background-color: $background-color-light;
            &:hover {
                background-color: $hover-color-light;
            }
            @media (prefers-color-scheme: dark) {
                background-color: $background-color-dark;
                &:hover {
                    background-color: $hover-color-dark;
                }
            }
        }
    }
    .hidden {
        display: none;
    }

    .container {
        position: relative;
    }

    .overlay {
        position: fixed;
        z-index: 3;
        background-color: mix(black, transparent);
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
    }
</style>