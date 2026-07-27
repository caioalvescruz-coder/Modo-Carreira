const fs = require('fs');

let tactics = fs.readFileSync('assets/js/app-tactics.js', 'utf8');

// Remove the confirmarSalvarLineup definition
tactics = tactics.replace(
    /window\.confirmarSalvarLineup = function[\s\S]*?window\.salvarLineup = function/m,
    `window.salvarLineup = function`
);

// Update onclick handler
tactics = tactics.replace(
    /onclick="confirmarSalvarLineup\(/g,
    `onclick="salvarLineup(`
);

// We need to make sure select-lineup was completely replaced.
// Since we used regex, it's correct.

fs.writeFileSync('assets/js/app-tactics.js', tactics, 'utf8');
console.log("Cleaned up Tactics UI redundant function");
