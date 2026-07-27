const fs = require('fs');

// 1. Fix app-render.js
let render = fs.readFileSync('assets/js/app-render.js', 'utf8');

// Remove my previous broken code
render = render.replace(/window\.selecionarTodosVisiveis = function[\s\S]*?window\.excluirJogador = function\(idx\) \{/, 'window.excluirJogador = function(idx) {');

render = render.replace(/let bulkHtml = '';\s*if \(modoEdicao\) \{[\s\S]*?\}\s*const colG/, 'const colG');
render = render.replace(/let bulkHtml = '';\s*if \(modoEdicao\) \{[\s\S]*?\}\s*c\.innerHTML = tabsHtml \+ bulkHtml/g, 'c.innerHTML = tabsHtml');
render = render.replace(/tabsHtml \+ bulkHtml \+ paginationHtml/g, 'tabsHtml + paginationHtml');

// Re-inject window.selecionarTodosVisiveisDaAba properly globally at the end
if (!render.includes('window.selecionarTodosVisiveisDaAba')) {
    render += `\nwindow.selecionarTodosVisiveisDaAba = function() {
    const s = getSeason();
    const srcArr = abaAtiva === 'mercado' ? (subAbaMercado === 'alvos' ? s.mercado : s.jogadores) : s.jogadores;
    
    // Reproduce the filter logic to get exactly what's visible
    const tm = document.getElementById('search-input') ? document.getElementById('search-input').value.toLowerCase() : '';
    const tc = document.getElementById('search-clube') ? document.getElementById('search-clube').value.toLowerCase() : '';
    const tcList = tc.split(' ').map(w => w.trim()).filter(w => w);
    
    let f = srcArr.filter(j => (abaAtiva === 'base' ? j.situacao === 'Base' : (abaAtiva === 'jogadores' ? (j.situacao !== 'Base' && j.situacao !== 'Emprest. - OUT') : (abaAtiva === 'mercado' ? (subAbaMercado === 'alvos' ? true : (subAbaMercado === 'vendas' ? j.situacao === 'Vender' : (subAbaMercado === 'emprestar' ? j.situacao === 'Emprestar' : j.situacao === 'Emprest. - OUT'))) : true))) &&
        (!filtros.pos.length || filtros.pos.includes(j.pos)) &&
        (!filtros.sit.length || filtros.sit.includes(j.situacao)) &&
        (!filtros.status.length || filtros.status.includes(j.status)) &&
        (\`\${j.primeiroNome} \${j.sobrenome}\`.toLowerCase().includes(tm)) &&
        (!tcList.length || tcList.every(w => j.clube && j.clube.toLowerCase().includes(w))) &&
        (!filtroRenovacaoAtivo || (+j.contAnos === 0 && +j.contMeses <= 6)));
        
    const indicesVisiveis = f.map(j => srcArr.indexOf(j));
    let todosSelecionados = indicesVisiveis.every(i => selCards.includes(i));
    
    if (todosSelecionados) {
        selCards = selCards.filter(i => !indicesVisiveis.includes(i));
    } else {
        indicesVisiveis.forEach(i => {
            if (!selCards.includes(i)) selCards.push(i);
        });
    }
    renderizar();
};\n`;
}

// Inject getAlvoBtnHtml at the end if not exists
if (!render.includes('function getAlvoBtnHtml')) {
    render += `\nwindow.getAlvoBtnHtml = function(idx, j) {
    if (modoEdicao || abaAtiva !== 'banco') return '';
    let s = getSeason();
    if (s.jogadores && s.jogadores.some(el => el.id && el.id === j.id)) {
        return \`<button style="position:absolute;top:5px;right:5px;background:#334155;color:#94a3b8;border:none;padding:4px 8px;border-radius:4px;font-weight:700;cursor:not-allowed;font-size:.8em;z-index:10;" disabled>✅ Seu Elenco</button>\`;
    }
    if (s.mercado && s.mercado.some(el => el.id && el.id === j.id)) {
        return \`<button style="position:absolute;top:5px;right:5px;background:#334155;color:#94a3b8;border:none;padding:4px 8px;border-radius:4px;font-weight:700;cursor:not-allowed;font-size:.8em;z-index:10;" disabled>✅ Na Lista</button>\`;
    }
    return \`<button onclick="adicionarAoAlvoUniversal(\${idx}, this)" style="position:absolute;top:5px;right:5px;background:#0284c7;color:#fff;border:none;padding:4px 8px;border-radius:4px;font-weight:700;cursor:pointer;font-size:.8em;z-index:10;transition:all 0.2s" onmouseover="this.style.background='#0369a1'" onmouseout="this.style.background='#0284c7'">➕ Alvos</button>\`;
};\n`;
}

// Ensure the button inside the template calls getAlvoBtnHtml!
// Because the previous regex failed, I'll replace it carefully.
const regexBtn = /\(\!modoEdicao&&abaAtiva==='banco'\)\?\`<button onclick="adicionarAoAlvoUniversal\(\$\{i\}, this\)"[^>]+>.*?Alvos<\/button>\`:''/;
if (regexBtn.test(render)) {
    render = render.replace(regexBtn, `\${window.getAlvoBtnHtml(i, j)}`);
}

// Modify adicionarAoAlvoUniversal to definitively prevent duplicates at data level
render = render.replace(
    /const jogador = JSON\.parse\(JSON\.stringify\(window\.bdJogadores\[idx\]\)\);/,
    `const jId = window.bdJogadores[idx].id;
    if (elAtv.temporadas[elAtv.temporadaAtiva || 0].jogadores?.some(x => x.id === jId)) return alert('Jogador já está no seu elenco!');
    if (season.mercado.some(x => x.id === jId)) return alert('Jogador já está na lista de alvos!');
    const jogador = JSON.parse(JSON.stringify(window.bdJogadores[idx]));`
);

fs.writeFileSync('assets/js/app-render.js', render, 'utf8');

// 2. Fix index.html
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('btn-selecionar-todos')) {
    html = html.replace(
        /<button id="btn-excluir-selecionados"/,
        `<button id="btn-selecionar-todos" onclick="selecionarTodosVisiveisDaAba()" style="display:none; background:#0284c7; color:#fff; padding:6px 10px; border:none; border-radius:6px; cursor:pointer; font-weight:700; font-size:.8em; margin-right: 10px;" title="Selecionar Todos Visíveis">☑️ Selecionar Todos</button>
              <button id="btn-excluir-selecionados"`
    );
}

// Make sure btn-selecionar-todos is toggled in renderizar
if (!render.includes(`if ($('#btn-selecionar-todos'))`)) {
    render = render.replace(
        /if \(\$\('#btn-excluir-visiveis'\)\) \{/,
        `if ($('#btn-selecionar-todos')) $('#btn-selecionar-todos').style.display = (modoEdicao && (abaAtiva === 'jogadores' || abaAtiva === 'mercado' || abaAtiva === 'base')) ? 'flex' : 'none';\n    if ($('#btn-excluir-visiveis')) {`
    );
    // actually let's just do it simpler
    const toggleCode = `if ($('#btn-selecionar-todos')) $('#btn-selecionar-todos').style.display = (modoEdicao && (abaAtiva === 'jogadores' || abaAtiva === 'mercado' || abaAtiva === 'base')) ? 'flex' : 'none';\n    `;
    render = render.replace(
        /if \(\$\('#btn-excluir-visiveis'\)\) \$\('#btn-excluir-visiveis'\)\.style\.display = \(modoEdicao/,
        toggleCode + `if ($('#btn-excluir-visiveis')) $('#btn-excluir-visiveis').style.display = (modoEdicao`
    );
    fs.writeFileSync('assets/js/app-render.js', render, 'utf8');
}

fs.writeFileSync('index.html', html, 'utf8');

console.log("Bugfixes applied successfully.");
