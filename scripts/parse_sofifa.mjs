import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const rawDir = path.join(process.cwd(), 'sofifa_raw');
const outDir = path.join(process.cwd(), 'data');
const outFile = path.join(outDir, 'base_sofifa.json');

if (!fs.existsSync(rawDir)) {
    fs.mkdirSync(rawDir);
}

// Map of canonical keys we want vs what we might find in SoFIFA headers
const headerMap = {
    'Nome': 'name',
    'Idade': 'age',
    'Classificação Geral': 'ovr',
    'Potencial': 'pot',
    'Time & Contrato': 'team_contract',
    'ID': 'id',
    'Altura': 'height',
    'foot': 'foot', // 'Pé bom' can be 'foot'
    'Perna boa': 'foot',
    'Valor': 'value',
    'Salário': 'wage',
    'Perna ruim': 'weak_foot',
    'Fintas': 'skill_moves',
    'Ritmo / Elasticidade': 'pac',
    'Finaliz. / Manejo': 'sho',
    'Passes / Chute': 'pas',
    'Condução / Reflexos': 'dri',
    'Defesa / Ritmo': 'def',
    'Físico / Posicionamento': 'phy',
    'Ano de Nascimento': 'birth_year',
    'Evolução': 'growth',
    'Cláusula de Recisão': 'release_clause',
    'Cláusula de Rescisão': 'release_clause',
    'Club kit number': 'kit_number',
    'Número da camisa': 'kit_number'
};

const playersMap = new Map();

const files = fs.readdirSync(rawDir).filter(f => f.endsWith('.html') || f.endsWith('.csv') || f.endsWith('.htm'));

console.log(`Encontrados ${files.length} arquivo(s) na pasta sofifa_raw.`);

for (const file of files) {
    console.log(`Lendo ${file}...`);
    const content = fs.readFileSync(path.join(rawDir, file), 'utf8');
    const dom = new JSDOM(content);
    const document = dom.window.document;

    const thead = document.querySelector('thead');
    if (!thead) {
        console.warn(`[Aviso] Nenhuma tabela encontrada em ${file}`);
        continue;
    }

    const ths = Array.from(thead.querySelectorAll('th'));
    const colIndexMap = {};

    ths.forEach((th, idx) => {
        let text = th.textContent.trim().replace(/\s+/g, ' ');
        if (!text) {
            // Some columns might have icons or be empty, check data-col
            const dataCol = th.getAttribute('data-col');
            if (dataCol === 'pi') text = 'ID';
            else if (dataCol === 'ae') text = 'Idade';
        }
        
        let mappedKey = headerMap[text];
        if (mappedKey) {
            colIndexMap[idx] = mappedKey;
        }
    });

    const rows = document.querySelectorAll('tbody tr');
    console.log(`Parseando ${rows.length} jogadores...`);

    rows.forEach(tr => {
        const tds = tr.querySelectorAll('td');
        const player = {};
        
        tds.forEach((td, idx) => {
            const key = colIndexMap[idx];
            if (key) {
                // Special handling for Name cell which contains Name, Nationality, and Positions
                if (key === 'name') {
                    const fullNameNode = td.querySelector('a[data-tippy-content]');
                    if (fullNameNode) {
                        player.fullName = fullNameNode.getAttribute('data-tippy-content');
                        player.name = fullNameNode.textContent.trim();
                    }
                    
                    const flagImg = td.querySelector('img.flag');
                    if (flagImg) {
                        player.nation = flagImg.getAttribute('title') || flagImg.getAttribute('alt') || '';
                        player.flagUrl = flagImg.getAttribute('data-src') || flagImg.getAttribute('src') || '';
                        if (player.flagUrl) {
                            const filename = player.flagUrl.split('/').pop();
                            player.flagUrl = `https://cdn.sofifa.net/flags/${filename}`;
                        }
                    }
                    
                    const posSpans = td.querySelectorAll('.pos');
                    player.positions = Array.from(posSpans).map(s => s.textContent.trim());
                    // Primary position is the first one
                    if (player.positions.length > 0) {
                        player.position = player.positions[0];
                    }
                } else if (key === 'team_contract') {
                    const teamLink = td.querySelector('a');
                    if (teamLink) {
                        player.team = teamLink.textContent.trim();
                    } else {
                        player.team = td.textContent.trim();
                    }
                    const subDiv = td.querySelector('div.sub');
                    if (subDiv) {
                        player.team_contract = subDiv.textContent.trim();
                    }
                } else {
                    player[key] = td.textContent.trim();
                }
            }
        });

        // Ensure ID exists
        if (!player.id) {
            // Try to extract ID from avatar image if column wasn't found
            const avatar = tr.querySelector('img.player-check');
            if (avatar && avatar.getAttribute('id')) {
                player.id = avatar.getAttribute('id');
            } else {
                const nameLink = tr.querySelector('a[href^="/player/"]');
                if (nameLink) {
                    const match = nameLink.getAttribute('href').match(/\/player\/(\d+)\//);
                    if (match) player.id = match[1];
                }
            }
        }

        if (player.id) {
            playersMap.set(player.id, player);
        }
    });
}

const playersArray = Array.from(playersMap.values());
fs.writeFileSync(outFile, JSON.stringify(playersArray, null, 2), 'utf8');

console.log(`\nSUCESSO! Base de dados extraída com ${playersArray.length} jogadores.`);
console.log(`Arquivo salvo em: ${outFile}`);
