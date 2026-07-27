const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const dom = new JSDOM(html, { 
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable"
});

// We need to polyfill fetch or things might fail if it fetches seed-data, etc.
// But we don't have time. Let's just wait for scripts to execute.
dom.window.document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded. Waiting 1 second for JS to init...");
    setTimeout(() => {
        try {
            console.log("Clicking taticas...");
            dom.window.mudarAba('taticas');
            console.log("Success! Container HTML starts with: ", dom.window.document.querySelector('#elenco-container').innerHTML.substring(0, 500));
        } catch (e) {
            console.error("ERROR CAUGHT: ", e);
        }
    }, 1000);
});
