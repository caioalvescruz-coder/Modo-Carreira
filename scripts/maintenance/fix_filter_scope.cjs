const fs = require('fs');

// 1. Fix app-core.js resetarFiltros and mudarFiltroPe
let core = fs.readFileSync('assets/js/app-core.js', 'utf8');

const newResetCode = `
window.mudarFiltroPe = function(v) {
    filtros.pe = v;
    paginaAtual = 1;
    if (typeof renderizar === 'function') renderizar(true);
};

window.resetarFiltros = () => {
    filtros.pos = [];
    filtros.sit = [];
    filtros.status = [];
    filtros.idadeMin = 15;
    filtros.idadeMax = 45;
    filtros.pe = '';
    if (document.getElementById('search-input')) document.getElementById('search-input').value = '';
    if (document.getElementById('search-clube')) document.getElementById('search-clube').value = '';
    if (document.getElementById('pe-select')) document.getElementById('pe-select').value = '';
    window.buscaAtual = '';
    window.buscaClube = '';
    if (window.ageSlider) window.ageSlider.set([15, 45]);
    paginaAtual = 1;
    if (typeof renderizar === 'function') renderizar(true);
};
`;

// Replace the old window.resetarFiltros entirely
core = core.replace(/window\.resetarFiltros = \(\) => \{[\s\S]*?\};\n/g, newResetCode);
fs.writeFileSync('assets/js/app-core.js', core, 'utf8');

// 2. Fix index.html onchange
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/onchange="window\.filtros\.pe = this\.value; consolidarEdicoes\(\); renderizar\(true\)"/, 'onchange="window.mudarFiltroPe(this.value)"');
fs.writeFileSync('index.html', html, 'utf8');

console.log("Fixed filter assignments");
