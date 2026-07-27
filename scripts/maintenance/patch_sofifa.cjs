const fs = require('fs');

let core = fs.readFileSync('assets/js/app-core.js', 'latin1');

const targetStr = `        img: columns[58] ? columns[58].trim() : ''`;
const replacementStr = `        img: (() => {
            const id = columns[0] ? columns[0].trim().padStart(6, '0') : '000000';
            return \`https://cdn.sofifa.net/players/\${id.slice(0,3)}/\${id.slice(3,6)}/24_120.png\`;
        })()`;

if (core.includes(targetStr)) {
    core = core.replace(targetStr, replacementStr);
    fs.writeFileSync('assets/js/app-core.js', core, 'latin1');
    console.log('SoFIFA images patched successfully!');
} else {
    console.log('Target string not found in app-core!');
}
