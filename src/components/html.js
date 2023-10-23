import defaultHead from "./head.js";
import defaultMeta from "./meta.js";
import defaultHeader from "./navigation.js";
import defaultFooter from "./footer.js";

const html = ({
    lang = "en",
    head = defaultHead(),
    meta = defaultMeta(),
    header = defaultHeader(),
    footer = defaultFooter(),
    body = "Error, page not found",
    scripts = undefined,
    styles = undefined
} = {}) => {
    const scriptsIsArray = Array.isArray(scripts);
    const stylesIsArray = Array.isArray(styles);
    return `
<!DOCTYPE html>
    <html lang="${lang}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${head}
        ${scriptsIsArray ? scripts.filter(script => script.src).map(script => `<script src="${script.src}" ${script.loading || ""}></script>`).join("") : ""}
        ${scriptsIsArray ? scripts.filter(script => script.content && script.loading == "async").map(script => `<script>${script.content}</script>`).join("") : ""}
        ${stylesIsArray ? styles.filter(style => style.href && style.loading == "async").map(style => `<link href="${style.href}" rel="stylesheet">`).join("") : ""}
        ${stylesIsArray ? styles.filter(style => style.content && style.loading == "async").map(style => `<style>${style.content}</style>`).join("") : ""}
        ${meta}
    </head>
    <body>
        ${header}
        ${body}
        ${footer}
        ${scriptsIsArray ? scripts.filter(script => script.content && script.loading == "defer").map(script => `<script>${script.content}</script>`).join("") : ""}
        ${stylesIsArray ? styles.filter(style => style.href && style.loading == "defer").map(style => `<link href="${style.href}" rel="stylesheet">`).join("") : ""}
        ${stylesIsArray ? styles.filter(style => style.content && style.loading == "defer").map(style => `<style>${style.content}</style>`).join("") : ""}
    </body>
</html>`
}

export default html