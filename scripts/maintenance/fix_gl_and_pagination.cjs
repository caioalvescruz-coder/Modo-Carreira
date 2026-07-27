const fs = require('fs');

let render = fs.readFileSync('assets/js/app-render.js', 'utf8');

// 1. Grid view pagination
// Find the exact line at the end of the else block in renderizar
render = render.replace(/\}\)\.join\(''\)\);/g, `}).join('')) + paginationHtml;`);

// 2. Fix GL -> GOL globally
// Insert normalizer at the start of renderizar
const normCode = `\n    if (s && s.jogadores) s.jogadores.forEach(j => { if (j.pos === 'GL') j.pos = 'GOL'; });\n    if (s && s.mercado) s.mercado.forEach(j => { if (j.pos === 'GL') j.pos = 'GOL'; });\n    if (window.bdJogadores) window.bdJogadores.forEach(j => { if (j.pos === 'GL') j.pos = 'GOL'; });\n`;

if (!render.includes(`if (j.pos === 'GL') j.pos = 'GOL'`)) {
    render = render.replace(/const c = \$\('#elenco-container'\),[\s\S]*?elAtv = appData\.elencos\[appData\.indiceAtivo\];/, (match) => {
        return match + normCode;
    });
}

fs.writeFileSync('assets/js/app-render.js', render, 'utf8');

console.log("Fixes applied");
