<div class="header">
    <img src="images/soshiki-large.svg" alt="Soshiki" class="header-item header-item-left" style="height: 40px"/>
    <p class="header-item header-item-left">Soshiki</p>
</div>

<style lang="scss">
.header {
    background-color: #f5f5f5;
    color: #333;
    display: flex;
    text-align: center;
}
.header-item {
    display: flexbox;
    padding: 0.5rem;
    margin: 0;
    font-size: 1.5rem;
    stroke: #333;
    fill: #333;
    vertical-align: middle;
}
.header-item-left {
    display: inline;
    float: left;
}
.header-item-right {
    display: inline;
    float: right;
}
@media (prefers-color-scheme: dark) {
    .header {
        background-color: #333;
        color: #fff;
    }
    .header-item {
        stroke: #fff;
        fill: #fff;
    }
}
</style>