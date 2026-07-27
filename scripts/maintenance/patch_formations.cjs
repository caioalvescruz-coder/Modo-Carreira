const fs = require('fs');
const file = 'assets/js/app-transfers-stats.js';
let content = fs.readFileSync(file, 'utf8');

const formations = `const formacoesTaticas = {
    "4-3-3": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "MC1": "bottom:47%;left:30%", "MEI": "bottom:51%;left:50%", "MC2": "bottom:47%;left:70%", "PE": "bottom:72%;left:20%", "ATA": "bottom:77%;left:50%", "PD": "bottom:72%;left:80%" }
    },
    "4-3-3 (Contenção)": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "VOL": "bottom:38%;left:50%", "MC1": "bottom:47%;left:30%", "MC2": "bottom:47%;left:70%", "PE": "bottom:72%;left:20%", "ATA": "bottom:77%;left:50%", "PD": "bottom:72%;left:80%" }
    },
    "4-3-3 (Ofensivo)": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "MC1": "bottom:44%;left:35%", "MC2": "bottom:44%;left:65%", "MEI": "bottom:56%;left:50%", "PE": "bottom:72%;left:20%", "ATA": "bottom:77%;left:50%", "PD": "bottom:72%;left:80%" }
    },
    "4-3-3 (Falso 9)": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "MC1": "bottom:42%;left:30%", "MC2": "bottom:42%;left:70%", "MEI": "bottom:54%;left:50%", "PE": "bottom:72%;left:20%", "SA": "bottom:68%;left:50%", "PD": "bottom:72%;left:80%" }
    },
    "4-4-2 Clássico": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "ME": "bottom:50%;left:15%", "MC1": "bottom:47%;left:38%", "MC2": "bottom:47%;left:62%", "MD": "bottom:50%;left:85%", "ATA1": "bottom:75%;left:38%", "ATA2": "bottom:75%;left:62%" }
    },
    "4-4-2 Losango": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "VOL": "bottom:38%;left:50%", "MC1": "bottom:47%;left:30%", "MC2": "bottom:47%;left:70%", "MEI": "bottom:55%;left:50%", "ATA1": "bottom:75%;left:38%", "ATA2": "bottom:75%;left:62%" }
    },
    "4-2-3-1": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "VOL1": "bottom:38%;left:38%", "VOL2": "bottom:38%;left:62%", "MEI": "bottom:55%;left:50%", "PE": "bottom:72%;left:25%", "PD": "bottom:72%;left:75%", "ATA": "bottom:77%;left:50%" }
    },
    "4-1-4-1": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "VOL": "bottom:38%;left:50%", "ME": "bottom:55%;left:15%", "MC1": "bottom:47%;left:35%", "MC2": "bottom:47%;left:65%", "MD": "bottom:55%;left:85%", "ATA": "bottom:75%;left:50%" }
    },
    "4-3-2-1": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "MC1": "bottom:47%;left:25%", "VOL": "bottom:38%;left:50%", "MC2": "bottom:47%;left:75%", "MEI1": "bottom:58%;left:35%", "MEI2": "bottom:58%;left:65%", "ATA": "bottom:77%;left:50%" }
    },
    "4-5-1": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "ME": "bottom:55%;left:15%", "MC1": "bottom:47%;left:38%", "MC2": "bottom:47%;left:62%", "MD": "bottom:55%;left:85%", "MEI": "bottom:62%;left:50%", "ATA": "bottom:77%;left:50%" }
    },
    "4-2-2-2": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "VOL1": "bottom:38%;left:35%", "VOL2": "bottom:38%;left:65%", "MEI1": "bottom:58%;left:25%", "MEI2": "bottom:58%;left:75%", "ATA1": "bottom:75%;left:38%", "ATA2": "bottom:75%;left:62%" }
    },
    "4-4-1-1": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "ME": "bottom:50%;left:15%", "MC1": "bottom:47%;left:38%", "MC2": "bottom:47%;left:62%", "MD": "bottom:50%;left:85%", "SA": "bottom:65%;left:50%", "ATA": "bottom:77%;left:50%" }
    },
    "4-1-3-2": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "VOL": "bottom:38%;left:50%", "ME": "bottom:55%;left:20%", "MC": "bottom:47%;left:50%", "MD": "bottom:55%;left:80%", "ATA1": "bottom:75%;left:38%", "ATA2": "bottom:75%;left:62%" }
    },
    "4-3-1-2": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "MC1": "bottom:47%;left:25%", "VOL": "bottom:38%;left:50%", "MC2": "bottom:47%;left:75%", "MEI": "bottom:58%;left:50%", "ATA1": "bottom:75%;left:38%", "ATA2": "bottom:75%;left:62%" }
    },
    "4-2-4": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "MC1": "bottom:44%;left:38%", "MC2": "bottom:44%;left:62%", "PE": "bottom:72%;left:15%", "ATA1": "bottom:77%;left:38%", "ATA2": "bottom:77%;left:62%", "PD": "bottom:72%;left:85%" }
    },
    "4-1-2-1-2": {
        slots: { "GOL": "bottom:2%;left:50%", "LE": "bottom:25%;left:15%", "ZAG1": "bottom:22%;left:38%", "ZAG2": "bottom:22%;left:62%", "LD": "bottom:25%;left:85%", "VOL": "bottom:38%;left:50%", "ME": "bottom:50%;left:20%", "MD": "bottom:50%;left:80%", "MEI": "bottom:58%;left:50%", "ATA1": "bottom:75%;left:38%", "ATA2": "bottom:75%;left:62%" }
    }
};`;

const startIndex = content.indexOf('const formacoesTaticas = {');
const endIndex = content.indexOf('const mudarFormacao = nf => {');

if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + formations + '\n' + content.substring(endIndex);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Formations updated.");
} else {
    console.log("Could not find boundaries.");
}
