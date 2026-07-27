const fs = require('fs');

let render = fs.readFileSync('assets/js/app-render.js', 'utf8');

// 1. Add getAlvoBtnHtml function if not exists
if (!render.includes('function getAlvoBtnHtml')) {
    const fn = `
function getAlvoBtnHtml(idx, j) {
    if (modoEdicao || abaAtiva !== 'banco') return '';
    let s = getSeason();
    if (s.jogadores && s.jogadores.some(el => el.id && el.id === j.id)) {
        return \`<button style="position:absolute;top:5px;right:5px;background:#334155;color:#94a3b8;border:none;padding:4px 8px;border-radius:4px;font-weight:700;cursor:not-allowed;font-size:.8em;z-index:10;" disabled>✅ Seu Elenco</button>\`;
    }
    if (s.mercado && s.mercado.some(el => el.id && el.id === j.id)) {
        return \`<button style="position:absolute;top:5px;right:5px;background:#334155;color:#94a3b8;border:none;padding:4px 8px;border-radius:4px;font-weight:700;cursor:not-allowed;font-size:.8em;z-index:10;" disabled>✅ Na Lista</button>\`;
    }
    return \`<button onclick="adicionarAoAlvoUniversal(\${idx}, this)" style="position:absolute;top:5px;right:5px;background:#0284c7;color:#fff;border:none;padding:4px 8px;border-radius:4px;font-weight:700;cursor:pointer;font-size:.8em;z-index:10;transition:all 0.2s" onmouseover="this.style.background='#0369a1'" onmouseout="this.style.background='#0284c7'">➕ Alvos</button>\`;
}
`;
    render = render.replace(
        /function consolidarEdicoes\(\) \{/,
        `${fn}\nfunction consolidarEdicoes() {`
    );
}

// 2. Replace the old button logic in template with getAlvoBtnHtml
render = render.replace(
    /\(\!modoEdicao&&abaAtiva==='banco'\)\?\`<button onclick="adicionarAoAlvoUniversal\(\$\{i\}, this\)"[^>]+>.. Alvos<\/button>\`\:''/,
    `\${getAlvoBtnHtml(i, j)}`
);

// 3. Make Clube editable
// Current: 🛡️ Clube: ${j.clube||'Livre'}
render = render.replace(
    /🛡️ Clube: \$\{j\.clube\|\|'Livre'\}/g,
    `🛡️ Clube: \${modoEdicao?\`<input type="text" data-field="clube" value="\${j.clube||''}" style="width:100px;background:#0f172a;color:#fbbf24;border:1px solid #334155;border-radius:3px;font-size:0.9em;padding:1px 2px;margin-left:2px;">\`:(j.clube||'Livre')}`
);

// 4. Update the smart search
// Current: (!tc || (j.clube && j.clube.toLowerCase().includes(tc)))
render = render.replace(
    /\(!tc \|\| \(j\.clube && j\.clube\.toLowerCase\(\)\.includes\(tc\)\)\)/g,
    `(!tc || (j.clube && tc.split(' ').every(w => w.trim() === '' || j.clube.toLowerCase().includes(w))))`
);

fs.writeFileSync('assets/js/app-render.js', render, 'utf8');
console.log("Patched app-render.js (Targets, Edit Club, Smart Search)");
