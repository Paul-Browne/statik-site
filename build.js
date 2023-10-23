import { cp, mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import XtoCss from "x-to-css";
import * as esbuild from 'esbuild'
import { minify } from 'html-minifier'

import standardPage from "./src/templates/standard-page.js"
import footer from "./src/components/footer.js";
import navigation from "./src/components/navigation.js";

XtoCss("src/scss/global.scss", "public/css/styles.css", { maps: true });
//cp("src/fonts", "public/fonts", { recursive: true })
cp("src/images", "public/img", { recursive: true })
cp("src/favicon", "public", { recursive: true })

await esbuild.build({
  entryPoints: ['src/js/scripts.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es6'],
  outfile: 'public/js/scripts.js'
})

/* ⬆⬆⬆ BUILD ASSETS ⬆⬆⬆ */



/* ⬇⬇⬇ BUILD PAGES ⬇⬇⬇ */

const writeFileToPublic = async  (html, path) => {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, html);
}

const minifyHTML = html => minify(html, {
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true,
    decodeEntities: true
})

const t = Date.now();

// BUILD CODE HERE...

console.log(`${(Date.now() - t)/1000} seconds to compile.`);