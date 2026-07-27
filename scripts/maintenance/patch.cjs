const fs = require('fs');
let c = fs.readFileSync('assets/js/app-render.js', 'utf8');

c = c.replace('</select>`:j.pe}</div><div class="phys-row" style="margin-top:2px;">Contrato:', '</select>`:j.pe}</div><div class="phys-row" style="margin-top:2px;">Nac: ${j.nacionalidade||\'🚫\'}</div><div class="phys-row" style="margin-top:2px;">Contrato:');

c = c.replace('${(!modoEdicao&&abaAtiva===\'mercado\'&&subAbaMercado===\'alvos\')?`<button onclick="abrirModalContratar(${i})" style="position:absolute;top:5px;right:5px;background:#15803d;color:#fff;border:none;padding:4px 8px;border-radius:4px;font-weight:700;cursor:pointer;font-size:.8em;z-index:10;">🤝 Contratar</button>`:\'\'}', '${(!modoEdicao&&abaAtiva===\'mercado\'&&subAbaMercado===\'alvos\')?`<button onclick="abrirModalContratar(${i})" style="position:absolute;top:5px;right:5px;background:#15803d;color:#fff;border:none;padding:4px 8px;border-radius:4px;font-weight:700;cursor:pointer;font-size:.8em;z-index:10;">🤝 Contratar</button>`:(!modoEdicao&&abaAtiva===\'banco\')?`<button onclick="adicionarAoAlvoUniversal(${i}, this)" style="position:absolute;top:5px;right:5px;background:#0284c7;color:#fff;border:none;padding:4px 8px;border-radius:4px;font-weight:700;cursor:pointer;font-size:.8em;z-index:10;transition:all 0.2s" onmouseover="this.style.background=\'#0369a1\'" onmouseout="this.style.background=\'#0284c7\'">➕ Alvos</button>`:\'\'}');

fs.writeFileSync('assets/js/app-render.js', c, 'utf8');
console.log('Patch complete.');
