const fs = require('fs');
const text = fs.readFileSync('data/jogadores_fc26.csv', 'utf8').replace(/^\uFEFF/, '');
function parseCSVBanco(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        const next = text[index + 1];
        if (char === '"' && quoted && next === '"') {
            cell += '"';
            index += 1;
        } else if (char === '"') {
            quoted = !quoted;
        } else if (char === ',' && !quoted) {
            row.push(cell);
            cell = '';
        } else if ((char === '\n' || char === '\r') && !quoted) {
            if (char === '\r' && next === '\n') index += 1;
            row.push(cell);
            if (row.some(value => value.trim())) rows.push(row);
            row = [];
            cell = '';
            if (rows.length === 2) return rows; // Stop early
        } else {
            cell += char;
        }
    }
    return rows;
}
const rows = parseCSVBanco(text);
console.log("Index 58:", rows[1][58]);
console.log("Index 59:", rows[1][59]);
console.log("Index 60:", rows[1][60]);
