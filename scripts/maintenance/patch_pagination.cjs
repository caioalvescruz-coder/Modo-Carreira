const fs = require('fs');

try {
// Patch app-core.js
let core = fs.readFileSync('assets/js/app-core.js', 'latin1');
if (!core.includes('paginaAtual = 1')) {
    core = core.replace('let abaAtiva = \'mercado\',', 'let abaAtiva = \'mercado\',\n    paginaAtual = 1,');
    fs.writeFileSync('assets/js/app-core.js', core, 'latin1');
}

// Patch app-roster.js to reset paginaAtual on mudarAba
let roster = fs.readFileSync('assets/js/app-roster.js', 'utf8');
if (!roster.includes('paginaAtual = 1;')) {
    roster = roster.replace('selCards = [];', 'selCards = [];\n    paginaAtual = 1;');
    fs.writeFileSync('assets/js/app-roster.js', roster, 'utf8');
}

// Patch app-render.js for pagination logic
let render = fs.readFileSync('assets/js/app-render.js', 'utf8');

// Add change page function globally
if (!render.includes('window.mudarPagina =')) {
    render += '\n\nwindow.mudarPagina = (p) => { paginaAtual = p; renderizar(true); window.scrollTo(0, 0); };\n';
}

// Reset page on search
render = render.replace('const onSearch = () => {', 'const onSearch = () => { paginaAtual = 1;');
render = render.replace('window.toggleFiltro = (t, v) => {', 'window.toggleFiltro = (t, v) => { paginaAtual = 1;');
render = render.replace('window.limparFiltros = () => {', 'window.limparFiltros = () => { paginaAtual = 1;');
render = render.replace('window.ordenarPelaTabela = c => {', 'window.ordenarPelaTabela = c => { paginaAtual = 1;');

// Inject pagination slicing logic
const sliceLogic = `    renderizarDashboard(f);

    const itensPorPagina = 50;
    const totalPaginas = Math.ceil(f.length / itensPorPagina) || 1;
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
    
    let paginationHtml = '';
    if (totalPaginas > 1) {
        let pB = [];
        let start = Math.max(1, paginaAtual - 2);
        let end = Math.min(totalPaginas, start + 4);
        if (end - start < 4) start = Math.max(1, end - 4);
        if (start > 1) pB.push(\`<button class="filtro-btn" onclick="mudarPagina(1)">1</button>\`);
        if (start > 2) pB.push('<span style="color:#94a3b8">...</span>');
        for(let p=start; p<=end; p++) pB.push(\`<button class="filtro-btn \${p === paginaAtual ? 'ativo' : ''}" onclick="mudarPagina(\${p})">\${p}</button>\`);
        if (end < totalPaginas - 1) pB.push('<span style="color:#94a3b8">...</span>');
        if (end < totalPaginas) pB.push(\`<button class="filtro-btn" onclick="mudarPagina(\${totalPaginas})">\${totalPaginas}</button>\`);
        paginationHtml = \`<div style="display:flex;justify-content:center;align-items:center;gap:5px;padding:20px;grid-column:1/-1;width:100%">\${pB.join('')}</div>\`;
    }
    
    const paginados = f.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);
`;
if (!render.includes('const itensPorPagina = 50;')) {
    render = render.replace('renderizarDashboard(f);', sliceLogic);
}

// Replace f.map with paginados.map for both table and grid views
render = render.replace(/f\.map\(j => \{/g, 'paginados.map(j => {');

// Add paginationHtml to the end of the containers
if (!render.includes('paginationHtml')) {
    render = render.replace('}).join(\'\')) + `</tbody></table></div>`;', '}).join(\'\')) + `</tbody></table></div>` + paginationHtml;');
    render = render.replace('}).join(\'\'));\n    }', '}).join(\'\')) + paginationHtml;\n    }');
    // Sometimes there are \r\n, so let's use a regex
    render = render.replace(/}\)\.join\(''\)\);\s+}/g, '}).join(\'\')) + paginationHtml;\n    }');
}

fs.writeFileSync('assets/js/app-render.js', render, 'utf8');
console.log('Pagination patch complete.');
} catch(e) {
    console.error(e);
}
