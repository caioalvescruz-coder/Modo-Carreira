import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_FILE = path.resolve(__dirname, '../team_stats.csv');
const OUTPUT_FILE = path.resolve(__dirname, '../public/data/tracker_stats.json');

function parseCSV(csvText) {
    // Strip BOM
    if (csvText.charCodeAt(0) === 0xFEFF) {
        csvText = csvText.slice(1);
    }
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    
    // Header
    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    
    const results = [];
    for (let i = 1; i < lines.length; i++) {
        // More robust CSV split (handle commas inside quotes if any, though simple regex here works for basic cases)
        const rowString = lines[i];
        // match everything inside quotes or between commas
        const regex = /"([^"]*)"|([^,]+)/g;
        let match;
        const values = [];
        
        // Simpler approach since the CSV uses "val","val":
        const simpleVals = rowString.split('","').map(v => v.replace(/^"|"$/g, '').trim());
        
        const obj = {};
        headers.forEach((h, index) => {
            obj[h] = simpleVals[index];
        });
        results.push(obj);
    }
    return results;
}

async function main() {
    if (!fs.existsSync(CSV_FILE)) {
        console.warn(`[Tracker] Arquivo ${CSV_FILE} não encontrado. Nenhuma estatística gerada.`);
        return;
    }
    
    const content = fs.readFileSync(CSV_FILE, 'utf-8');
    const records = parseCSV(content);
    
    // We want to aggregate the stats for each player.
    // The tracker csv has multiple rows per player per competition.
    const playerStats = {};

    records.forEach(row => {
        const name = row['Player'];
        if (!name) return;

        if (!playerStats[name]) {
            playerStats[name] = {
                Appearances: 0,
                Goals: 0,
                Assists: 0,
                CleanSheets: 0,
                GoalsConceded: 0,
                Saves: 0,
                YellowCards: 0,
                RedCards: 0,
                Minutes: 0,
                MotM: 0,
                AvgRating: [], // will average later
                OVR: parseInt(row['OVR'] || 0),
                POT: parseInt(row['Potential'] || 0)
            };
        }

        const p = playerStats[name];
        p.Appearances += parseInt(row['Appearances'] || 0);
        p.Goals += parseInt(row['Goals'] || 0);
        p.Assists += parseInt(row['Assists'] || 0);
        p.CleanSheets += parseInt(row['Clean Sheets'] || 0);
        p.GoalsConceded += parseInt(row['Goals Conceded'] || 0);
        p.Saves += parseInt(row['Saves'] || 0);
        p.YellowCards += parseInt(row['Yellow Cards'] || 0);
        p.RedCards += parseInt(row['Red Cards'] || 0);
        p.Minutes += parseInt(row['Minutes'] || 0);
        p.MotM += parseInt(row['Man of the Match'] || 0);
        
        if (row['Avg Rating'] && parseFloat(row['Avg Rating']) > 0) {
            p.AvgRating.push(parseFloat(row['Avg Rating']));
        }
    });

    // Finalize averages
    Object.keys(playerStats).forEach(name => {
        const p = playerStats[name];
        if (p.AvgRating.length > 0) {
            const sum = p.AvgRating.reduce((a, b) => a + b, 0);
            p.finalRating = (sum / p.AvgRating.length).toFixed(2);
        } else {
            p.finalRating = '0.00';
        }
        delete p.AvgRating;
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(playerStats, null, 2), 'utf-8');
    console.log(`[Tracker] Estatísticas exportadas para: ${OUTPUT_FILE}`);
}

main();
