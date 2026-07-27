const fs = require('fs');
let c = fs.readFileSync('assets/js/app-core.js', 'utf8');
c = c.replace("nacionalidade: data.nation || '',", "nacionalidade: data.nation || '',\n        flagUrl: data.flagUrl || '',");
fs.writeFileSync('assets/js/app-core.js', c);
console.log('App-core flagUrl patched!');
