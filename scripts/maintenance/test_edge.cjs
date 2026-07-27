const express = require('express');
const puppeteer = require('puppeteer-core');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname)));

const server = app.listen(3000, async () => {
    console.log('Server running on port 3000');
    try {
        const browser = await puppeteer.launch({
            executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
            headless: 'new'
        });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        page.on('dialog', async dialog => {
            console.log('DIALOG:', dialog.message());
            await dialog.accept();
        });

        await page.goto('http://localhost:3000/index.html');
        
        console.log('Waiting for #link-taticas...');
        await page.waitForSelector('#link-taticas');
        
        console.log('Changing to Táticas tab via evaluate...');
        await page.evaluate(() => window.mudarAba('taticas'));
        
        // Wait a bit to let it render
        await new Promise(r => setTimeout(r, 2000));
        
        console.log('Testing saving and loading lineup by clicking buttons...');
        await page.evaluate(() => {
            const s = getSeason();
            s.lineup = { 'ZAG1': s.jogadores[0] };
            renderizar(true);
        });
        
        await new Promise(r => setTimeout(r, 1000));
        
        // Find the save button for "Titular"
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const saveBtn = btns.find(b => b.title === 'Salvar escalação atual como Titular');
            if(saveBtn) saveBtn.click();
        });
        
        await new Promise(r => setTimeout(r, 1000));
        
        await page.evaluate(() => {
            const s = getSeason();
            s.lineup = {};
            renderizar(true);
        });
        
        await new Promise(r => setTimeout(r, 1000));
        
        // Find the load button for "Titular"
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const loadBtn = btns.find(b => b.title === 'Carregar Titular');
            if(loadBtn) loadBtn.click();
        });
        
        await new Promise(r => setTimeout(r, 1000));
        
        const lineupKeys = await page.evaluate(() => {
            return Object.keys(getSeason().lineup);
        });
        console.log('Lineup after load:', lineupKeys);
        
        await browser.close();
        server.close();
    } catch (e) {
        console.error("SCRIPT ERROR:", e);
        server.close();
    }
});
