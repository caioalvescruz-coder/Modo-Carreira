const fs = require('fs');
let r = fs.readFileSync('assets/js/app-render.js', 'utf8');

const targetNacao = "const nacaoH = j.nacionalidade ? `<div style=\"font-size:0.75em;color:#94a3b8;margin-top:2px;display:flex;align-items:center;justify-content:center;gap:3px\">Nac: ${j.nacionalidade}</div>` : `<div style=\"font-size:0.75em;color:#94a3b8;margin-top:2px;display:flex;align-items:center;justify-content:center;gap:3px\">Nac: 🚫</div>`;";
const replaceNacao = "const nacaoH = j.nacionalidade ? `<div style=\"font-size:0.75em;color:#94a3b8;margin-top:2px;display:flex;align-items:center;justify-content:center;gap:3px\">${j.flagUrl ? \`<img src=\"\${j.flagUrl}\" style=\"width:16px;height:12px;border-radius:2px\" title=\"\${j.nacionalidade}\">\` : 'Nac:'} ${j.nacionalidade}</div>` : `<div style=\"font-size:0.75em;color:#94a3b8;margin-top:2px;display:flex;align-items:center;justify-content:center;gap:3px\">Nac: 🚫</div>`;";

if(r.includes(targetNacao)) {
    r = r.replace(targetNacao, replaceNacao);
    fs.writeFileSync('assets/js/app-render.js', r);
    console.log('App-render nacao patched!');
} else {
    console.log('Target nacao string not found in app-render.js');
}
