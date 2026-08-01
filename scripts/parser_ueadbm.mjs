import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const EXPORT_DIR = path.resolve(__dirname, '../base_save');
const OUTPUT_DIR = path.resolve(__dirname, '../public/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'database.json');
const FLAMENGO_TEAM_ID = 1043;

// Melhor função de parse
function parseTable(filename) {
    const filePath = path.join(EXPORT_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`[Aviso] Arquivo não encontrado: ${filePath}`);
        return [];
    }
    
    // UEADBM exporta em utf-16le
    let content = fs.readFileSync(filePath, 'utf16le');
    
    // Remover o BOM se existir (no utf16le o BOM FEFF vira FFFE ou FEFF dependendo de como o node lê)
    if (content.charCodeAt(0) === 0xFEFF || content.charCodeAt(0) === 0xFFFE) {
        content = content.slice(1);
    }
    
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split('\t').map(h => h.trim().toLowerCase());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const row = {};
        for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = values[j] ? values[j].trim() : '';
        }
        data.push(row);
    }
    
    return data;
}

async function main() {
    console.log('Iniciando o processamento dos dados do UEADBM...');

    // 1. Carregar tabelas necessárias
    console.log('Lendo teamplayerlinks.txt...');
    const teamPlayerLinks = parseTable('teamplayerlinks.txt');
    
    console.log('Lendo players.txt...');
    const players = parseTable('players.txt');
    
    console.log('Lendo career_playercontract.txt...');
    const contracts = parseTable('career_playercontract.txt');
    
    console.log('Lendo dcplayernames.txt e playernames.txt...');
    const nameMap = {};
    const dcNames = parseTable('dcplayernames.txt');
    for (const n of dcNames) {
        nameMap[n.nameid] = n.name;
    }
    
    try {
        const pNames = parseTable('playernames.txt');
        for (const n of pNames) {
            nameMap[n.nameid] = n.name;
        }
    } catch (e) {
        console.warn('Arquivo playernames.txt não encontrado. Alguns nomes reais podem ficar ocultos.');
    }

    console.log('Lendo editedplayernames.txt...');
    const editedNames = parseTable('editedplayernames.txt');
    const editedNameMap = {};
    for (const en of editedNames) {
        editedNameMap[en.playerid] = {
            firstName: en.firstname,
            lastName: en.surname,
            commonName: en.commonname
        };
    }
    
    console.log('Carregando base_sofifa.json como fallback...');
    let sofifaMap = {};
    try {
        const sofifaPath = path.resolve(__dirname, '../data/base_sofifa.json');
        if (fs.existsSync(sofifaPath)) {
            const sofifaData = JSON.parse(fs.readFileSync(sofifaPath, 'utf8'));
            for (const p of sofifaData) {
                sofifaMap[p.id] = p.name;
            }
        }
    } catch (e) {
        console.warn('Fallback base_sofifa indisponível');
    }
    
    // 2. Filtrar jogadores do Flamengo
    const flamengoLinks = teamPlayerLinks.filter(link => parseInt(link.teamid) === FLAMENGO_TEAM_ID);
    console.log(`Encontrados ${flamengoLinks.length} jogadores associados ao Flamengo.`);
    
    // Criar mapa de contratos para busca rápida
    const contractMap = {};
    for (const c of contracts) {
        contractMap[c.playerid] = c;
    }
    
    // Criar mapa de jogadores (atributos) para busca rápida
    const playerMap = {};
    for (const p of players) {
        playerMap[p.playerid] = p;
    }
    
    // 3. Cruzar os dados
    const finalRoster = [];
    
    for (const link of flamengoLinks) {
        const pid = link.playerid;
        const pData = playerMap[pid] || {};
        const cData = contractMap[pid] || {};
        const enData = editedNameMap[pid];

        let firstName = '', lastName = '', commonName = '';
        if (enData) {
            firstName = enData.firstName || '';
            lastName = enData.lastName || '';
            commonName = enData.commonName || '';
        } else {
            firstName = nameMap[pData.firstnameid] || '';
            lastName = nameMap[pData.lastnameid] || '';
            commonName = nameMap[pData.commonnameid] || '';
        }

        let displayName = commonName || (firstName + ' ' + lastName).trim();
        if (!displayName && sofifaMap[pid]) {
            displayName = sofifaMap[pid];
        }
        
        // --- MANUAL OVERRIDES PARA FIFA MANIA ---
        const manualOverrides = {
            '227275': 'Agustín Rossi',
            '263673': 'Andrew',
            '96725': 'Evertton Araújo' // Ajuste se for outro jogador da base
        };
        if (manualOverrides[pid]) {
            displayName = manualOverrides[pid];
        }
        
        if (!displayName) displayName = 'Unknown';
        
        // Mapeamento de posições EA
        const posMap = {
            0:'GOL', 1:'L', 2:'ADD', 3:'LD', 4:'ZAG', 5:'ZAG', 6:'ZAG', 7:'LE', 8:'ADE', 
            9:'VOL', 10:'VOL', 11:'VOL', 12:'MD', 13:'MC', 14:'MC', 15:'MC', 16:'ME', 
            17:'MEI', 18:'MEI', 19:'MEI', 20:'SA', 21:'SA', 22:'SA', 23:'PD', 24:'ATA', 25:'ATA', 26:'ATA', 27:'PE'
        };
        const prefPosCode = parseInt(pData.preferredposition1);
        const posString = posMap[prefPosCode] || 'RES';

        // Mapeamento de status no elenco
        const linePosition = parseInt(link.position);
        let statusElenco = 'Não Relacionado';
        if (linePosition < 11) statusElenco = 'Titular';
        else if (linePosition === 28) statusElenco = 'Reserva';
        
        let isGK = posString === 'GOL';
        
        let pac, sho, pas, dri, def, phy;
        let gkSpeed = 0;
        
        if (isGK) {
            gkSpeed = Math.round(((parseInt(pData.acceleration) || 0) + (parseInt(pData.sprintspeed) || 0)) / 2);
            pac = parseInt(pData.gkdiving) || 0;
            sho = parseInt(pData.gkhandling) || 0;
            pas = parseInt(pData.gkkicking) || 0;
            dri = parseInt(pData.gkreflexes) || 0;
            def = gkSpeed;
            phy = parseInt(pData.gkpositioning) || 0;
        } else {
            pac = Math.round((parseInt(pData.sprintspeed) || 0) * 0.55 + (parseInt(pData.acceleration) || 0) * 0.45);
            sho = Math.round((parseInt(pData.finishing) || 0) * 0.45 + (parseInt(pData.longshots) || 0) * 0.2 + (parseInt(pData.shotpower) || 0) * 0.2 + (parseInt(pData.positioning) || 0) * 0.1 + (parseInt(pData.volleys) || 0) * 0.05);
            pas = Math.round((parseInt(pData.shortpassing) || 0) * 0.35 + (parseInt(pData.vision) || 0) * 0.2 + (parseInt(pData.crossing) || 0) * 0.2 + (parseInt(pData.longpassing) || 0) * 0.15 + (parseInt(pData.curve) || 0) * 0.05 + (parseInt(pData.freekickaccuracy) || 0) * 0.05);
            dri = Math.round((parseInt(pData.dribbling) || 0) * 0.5 + (parseInt(pData.ballcontrol) || 0) * 0.3 + (parseInt(pData.agility) || 0) * 0.1 + (parseInt(pData.balance) || 0) * 0.05 + (parseInt(pData.reactions) || 0) * 0.05);
            def = Math.round((parseInt(pData.standingtackle) || 0) * 0.3 + (parseInt(pData.defensiveawareness) || 0) * 0.3 + (parseInt(pData.interceptions) || 0) * 0.2 + (parseInt(pData.headingaccuracy) || 0) * 0.1 + (parseInt(pData.slidingtackle) || 0) * 0.1);
            phy = Math.round((parseInt(pData.strength) || 0) * 0.5 + (parseInt(pData.stamina) || 0) * 0.25 + (parseInt(pData.aggression) || 0) * 0.2 + (parseInt(pData.jumping) || 0) * 0.05);
        }
        
        finalRoster.push({
            id: pid,
            name: displayName,
            firstName: firstName,
            lastName: lastName,
            commonName: commonName,
            
            jerseyNumber: link.jerseynumber,
            position: posString,
            positions: [posString], 
            statusElenco: statusElenco,
            form: link.form,
            
            overall: parseInt(pData.overallrating) || 50,
            potential: parseInt(pData.potential) || 50,
            age: calculateAge(pData.birthdate),
            birthdate: pData.birthdate,
            height: pData.height || 180,
            weight: pData.weight || 75,
            preferredFoot: pData.preferredfoot === '2' ? 'Esquerda' : 'Direita',
            
            attributes: {
                // Principais 6 da Carta (Calculados dinamicamente porque o FIFA não atualiza os campos estáticos)
                pacdiv: pac.toString(),
                shohan: sho.toString(),
                paskic: pas.toString(),
                driref: dri.toString(),
                defspe: def.toString(),
                phypos: phy.toString(),
                
                // Físico
                acceleration: pData.acceleration,
                sprintspeed: pData.sprintspeed,
                agility: pData.agility,
                balance: pData.balance,
                jumping: pData.jumping,
                stamina: pData.stamina,
                strength: pData.strength,
                reactions: pData.reactions,
                // Mental
                aggression: pData.aggression,
                interceptions: pData.interceptions,
                positioning: pData.positioning,
                vision: pData.vision,
                composure: pData.composure,
                defensiveawareness: pData.defensiveawareness,
                // Técnico
                ballcontrol: pData.ballcontrol,
                crossing: pData.crossing,
                curve: pData.curve,
                dribbling: pData.dribbling,
                finishing: pData.finishing,
                freekickaccuracy: pData.freekickaccuracy,
                headingaccuracy: pData.headingaccuracy,
                longpassing: pData.longpassing,
                longshots: pData.longshots,
                penalties: pData.penalties,
                shortpassing: pData.shortpassing,
                shotpower: pData.shotpower,
                slidingtackle: pData.slidingtackle,
                standingtackle: pData.standingtackle,
                volleys: pData.volleys,
                // Goleiro
                gkdiving: pData.gkdiving,
                gkhandling: pData.gkhandling,
                gkkicking: pData.gkkicking,
                gkpositioning: pData.gkpositioning,
                gkreflexes: pData.gkreflexes,
                
                skillmoves: pData.skillmoves,
                weakfoot: pData.weakfootabilitytypecode
            },
            
            contract: {
                wage: parseInt(cData.wage) || 0,
                monthsLeft: parseInt(cData.duration_months) || 0,
                role: cData.playerrole
            }
        });
    }
    
    // 4. Salvar o JSON Final
    const dbOutput = {
        snapshotDate: new Date().toISOString(),
        team: {
            id: FLAMENGO_TEAM_ID,
            name: 'Flamengo'
        },
        roster: finalRoster
    };
    
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dbOutput, null, 2), 'utf-8');
    console.log(`Sucesso! Banco de dados unificado salvo em: ${OUTPUT_FILE}`);
}

function calculateAge(birthdateStr) {
    if (!birthdateStr) return 0;
    const days = parseInt(birthdateStr);
    if (isNaN(days)) return 0;
    // EA FC birthdate is days since 1582
    const yearBorn = 1582 + Math.floor(days / 365.25);
    const currentYear = 2025; // Ano base da temporada atual do EA FC 25
    return currentYear - yearBorn;
}

main().catch(err => {
    console.error('Erro fatal:', err);
});
