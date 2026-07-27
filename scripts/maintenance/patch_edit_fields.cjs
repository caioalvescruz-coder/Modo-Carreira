const fs = require('fs');

let core = fs.readFileSync('assets/js/app-core.js', 'utf8');

// Modificar salvarEdicao (que está iterando sobre os dados)
core = core.replace(
    /let v;\s*\['situacao', 'status', 'primeiroNome', 'sobrenome', 'num', 'pos', 'pe'\]\.forEach\(f => \{/,
    `let v;
        ['situacao', 'status', 'primeiroNome', 'sobrenome', 'num', 'pos', 'pe', 'nacionalidade'].forEach(f => {`
);

if (!core.includes(`if ((v = sv(\`[data-field="positions"]\`)) !== null)`)) {
    core = core.replace(
        /if \(j\.situacao === 'Emprest\. - OUT'\) \{/,
        `if ((v = sv(\`[data-field="positions"]\`)) !== null) {
            let posList = v.split(',').map(p => p.trim().toUpperCase()).filter(p => p);
            if (!posList.includes(j.pos)) posList.unshift(j.pos);
            j.positions = posList;
        }
        if (j.situacao === 'Emprest. - OUT') {`
    );
}

fs.writeFileSync('assets/js/app-core.js', core, 'utf8');


let render = fs.readFileSync('assets/js/app-render.js', 'utf8');

// Replace nacionalidade renderer
render = render.replace(
    /\$\{j\.nacionalidade\|\|'\?\?'\}<\/div>/,
    `\${modoEdicao?\`<input type="text" data-field="nacionalidade" value="\${j.nacionalidade||''}" style="width:70px;background:#0f172a;color:#fbbf24;border:1px solid #334155;border-radius:3px;font-size:0.9em;padding:1px 2px;margin-left:2px;">\`:(j.nacionalidade||'??')}</div>`
);

// Replace positions renderer
render = render.replace(
    /\$\{\(!modoEdicao && j\.positions && j\.positions\.length > 1\) \? `(.*?)` : ''\}/,
    `\${(!modoEdicao && j.positions && j.positions.length > 1) ? \`$1\` : (modoEdicao ? \`<input type="text" data-field="positions" placeholder="Sec. Pos" value="\${j.positions ? j.positions.filter(p=>p!==j.pos).join(', ') : ''}" style="width:55px;font-size:0.65em;background:#0f172a;color:#fff;border:1px solid #334155;border-radius:2px;text-align:center;margin-top:2px;" title="Posições secundárias, separadas por vírgula">\` : '')}`
);

fs.writeFileSync('assets/js/app-render.js', render, 'utf8');
console.log("Patched!");
