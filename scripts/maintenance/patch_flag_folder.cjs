const fs = require('fs');

let parseScript = fs.readFileSync('scripts/parse_sofifa.mjs', 'utf8');

const regex = /player\.flagUrl = flagImg\.getAttribute\('data-src'\) \|\| flagImg\.getAttribute\('src'\) \|\| '';[\s\S]*?\}/g;

const replacement = `player.flagUrl = flagImg.getAttribute('data-src') || flagImg.getAttribute('src') || '';
                        if (player.flagUrl) {
                            const filename = player.flagUrl.split('/').pop();
                            player.flagUrl = \`https://cdn.sofifa.net/flags/\${filename}\`;
                        }`;

parseScript = parseScript.replace(regex, replacement);
fs.writeFileSync('scripts/parse_sofifa.mjs', parseScript, 'utf8');
console.log('parse_sofifa.mjs flagUrl extraction improved!');
