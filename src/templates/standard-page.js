import html from "../components/html.js"

export default ({
    lang = "en",
    title = "",
    footer = "",
    header = "",
    description = "",
    body = "",
    meta = ""
}={}) => {
    return html({
        lang,
        footer,
        header,
        meta: meta || `
            <title>${title}</title>
            <meta name="description" content="${description}">
        `,
        body: `
            <main class="standard-page global-padding">
                ${body ? body : ""}
            </main>
        `
    })
}