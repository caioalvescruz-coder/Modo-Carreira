const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
app.use(express.static('dist'));
const server = app.listen(3000, async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('BROWSER:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
        
        await page.goto('http://localhost:3000');
        await new Promise(r => setTimeout(r, 1000));
        
        await page.evaluate(() => window.mudarAba('taticas'));
        await new Promise(r => setTimeout(r, 1000));
        
        await page.evaluate(() => {
            const s = getSeason();
            s.lineup = { 'GOL': '1', 'LD': '2', 'ZAG1': '3', 'ZAG2': '4', 'LE': '5', 'VOL': '6', 'MC1': '7', 'MC2': '8', 'PD': '9', 'PE': '10', 'ATA': '11' };
            s.jogadores = [
                {id:'1', primeiroNome:'A', sobrenome:'1'},
                {id:'2', primeiroNome:'A', sobrenome:'2'},
                {id:'3', primeiroNome:'A', sobrenome:'3'},
                {id:'4', primeiroNome:'A', sobrenome:'4'},
                {id:'5', primeiroNome:'A', sobrenome:'5'},
                {id:'6', primeiroNome:'A', sobrenome:'6'},
                {id:'7', primeiroNome:'A', sobrenome:'7'},
                {id:'8', primeiroNome:'A', sobrenome:'8'},
                {id:'9', primeiroNome:'A', sobrenome:'9'},
                {id:'10', primeiroNome:'A', sobrenome:'10'},
                {id:'11', primeiroNome:'A', sobrenome:'11'},
            ];
            s.formacao = '4-3-3';
            renderizar();
            window.confirm = () => true;
            window.alert = msg => console.log('ALERT:', msg);
            window.salvarLineup('Titular');
            s.lineup = {};
            renderizar();
            window.carregarLineup('Titular');
        });
        
        const html = await page.evaluate(() => document.querySelector('#taticas-container').innerHTML);
        console.log(html.includes('A 1') ? 'PLAYER FOUND ON PITCH' : 'PLAYER NOT FOUND');
        await browser.close();
    } catch(e) {
        console.log(e);
    }
    server.close();
});
