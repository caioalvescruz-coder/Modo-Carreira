import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { execSync } from 'child_process';

const inputDir = path.join(process.cwd(), 'Atualização da base de jogadores');
const archiveDir = path.join(process.cwd(), 'Base Universal', 'Paginas Brutas');
const dbFile = path.join(process.cwd(), 'data', 'base_sofifa.json');

// Ensure directories exist
if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });

// Load existing database
let playersMap = new Map();
if (fs.existsSync(dbFile)) {
    const raw = fs.readFileSync(dbFile, 'utf8');
    const arr = JSON.parse(raw);
    arr.forEach(p => playersMap.set(p.id, p));
}

// Canonical Keys
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

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.html'));

if (files.length === 0) {
    console.log("Nenhum arquivo .html novo encontrado em 'Atualização da base de jogadores'.");
    process.exit(0);
}

console.log(`Iniciando importação de ${files.length} novos arquivos...`);

let newCount = 0;
let updatedCount = 0;

const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

for (const [index, file] of files.entries()) {
    console.log(`[${index+1}/${files.length}] Processando ${file}...`);
    const inputPath = path.join(inputDir, file);
    const content = fs.readFileSync(inputPath, 'utf8');
    const dom = new JSDOM(content);
    const document = dom.window.document;

    const thead = document.querySelector('thead');
    if (!thead) {
        console.warn(`[Aviso] Nenhuma tabela encontrada em ${file}`);
    } else {
        const ths = Array.from(thead.querySelectorAll('th'));
        const colIndexMap = {};

        ths.forEach((th, idx) => {
            let text = th.textContent.trim().replace(/\s+/g, ' ');
            if (!text) {
                const dataCol = th.getAttribute('data-col');
                if (dataCol === 'pi') text = 'ID';
                else if (dataCol === 'ae') text = 'Idade';
            }
            let mappedKey = headerMap[text];
            if (mappedKey) colIndexMap[idx] = mappedKey;
        });

        const rows = document.querySelectorAll('tbody tr');
        
        rows.forEach(tr => {
            const tds = tr.querySelectorAll('td');
            const player = {};
            
            tds.forEach((td, idx) => {
                const key = colIndexMap[idx];
                if (key) {
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

            if (!player.id) {
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
                if (playersMap.has(player.id)) updatedCount++;
                else newCount++;
                
                playersMap.set(player.id, player);
            }
        });
    }

    // Move file to backup
    const newName = `lote_${timestamp}_${index+1}.html`;
    const destPath = path.join(archiveDir, newName);
    fs.renameSync(inputPath, destPath);

    // Also move the _files directory if it exists
    const filesDir = file.replace('.html', '_files');
    const filesDirPath = path.join(inputDir, filesDir);
    if (fs.existsSync(filesDirPath)) {
        const newFilesDir = newName.replace('.html', '_files');
        fs.renameSync(filesDirPath, path.join(archiveDir, newFilesDir));
    }
}

// Save unified db
const playersArray = Array.from(playersMap.values());
fs.writeFileSync(dbFile, JSON.stringify(playersArray, null, 2), 'utf8');

console.log(`\n✅ Extração concluída!`);
console.log(`🟢 ${newCount} novos jogadores adicionados à base.`);
console.log(`🔄 ${updatedCount} jogadores já existentes atualizados.`);
console.log(`Total na Base Unificada: ${playersArray.length} jogadores.`);

console.log(`\nReconstruindo o seed-data.js (Aba Olheiros)...`);
try {
    execSync('npm run seed', { stdio: 'inherit' });
    console.log(`\n🎉 Processo 100% finalizado com sucesso!`);
} catch (e) {
    console.error(`Erro ao rodar 'npm run seed'. Você pode rodar manualmente depois.`);
}
