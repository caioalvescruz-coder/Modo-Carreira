const fs = require('fs');

let core = fs.readFileSync('assets/js/app-core.js', 'utf8');

const targetStr = `if (j.situacao === 'Emprest. - OUT') {`;
const insertStr = `if ((v = sv(\`[data-field="positions"]\`)) !== null) {
            let posList = v.split(',').map(p => p.trim().toUpperCase()).filter(p => p);
            if (!posList.includes(j.pos)) posList.unshift(j.pos);
            j.positions = posList;
        }
        if (j.situacao === 'Emprest. - OUT') {`;

if (core.includes(targetStr) && !core.includes(`data-field="positions"`)) {
    core = core.replace(targetStr, insertStr);
    fs.writeFileSync('assets/js/app-core.js', core, 'utf8');
    console.log("Patched positions in app-core!");
} else {
    console.log("Failed to find target string or already patched.");
}
