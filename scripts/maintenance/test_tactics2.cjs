const fs = require('fs');
global.window = { formacoesTaticas: { '4-3-3': { slots: { '1': 'top:0;left:0' } } } };
global.document = { querySelector: () => null, querySelectorAll: () => [] };
global.$ = s => null;
global.$$ = s => [];

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
global.filtros = { pos: [], sit: [], status: [], pe: '' };
global.sortTaticasField = 'pos';
global.sortTaticasDir = 'asc';

// Mock getBg and getAdp which are from app-core
global.getBg = () => 'bg-green';
global.getAdp = () => 'green';

const tacticsCode = fs.readFileSync('C:/Users/larao/Desktop/Modo Carreira EA FC/assets/js/app-tactics.js', 'utf8');
eval(tacticsCode);

try {
    const res = renderizarTaticas();
    console.log("SUCCESS!");
} catch (e) {
    console.log("ERROR THROWN:");
    console.error(e);
}
