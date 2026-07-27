const fs = require('fs');

let render = fs.readFileSync('assets/js/app-render.js', 'utf8');

const target = `\${j.positions.filter(p=>p!==j.pos).map(p=>\`<span style="font-size:0.65em;background:rgba(255,255,255,0.1);padding:1px 4px;border-radius:3px">\${p}</span>\`).join('')}`;
const replacement = `\${j.positions.filter(p=>p!==j.pos).map(p=>\`<span class="\${p==='GOL'?'c-gol':['ZAG','LE','LD'].includes(p)?'c-def':['VOL','MC','MEI','MD','ME'].includes(p)?'c-mid':'c-atk'}" style="font-size:0.65em;padding:1px 4px;border-radius:3px">\${p}</span>\`).join('')}`;

if (render.includes(target)) {
    render = render.replace(target, replacement);
    fs.writeFileSync('assets/js/app-render.js', render, 'utf8');
    console.log("Successfully replaced secondary positions colors!");
} else {
    console.log("Target string not found. Please verify the code manually.");
}
