const fs = require('fs');

let tactics = fs.readFileSync('assets/js/app-tactics.js', 'utf8');

// Inject confirming save function
if (!tactics.includes('function confirmarSalvarLineup')) {
    tactics = tactics.replace(
        /window\.salvarLineup = function\(nome\) \{/,
        `window.confirmarSalvarLineup = function(nome) {
    if (confirm('Tem certeza que deseja salvar a escalação atual como a predefinição "' + nome + '"? Isso irá sobrescrever a configuração anterior.')) {
        salvarLineup(nome);
    }
};
window.salvarLineup = function(nome) {`
    );
}

// Replace the old UI block
const oldUI = `<div style="display:flex;align-items:center;gap:8px;"><label style="color:#fbbf24;font-weight:700;font-size:.9em;">Escalao:</label><select id="select-lineup" onchange="carregarLineup(this.value)" style="padding:5px;border-radius:5px;background:#0f172a;color:#fff;border:1px solid #334155;font-size:.9em;"><option value="atual">Aes Rpidas...</option>\${['Titular','Reserva','Opo 2','Opo 3'].map(o=>\`<option value="\${o}">Carregar \${o}</option>\`).join('')}</select>\${['Titular','Reserva','Opo 2','Opo 3'].map((o,i)=>\`<button onclick="salvarLineup('\${o}')" style="background:\${['#15803d','#0284c7','#9333ea','#ea580c'][i]};color:#fff;border:none;padding:5px 8px;border-radius:5px;cursor:pointer;font-size:.75em;font-weight:700;" title="Salvar \${o}">?? \${o.replace('Opo ','Op. ')}</button>\`).join('')}\${btnReg}</div>`;

const newUI = `<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;">\${['Titular','Secundário','Reserva','Promissores','Outro'].map((o,i) => {
    let colors = ['#15803d', '#0284c7', '#9333ea', '#ea580c', '#475569'];
    return \`<div style="display:flex;border-radius:5px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.3)">
        <button onclick="carregarLineup('\${o}')" style="background:\${colors[i]};color:white;border:none;padding:6px 12px;font-weight:bold;cursor:pointer;font-size:0.85em;transition:opacity 0.2s" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1" title="Carregar \${o}">\${o}</button>
        <button onclick="confirmarSalvarLineup('\${o}')" style="background:\${colors[i]};color:white;border:none;border-left:1px solid rgba(255,255,255,0.2);padding:6px 8px;cursor:pointer;font-size:0.85em;transition:filter 0.2s" onmouseover="this.style.filter='brightness(0.8)'" onmouseout="this.style.filter='none'" title="Salvar escalação atual como \${o}">💾</button>
    </div>\`;
}).join('')}\${btnReg}</div>`;

// The oldUI string has weird encoding characters because of powershell stdout, so we better use regex to replace it
tactics = tactics.replace(
    /<div style="display:flex;align-items:center;gap:8px;"><label [^>]+>Escala.*?<\/div><\/div>/,
    `${newUI}</div>`
);

fs.writeFileSync('assets/js/app-tactics.js', tactics, 'utf8');
console.log("Patched app-tactics.js UI!");
