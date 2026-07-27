const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.static('dist'));
const server = app.listen(3000, async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        page.on('pageerror', err => console.log('Page error:', err.message));
        page.on('console', msg => { if(msg.type() === 'error') console.log('Console error:', msg.text()); });
        await page.goto('http://localhost:3000');
        await page.evaluate(() => {
            if(window.mudarAba) window.mudarAba('taticas');
            else document.querySelector('button[onclick*=\'taticas\']').click();
        });
        await new Promise(r => setTimeout(r, 2000));
        await browser.close();
    } catch(e) {
        console.log('Puppeteer error:', e);
    }
    server.close();
});
