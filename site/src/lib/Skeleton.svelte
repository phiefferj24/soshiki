<script lang="ts">
	import { isDarkMode } from '$lib/stores';
</script>

<div class="skeleton">

</div>

<style lang="scss">
    .skeleton {
        background: linear-gradient(45deg, #fff, #aaa);
        animation: gradient 7s ease infinite;
        background-size: 400%;
        width: 100%;
        height: 100%;
        @media (prefers-color-scheme: dark) {
            background: linear-gradient(45deg, #333, #777);
            animation: gradient 7s ease infinite;
            background-size: 400%;
        }
        border-radius: inherit;
    }
    @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
</style>