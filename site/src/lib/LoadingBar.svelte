<div class="loader">
    <div class="loader-bar"></div>
</div>

<style lang="scss">
    @use "../styles/global.scss" as *;
    .loader {
        width: 100%;
        height: 4px;
        overflow: hidden;
        flex-shrink: 0;
        &-bar {
            width: 100%;
            height: 100%;
            transform-origin: 0% 50%;
            background-color: $link-color-light;
            @media (prefers-color-scheme: dark) {
                background-color: $link-color-dark;
            }
            animation: animation 1s infinite linear;
        }
    }
    @keyframes animation {
        0% {
            transform: translateX(0) scaleX(0);
        }
        40% {
            transform: translateX(0) scaleX(0.35);
        }
        100% {
            transform: translateX(100%) scaleX(0.5);
        }
    }
</style>