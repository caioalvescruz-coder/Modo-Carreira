const fs = require('fs');

// 1. Fix app-render.js (Pagination at the bottom)
let render = fs.readFileSync('assets/js/app-render.js', 'utf8');

// The line is: }).join('')) + `</tbody></table></div>`;
// Change it to: }).join('')) + `</tbody></table></div>` + paginationHtml;
render = render.replace(/\}\)\.join\(''\)\) \+ \`<\/tbody><\/table><\/div>\`;/g, 
                        `}).join('')) + \`</tbody></table></div>\` + paginationHtml;`);
fs.writeFileSync('assets/js/app-render.js', render, 'utf8');


// 2. Fix app-tactics.js (Handle blank primeiroNome)
let tactics = fs.readFileSync('assets/js/app-tactics.js', 'utf8');
// The line is: <div class="name">${l[k].primeiroNome[0]}. ${l[k].sobrenome}</div>
// Change it to: <div class="name">${l[k].primeiroNome ? l[k].primeiroNome[0] + '. ' : ''}${l[k].sobrenome}</div>
tactics = tactics.replace(/<div class="name">\$\{l\[k\]\.primeiroNome\[0\]\}\. \$\{l\[k\]\.sobrenome\}<\/div>/g, 
                          `<div class="name">\${l[k].primeiroNome ? l[k].primeiroNome[0] + '. ' : ''}\${l[k].sobrenome}</div>`);

// Also fix in the taticas-list-item:
// ${j.primeiroNome} ${j.sobrenome} -> ${j.primeiroNome ? j.primeiroNome + ' ' : ''}${j.sobrenome}
tactics = tactics.replace(/\$\{j\.primeiroNome\} \$\{j\.sobrenome\}/g, 
                          `\${j.primeiroNome ? j.primeiroNome + ' ' : ''}\${j.sobrenome}`);
fs.writeFileSync('assets/js/app-tactics.js', tactics, 'utf8');


// 3. Fix app-core.js (GL -> GOL mapping and cleanup)
let core = fs.readFileSync('assets/js/app-core.js', 'utf8');

// Insert a data normalizer inside salvarDados:
if (!core.includes(`if (j.pos === 'GL') j.pos = 'GOL';`)) {
    core = core.replace(/const salvarDados = \(syncLocal = true\) => \{/, 
                        `const salvarDados = (syncLocal = true) => {\n    appData.elencos.forEach(e => e.temporadas.forEach(t => { if (t.jogadores) t.jogadores.forEach(j => { if (j.pos === 'GL') j.pos = 'GOL'; }); if (t.mercado) t.mercado.forEach(j => { if (j.pos === 'GL') j.pos = 'GOL'; }); }));`);
}
fs.writeFileSync('assets/js/app-core.js', core, 'utf8');

console.log("Applied minor improvements");
