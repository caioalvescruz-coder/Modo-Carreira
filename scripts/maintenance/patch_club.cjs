const fs = require('fs');

// 1. Update app-core.js to capture club
let core = fs.readFileSync('assets/js/app-core.js', 'utf8');

// The target inside toPlayerFromUniversalDB where fields are defined:
//      est: {},
//      nacionalidade: data.nation || '',
if (!core.includes('clube: data.team || "",')) {
    core = core.replace(
        /est: \{\},/,
        `est: {},
        clube: data.team || "",`
    );
    fs.writeFileSync('assets/js/app-core.js', core, 'utf8');
    console.log("app-core.js patched!");
}

// 2. Update index.html to add search input
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('id="search-clube"')) {
    html = html.replace(
        /<div class="search-area"><input type="text" id="search-input" placeholder="([^"]+)" oninput="debounceBusca\(\)"><\/div>/,
        `<div class="search-area" style="display:flex;gap:10px;"><input type="text" id="search-input" placeholder="$1" oninput="debounceBusca()"><input type="text" id="search-clube" placeholder="🛡️ Buscar por clube..." oninput="debounceBusca()"></div>`
    );
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("index.html patched!");
}

// 3. Update app-render.js for filtering and rendering
let render = fs.readFileSync('assets/js/app-render.js', 'utf8');

if (!render.includes(`const tc = $('#search-clube')`)) {
    render = render.replace(
        /const tm = \$\('#search-input'\)\.value\.toLowerCase\(\),\s*srt = \$\('#sort-select'\)\.value;/,
        `const tm = $('#search-input').value.toLowerCase(),\n        tc = $('#search-clube') ? $('#search-clube').value.toLowerCase() : '',\n        srt = $('#sort-select').value;`
    );
}

if (!render.includes(`(!tc || (j.clube && j.clube.toLowerCase().includes(tc)))`)) {
    // There's a filter condition that ends around `(j.valor >= filtros.fx.valor[0] && j.valor <= filtros.fx.valor[1])`
    // Let's add it right after tm check:
    render = render.replace(
        /\(\`\$\{j\.primeiroNome\} \$\{j\.sobrenome\}\`\.toLowerCase\(\)\.includes\(tm\)\) &&/,
        `(\`\${j.primeiroNome} \${j.sobrenome}\`.toLowerCase().includes(tm)) &&\n        (!tc || (j.clube && j.clube.toLowerCase().includes(tc))) &&`
    );
}

// Update card renderer to show club (e.g., next to or below nationality)
// The HTML template: <div class="phys-row" style="margin-top:2px;display:flex;align-items:center;gap:4px">Nac: ${j.flagUrl ...
// Change to: Nac: ... | Clube: ${j.clube || 'N/A'}
// Let's find the exact current nationality row
if (!render.includes('j.clube||')) {
    // Current: 
    // <div class="phys-row" style="margin-top:2px;display:flex;align-items:center;gap:4px">Nac: ${j.flagUrl ? `<img src="${j.flagUrl}" style="height:12px;border-radius:2px;object-fit:cover" referrerpolicy="no-referrer">` : ''} ${modoEdicao?`<input type="text" data-field="nacionalidade" value="${j.nacionalidade||''}" style="width:70px;background:#0f172a;color:#fbbf24;border:1px solid #334155;border-radius:3px;font-size:0.9em;padding:1px 2px;margin-left:2px;">`:(j.nacionalidade||'??')}</div>
    render = render.replace(
        /Nac: (.*?)<\/div><div class="phys-row" style="margin-top:2px;">Contrato:/,
        `Nac: $1</div><div class="phys-row" style="margin-top:2px;display:flex;align-items:center;gap:4px">🛡️ Clube: \${j.clube||'Livre'}</div><div class="phys-row" style="margin-top:2px;">Contrato:`
    );
}

fs.writeFileSync('assets/js/app-render.js', render, 'utf8');
console.log("app-render.js patched!");
