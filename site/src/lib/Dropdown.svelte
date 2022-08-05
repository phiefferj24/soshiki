<script lang="ts">
    export let title: string;
    export let label: string = "";
    export let dropped = false;
    let dropdownContent: HTMLElement;
    let dropdownToggle: HTMLElement;
    function handleClick(evt: MouseEvent) {
        let target = evt.target as HTMLElement;
        if (dropped && !dropdownContent.contains(target) && !dropdownToggle.contains(target)) {
            dropped = false;
        }
    }
</script>

<svelte:body on:click={handleClick} />

<div class="dropdown">
    <div class="dropdown-header">
        <span class="dropdown-label">{label}</span>
        <span class="dropdown-title">{title}</span>
        <i class="f7-icons dropdown-toggle dropdown-glyph" bind:this={dropdownToggle} on:click={() => dropped = !dropped}>{dropped ? "chevron_up" : "chevron_down"}</i>
    </div>
    <div class="dropdown-content" class:dropdown-content-hidden={!dropped} bind:this={dropdownContent}>
        <slot />
    </div>
</div>

<style lang="scss">
    @use "../styles/global.scss" as *;
    .dropdown {
        position: relative;
        &-toggle {
            cursor: pointer;
        }
        &-content {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: calc(100% + 1rem);
            left: unset;
            right: 0;
            height: fit-content;
            width: fit-content;
            z-index: 1;
            background-color: $accent-background-color-light;
            border-radius: 0.5rem;
            border: 2px solid $dropdown-border-color-light;
            @media (prefers-color-scheme: dark) {
                background-color: $accent-background-color-dark;
                border: 2px solid $dropdown-border-color-dark;
            }
            &-hidden {
                display: none;
            }
        }
        &-header {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            font-weight: 600;
        }
        &-label {
            color: $accent-text-color-light;
            @media (prefers-color-scheme: dark) {
                color: $accent-text-color-dark;
            }
        }
        &-glyph {
            margin-left: 0.5rem;
        }
    }
</style>