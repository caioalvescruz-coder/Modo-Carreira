const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');
const peSelect = `<select id="pe-select" onchange="window.filtros.pe = this.value; consolidarEdicoes(); renderizar(true)">
                          <option value="">Pé (Todos)</option><option value="Dir.">Destro</option><option value="Esq.">Canhoto</option><option value="Ambos">Ambos (5★)</option>
                      </select>`;
const limparBtn = `<button class="filtro-btn" onclick="window.resetarFiltros()" title="Limpar todos os filtros">🧹 Limpar</button>`;

html = html.replace(/<select id="sort-select"/, `${peSelect}\n                      <select id="sort-select"`);
html = html.replace(/<button class="filtro-btn" id="btn-filtro-renovacao"/, `${limparBtn}\n                      <button class="filtro-btn" id="btn-filtro-renovacao"`);
fs.writeFileSync('index.html', html, 'utf8');


// 2. Update app-core.js
let core = fs.readFileSync('assets/js/app-core.js', 'utf8');
core = core.replace(/idadeMax: 45\n    \};/g, `idadeMax: 45,\n        pe: ''\n    };`);

const resetCode = `
window.resetarFiltros = () => {
    window.filtros = { pos: [], sit: [], status: [], idadeMin: 15, idadeMax: 45, pe: '' };
    if (document.getElementById('search-input')) document.getElementById('search-input').value = '';
    if (document.getElementById('search-clube')) document.getElementById('search-clube').value = '';
    if (document.getElementById('pe-select')) document.getElementById('pe-select').value = '';
    window.buscaAtual = '';
    window.buscaClube = '';
    if (window.ageSlider) window.ageSlider.set([15, 45]);
    if (typeof renderizar === 'function') renderizar(true);
};
`;
if (!core.includes('window.resetarFiltros')) {
    core += resetCode;
}
fs.writeFileSync('assets/js/app-core.js', core, 'utf8');


// 3. Update app-render.js
let render = fs.readFileSync('assets/js/app-render.js', 'utf8');
render = render.replace(/\(!filtros\.pos\.length/g, `(!filtros.pe || (filtros.pe === 'Ambos' ? j.pr === 5 : j.pe === filtros.pe)) &&\n        (!filtros.pos.length`);

fs.writeFileSync('assets/js/app-render.js', render, 'utf8');

console.log("Features added!");
