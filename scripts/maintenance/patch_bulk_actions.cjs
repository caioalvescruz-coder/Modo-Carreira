const fs = require('fs');

let render = fs.readFileSync('assets/js/app-render.js', 'utf8');

// Inject the global functions if they don't exist
if (!render.includes('window.selecionarTodosVisiveis = function')) {
    const newFns = `
window.selecionarTodosVisiveis = function(indices) {
    let todosSelecionados = indices.every(i => selCards.includes(i));
    if (todosSelecionados) {
        selCards = selCards.filter(i => !indices.includes(i));
    } else {
        indices.forEach(i => {
            if (!selCards.includes(i)) selCards.push(i);
        });
    }
    renderizar();
};

window.excluirSelecionadosEmMassa = function() {
    if (!confirm('Excluir TODOS os ' + selCards.length + ' cards selecionados?')) return;
    const src = abaAtiva === 'mercado' ? (subAbaMercado === 'alvos' ? getSeason().mercado : getSeason().jogadores) : getSeason().jogadores;
    selCards.sort((a, b) => b - a); // Sort descending to splice safely
    selCards.forEach(idx => {
        src.splice(idx, 1);
    });
    selCards = [];
    salvarDados();
    syncCal();
    renderizar();
};
`;
    render = render.replace(
        /window\.excluirJogador = function\(idx\) \{/,
        `${newFns}\nwindow.excluirJogador = function(idx) {`
    );
}

// Inject bulkHtml logic into renderizar
if (!render.includes('let bulkHtml')) {
    render = render.replace(
        /const paginados = f\.slice\(\(paginaAtual - 1\) \* itensPorPagina, paginaAtual \* itensPorPagina\);/,
        `const paginados = f.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);
    let bulkHtml = '';
    if (modoEdicao) {
        let indicesVisiveis = paginados.map(j => srcArr.indexOf(j));
        let indVisStr = JSON.stringify(indicesVisiveis);
        bulkHtml = \`<div style="display:flex; justify-content:space-between; align-items:center; background:#1e293b; padding:10px; border-radius:8px; margin-bottom:15px; border:1px solid #334155;">
            <button class="filtro-btn" onclick='selecionarTodosVisiveis(\${indVisStr})' style="margin:0;">☑️ Selecionar Todos Visíveis</button>
            \${selCards.length >= 2 ? \`<button style="background:#b91c1c; color:white; border:none; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer;" onclick="excluirSelecionadosEmMassa()">🗑️ Excluir \${selCards.length} selecionados</button>\` : ''}
        </div>\`;
    }`
    );
    
    // Inject bulkHtml in the table render
    render = render.replace(
        /c\.innerHTML = tabsHtml \+ paginationHtml \+ `<div class="table-container">/,
        `c.innerHTML = tabsHtml + bulkHtml + paginationHtml + \`<div class="table-container">`
    );

    // Inject bulkHtml in the grid render
    render = render.replace(
        /c\.innerHTML = tabsHtml \+ paginationHtml \+ \(f\.length === 0/,
        `c.innerHTML = tabsHtml + bulkHtml + paginationHtml + (f.length === 0`
    );

    fs.writeFileSync('assets/js/app-render.js', render, 'utf8');
    console.log("Patched bulk deletion UI in app-render.js");
} else {
    console.log("Bulk deletion already patched.");
}
