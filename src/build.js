// Embeds js into the html and fixes css links for file:// protocol
import { readFileSync, readdirSync, unlinkSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dist = resolve(__dirname, "../dist");
const assets = resolve(dist, "assets");

const files = readdirSync(assets);

let jsfile, cssfile;
for (const file of files) {
    if (jsfile && cssfile) {
        break;
    }
    if (file.endsWith(".js")) {
        jsfile = resolve(assets, file);
    }
    if (file.endsWith(".css")) {
        cssfile = resolve(assets, file);
    }
}

if (!jsfile || !cssfile) {
    throw new Error();
}

const htmlfile = resolve(dist, "index.html");

let js = readFileSync(jsfile, "utf8");
let css = readFileSync(cssfile, "utf8");
let html = readFileSync(htmlfile, "utf8");

html = html.replaceAll('"/', '"./');
html = html.replace(
    /<script.+<\/script>/,
    () => `<script type="module">${js}</script>`,
);
html = html.replace(
    /<link rel="stylesheet" crossorigin href=.+>/,
    () => `<style>${css}</style>`,
);

css = css.replaceAll("/fonts", "../fonts");

writeFileSync(htmlfile, html);
writeFileSync(cssfile, css);
unlinkSync(jsfile);

