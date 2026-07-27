const fs = require('fs');

let core = fs.readFileSync('assets/js/app-core.js', 'latin1');

const targetStr = `        ovr: parseInt(columns[4] || 0),
        potMax: parseInt(columns[4] || 0),`;

const replacementStr = `        ovr: parseInt(columns[4] || 0),
        potMax: (() => {
            const ovr = parseInt(columns[4] || 0);
            const age = parseInt(columns[47] || 25);
            // Deterministic pseudo-random based on ID so it never changes for the same player
            const id = parseInt(columns[0] || 0);
            const rng = (id % 100) / 100; // Value between 0.00 and 0.99
            
            let growth = 0;
            if (age <= 19) growth = Math.floor(6 + (rng * 8)); // 6 to 13
            else if (age <= 22) growth = Math.floor(4 + (rng * 5)); // 4 to 8
            else if (age <= 25) growth = Math.floor(1 + (rng * 4)); // 1 to 4
            else if (age <= 28) growth = Math.floor(rng * 2); // 0 to 1
            else growth = 0;
            
            let pot = ovr + growth;
            if (pot > 94 && ovr < 94) pot = 94 + Math.floor(rng * 2); // Cap at ~95 unless already higher
            return pot;
        })(),`;

if (core.includes(targetStr)) {
    core = core.replace(targetStr, replacementStr);
    fs.writeFileSync('assets/js/app-core.js', core, 'latin1');
    console.log('Fake Potential patched successfully!');
} else {
    console.log('Target string not found in app-core!');
}
