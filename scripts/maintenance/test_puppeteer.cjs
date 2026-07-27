const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname)));

const server = app.listen(3000, async () => {
    console.log('Server running on port 3000');
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

        await page.goto('http://localhost:3000/index.html');
        
        // Wait for app to be ready
        await page.waitForSelector('#link-taticas');
        
        console.log('Clicking Táticas tab...');
        await page.click('#link-taticas');
        
        // Wait a bit to let it render
        await new Promise(r => setTimeout(r, 2000));
        
        // Check what is in the container
        const containerHTML = await page.evaluate(() => {
            return document.querySelector('#elenco-container').innerHTML.substring(0, 500);
        });
        console.log('CONTAINER HTML START:', containerHTML);
        
        await browser.close();
        server.close();
    } catch (e) {
        console.error("SCRIPT ERROR:", e);
        server.close();
    }
});
