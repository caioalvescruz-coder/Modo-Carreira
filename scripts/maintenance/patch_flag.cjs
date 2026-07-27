const fs = require('fs');

let parseScript = fs.readFileSync('scripts/parse_sofifa.mjs', 'utf8');

const targetStr = `player.nation = flagImg.getAttribute('title') || flagImg.getAttribute('alt') || '';`;
const replacementStr = `player.nation = flagImg.getAttribute('title') || flagImg.getAttribute('alt') || '';
                        player.flagUrl = flagImg.getAttribute('data-src') || flagImg.getAttribute('src') || '';
                        if (player.flagUrl && player.flagUrl.startsWith('.')) player.flagUrl = player.flagUrl.replace(/^\\./, 'https://sofifa.com');
                        if (player.flagUrl && player.flagUrl.includes('/sofifa_files/')) {
                            // Convert local relative paths to cdn paths
                            const filename = player.flagUrl.split('/').pop();
                            player.flagUrl = \`https://cdn.sofifa.net/flags/\${filename}\`;
                        }`;

if (parseScript.includes(targetStr)) {
    parseScript = parseScript.replace(targetStr, replacementStr);
    fs.writeFileSync('scripts/parse_sofifa.mjs', parseScript, 'utf8');
    console.log('parse_sofifa.mjs patched to extract flagUrl!');
} else {
    console.log('Target string not found in parse_sofifa.mjs');
}
