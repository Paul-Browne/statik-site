export default (hamburger, menu) => {
    if(!hamburger || !menu) return
    
    menu.classList.toggle("active")
    hamburger.classList.toggle("active")
    document.documentElement.classList.toggle("no-scroll")

}