const fs = require('fs');

let render = fs.readFileSync('assets/js/app-render.js', 'utf8');

// The block we injected previously starts with:
//     let paginationHtml = '';
//     if (totalPaginas > 1) {
//         let pB = [];
//         let start = Math.max(1, paginaAtual - 2);
// ...
//         paginationHtml = `<div style="display:flex;justify-content:center;align-items:center;gap:5px;padding:20px;grid-column:1/-1;width:100%">${pB.join('')}</div>`;
//     }

const oldPagination = `    let paginationHtml = '';
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
    }`;

const newPagination = `    let paginationHtml = '';
    if (totalPaginas > 1) {
        let pB = [];
        if (paginaAtual > 1) pB.push(\`<button class="filtro-btn" style="padding:6px 10px;font-weight:bold" onclick="mudarPagina(\${paginaAtual - 1})">« Anterior</button>\`);
        let start = Math.max(1, paginaAtual - 2);
        let end = Math.min(totalPaginas, start + 4);
        if (end - start < 4) start = Math.max(1, end - 4);
        if (start > 1) pB.push(\`<button class="filtro-btn" onclick="mudarPagina(1)">1</button>\`);
        if (start > 2) pB.push('<span style="color:#94a3b8">...</span>');
        for(let p=start; p<=end; p++) pB.push(\`<button class="filtro-btn \${p === paginaAtual ? 'ativo' : ''}" onclick="mudarPagina(\${p})">\${p}</button>\`);
        if (end < totalPaginas - 1) pB.push('<span style="color:#94a3b8">...</span>');
        if (end < totalPaginas) pB.push(\`<button class="filtro-btn" onclick="mudarPagina(\${totalPaginas})">\${totalPaginas}</button>\`);
        if (paginaAtual < totalPaginas) pB.push(\`<button class="filtro-btn" style="padding:6px 10px;font-weight:bold" onclick="mudarPagina(\${paginaAtual + 1})">Próximo »</button>\`);
        paginationHtml = \`<div style="display:flex;justify-content:center;align-items:center;gap:5px;padding:15px;grid-column:1/-1;width:100%;flex-wrap:wrap;">\${pB.join('')}</div>\`;
    }`;

render = render.replace(oldPagination, newPagination);

// Now to add it to the top as well.
// For table view:
// c.innerHTML = tabsHtml + `<div class="table-container"><table class="table-view">...`
render = render.replace('c.innerHTML = tabsHtml + `<div class="table-container">', 'c.innerHTML = tabsHtml + paginationHtml + `<div class="table-container">');

// For grid view:
// c.innerHTML = tabsHtml + (f.length === 0 ? `<div style="grid-column:1/-1;...
render = render.replace('c.innerHTML = tabsHtml + (f.length === 0 ?', 'c.innerHTML = tabsHtml + paginationHtml + (f.length === 0 ?');

fs.writeFileSync('assets/js/app-render.js', render, 'utf8');
console.log('Added prev/next and top pagination successfully.');
