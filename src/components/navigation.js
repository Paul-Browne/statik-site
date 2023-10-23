const html = data => {
    return `
<header id="navi" class="reveal top">
    <nav>
        <img src="/img/logo.svg" alt="logo">
    </nav>
    <button class="hamburger" onclick="menu(this, sideMenu)">
    <div>
        <span></span>
        <span></span>
        <span></span>
    </div>
    </button>
    <div id="sideMenu" class="menu">
        <!-- header content -->
    </div>
</header>
<script>navbar(navi, menu)</script>
`
}

export default html