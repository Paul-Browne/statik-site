export default (domElement, delay_in_seconds = 5) => {
    if(!domElement) return
    
    domElement.querySelector(".close")?.addEventListener("click", () => {
        domElement.classList.remove("visible")
        document.documentElement.classList.remove("no-scroll")
    })

    setTimeout(()=>{
        domElement.classList.add("visible")
        document.documentElement.classList.add("no-scroll")
    }, delay_in_seconds * 1000)

}