const fs = require('fs');

let render = fs.readFileSync('assets/js/app-render.js', 'utf8');

// 1. Remove the "Contrato" row below club
const contratoRow = `<div class="phys-row" style="margin-top:2px;">Contrato: \${modoEdicao?\`<div style="display:inline-flex;align-items:center;gap:2px;margin-left:5px"><input type="number" data-field="contAnos" value="\${j.contAnos}" style="width:35px;margin:0;background:#0f172a;color:#fbbf24;border:1px solid #334155;text-align:center;">a <input type="number" data-field="contMeses" value="\${j.contMeses}" style="width:35px;margin:0;background:#0f172a;color:#fbbf24;border:1px solid #334155;text-align:center;">m</div>\`:\`\${j.contAnos}a \${j.contMeses}m\`}</div>`;
// Replace the exact matching string with nothing
if (render.includes(contratoRow)) {
    render = render.replace(contratoRow, '');
} else {
    // If exact match fails, let's try regex
    render = render.replace(/<div class="phys-row" style="margin-top:2px;">Contrato:[\s\S]*?<\/div>/g, '');
}

// 2. Remove the Nac line entirely
const nacRow = `<div class="phys-row" style="margin-top:2px;display:flex;align-items:center;gap:4px">Nac: \${j.flagUrl ? \`<img src="\${j.flagUrl}" style="height:12px;border-radius:2px;object-fit:cover" referrerpolicy="no-referrer">\` : ''} \${j.nacionalidade||'🏴'}</div>`;
if (render.includes(nacRow)) {
    render = render.replace(nacRow, '');
} else {
    render = render.replace(/<div class="phys-row" style="margin-top:2px;display:flex;align-items:center;gap:4px">Nac:[\s\S]*?<\/div>/g, '');
}

// 3. Add flag to the Pe Bom line
// The line currently ends with: ... :j.pe}</div>
// We want to add the flag before the closing </div>
const oldPeLineEnd = `:j.pe}</div>`;
const newPeLineEnd = `:j.pe} <span style="color:#475569;margin:0 4px">|</span> \${j.flagUrl ? \`<img src="\${j.flagUrl}" style="height:12px;border-radius:2px;object-fit:cover" referrerpolicy="no-referrer" title="\${j.nacionalidade||''}">\` : ''}</div>`;
if (render.includes(oldPeLineEnd)) {
    // only replace the first occurrence (which is in the player card, though there might be others?)
    // Let's use a more specific regex for the end of the phys-row
    render = render.replace(/<div class="phys-row">\$\{modoEdicao[\s\S]*?\}<\/div>/g, (match) => {
        if (match.includes('idade') && match.includes('alt') && match.includes('pe')) {
            return match.replace(oldPeLineEnd, newPeLineEnd);
        }
        return match;
    });
}

fs.writeFileSync('assets/js/app-render.js', render, 'utf8');
console.log("Card layout simplified!");
