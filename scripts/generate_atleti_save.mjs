import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../data/base_sofifa.json');
const outputPath = path.join(__dirname, '../save_teste.json');
const templatePath = path.join(__dirname, '../manager_fc_backup_2026-07-22.json');

console.log('Lendo banco de dados sofifa...');
const db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Filtrar Atlético de Madrid
const atletiPlayers = db.filter(p => p.team === 'Atlético Madrid' || p.team === 'Atlético de Madrid');
console.log(`Encontrados ${atletiPlayers.length} jogadores do Atlético de Madrid.`);

// Helper functions
const parseCurrency = (str) => {
    if (!str) return 0;
    let multiplier = 1;
    if (str.includes('M')) multiplier = 1000000;
    if (str.includes('K')) multiplier = 1000;
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num * multiplier;
};

const parseHeight = (str) => {
    if (!str) return 180;
    const match = str.match(/(\d+)cm/);
    return match ? parseInt(match[1]) : 180;
};

// Map para o formato do app
const mappedPlayers = atletiPlayers.map((p, index) => {
    const parts = p.name ? p.name.split(' ') : ['Desconhecido'];
    const primeiroNome = parts[0];
    const sobrenome = parts.slice(1).join(' ') || '';
    const isTitular = parseInt(p.ovr) > 80;
    
    return {
        id: p.id,
        primeiroNome,
        sobrenome,
        num: p.jersey_number || (index + 1).toString(),
        pos: p.position || 'MC',
        status: isTitular ? 'Titular' : 'Reserva',
        situacao: 'Elenco',
        idade: parseInt(p.age) || 20,
        alt: parseHeight(p.height),
        pe: p.foot || 'Dir.',
        contAnos: 2,
        contMeses: 0,
        multa: parseCurrency(p.release_clause),
        valor: parseCurrency(p.value),
        salario: parseCurrency(p.wage),
        ovr: parseInt(p.ovr), 
        pot: parseInt(p.pot),
        baseOvr: parseInt(p.ovr), 
        basePot: parseInt(p.pot),
        dr: parseInt(p.skill_moves) || 3,
        pr: parseInt(p.weak_foot) || 3,
        s: [
            parseInt(p.pace || p.diving || 70),
            parseInt(p.shooting || p.handling || 70),
            parseInt(p.passing || p.kicking || 70),
            parseInt(p.dribbling || p.reflexes || 70),
            parseInt(p.defending || p.speed || 70),
            parseInt(p.physicality || p.positioning || 70)
        ],
        est: {
            "Gols": 0,
            "Ass": 0,
            "CA": 0,
            "CV": 0,
            "Jogos": 0
        },
        moral: 50, 
        lesao: ''
    };
});

const lineup = {};
const slots = ["GOL", "LE", "ZAG1", "ZAG2", "LD", "MC1", "MC2", "MEI", "PE", "PD", "ATA"];
let sIdx = 0;
mappedPlayers.forEach(p => {
    if (p.status === 'Titular' && sIdx < slots.length) {
        lineup[slots[sIdx]] = p;
        sIdx++;
    }
});

let baseSave;
try {
    baseSave = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
} catch (e) {
    console.error('Falha ao ler o template. Criando um do zero seguro.');
    baseSave = { schemaVersion: 2, indiceAtivo: 0, logNotificacoes: {}, elencos: [] };
}

const novoElenco = {
    nome: "Atlético de Madrid (STRESS TEST)",
    temporadaAtiva: 0,
    historico: [],
    lineup: lineup,
    mercado: [
        { ...mappedPlayers[0], situacao: 'Transferência', valor: 50000000 },
        { ...mappedPlayers[1], situacao: 'Empréstimo', valor: 10000000 }
    ],
    temporadas: [
        {
            nome: "Temporada 1",
            jogadores: mappedPlayers,
            mercado: [
                { ...mappedPlayers[0], situacao: 'Transferência', valor: 50000000 },
                { ...mappedPlayers[1], situacao: 'Empréstimo', valor: 10000000 }
            ],
            lineup: lineup,
            formacao: "4-2-3-1",
            dataAtual: "2026-08-01",
            calendario: [
                {id:1, data:'2026-08-15', adversario:'Real Madrid (F)', rodada:'1', campeonato:'La Liga'}
            ],
            verba: 150000000,
            salario: 1000000,
            inbox: []
        }
    ]
};

// Adiciona o elenco de teste à lista e seleciona ele
baseSave.elencos.push(novoElenco);
baseSave.indiceAtivo = baseSave.elencos.length - 1;

fs.writeFileSync(outputPath, JSON.stringify(baseSave, null, 2));
console.log(`Save gerado com sucesso e injetado no padrão do template em ${outputPath} !`);
