const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><html><body>
<div id="elenco-container"></div>
<div id="taticas-container"></div>
</body></html>`, { url: "http://localhost" });
global.window = dom.window;
global.document = dom.window.document;
global.$ = s => document.querySelector(s);
global.$$ = s => document.querySelectorAll(s);

global.appData = {
    indiceAtivo: 0,
    elencos: [{
        temporadas: [{
            formacao: '4-3-3',
            jogadores: [
                {id: 1, pos: 'GOL', primeiroNome: 'A', sobrenome: 'B', situacao: 'Elenco', ovr: 50, pot: 50, s: []}
            ],
            lineup: {'1': 1}
        }],
        temporadaAtiva: 0
    }]
};
global.getSeason = () => appData.elencos[appData.indiceAtivo].temporadas[appData.elencos[appData.indiceAtivo].temporadaAtiva];

global.window.formacoesTaticas = {
    '4-3-3': { slots: { '1': 'top:0;left:0' } }
};

global.filtros = {
    pos: [],
    sit: [],
    status: [],
    pe: ''
};

const tacticsCode = fs.readFileSync('C:/Users/larao/Desktop/Modo Carreira EA FC/assets/js/app-tactics.js', 'utf8');
// Evaluate the code in global scope
eval(tacticsCode);

try {
    global.sortTaticasField = 'pos';
    global.sortTaticasDir = 'asc';
    renderizarTaticas();
    console.log("SUCCESS!");
} catch (e) {
    console.log("ERROR THROWN:", e);
}
