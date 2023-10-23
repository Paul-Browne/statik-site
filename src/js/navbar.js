export default navigationCont => {
    if(!navigationCont) return

    let previousY = window.scrollY;

    window.addEventListener("scroll", () => {
        const currentY = window.scrollY;

        if(currentY < previousY){
            // scrolling up
            navigationCont.classList.add("reveal")
        }else if(currentY > 80){
            // scrolling down
            navigationCont.classList.remove("reveal")
        }
        if(currentY <= 0){
            navigationCont.classList.add("top")
        }else{
            navigationCont.classList.remove("top")
        }        

        previousY = currentY;

    })      

}