const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'assets', 'js');
fs.readdirSync(dir).forEach(f => {
    if (!f.endsWith('.js')) return;
    let p = path.join(dir, f);
    let c = fs.readFileSync(p, 'utf8');
    const regex = /if \(\s*===\s*s\.lineup\[k\].*?\{ delete l\[k\]; delete s\.lineup\[k\]; \}/g;
    
    let varName = 'j';
    if (f === 'app-render.js' || f === 'app-render_backup.js' || f === 'app-roster.js') {
        varName = 'r';
    }
    
    if (regex.test(c)) {
        c = c.replace(regex, 'if (s.lineup[k] === ' + varName + ' || l[k] === ' + varName + ' || l[k] === ' + varName + '.id || s.lineup[k] === ' + varName + '.id || l[k] === (' + varName + '.primeiroNome + ' + varName + '.sobrenome) || s.lineup[k] === (' + varName + '.primeiroNome + ' + varName + '.sobrenome) || l[k]?.id === ' + varName + '.id || s.lineup[k]?.id === ' + varName + '.id) { delete l[k]; delete s.lineup[k]; }');
        fs.writeFileSync(p, c);
        console.log('Fixed', f);
    }
});
