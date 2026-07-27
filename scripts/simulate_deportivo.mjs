import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../data/base_sofifa.json');
const seedPath = path.join(__dirname, '../assets/seed-data.js');

console.log('Lendo banco de dados sofifa...');
const db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const deportivoPlayers = db.filter(p => p.team && p.team.includes('Deportivo de La Coru'));
console.log(`Encontrados ${deportivoPlayers.length} jogadores do Deportivo de La Coruña.`);

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

const mappedPlayers = deportivoPlayers.map((p, index) => {
    const parts = p.name ? p.name.split(' ') : ['Desconhecido'];
    const primeiroNome = parts[0];
    const sobrenome = parts.slice(1).join(' ') || '';
    const isTitular = parseInt(p.ovr) > 70;
    
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

const calendario = [];
let dataJogo = new Date('2025-08-15T12:00:00Z');

for (let i = 1; i <= 42; i++) {
    const gp = Math.floor(Math.random() * 4);
    const gc = Math.floor(Math.random() * 3);
    const mando = Math.random() > 0.5 ? 'C' : 'F';
    
    // Simula gols dos jogadores
    let golsMarcados = 0;
    const relatorioJogadores = [];
    
    mappedPlayers.forEach((p, idx) => {
        let isStarter = idx < 11;
        let played = isStarter || Math.random() > 0.7;
        let gol = 0;
        let ass = 0;
        let cv = 0;
        
        if (played) {
            p.est["Jogos"]++;
            if (golsMarcados < gp && p.pos !== 'GOL' && Math.random() > 0.6) {
                gol++;
                golsMarcados++;
            }
            if (golsMarcados < gp && p.pos !== 'GOL' && Math.random() > 0.7) {
                gol++;
                golsMarcados++;
            }
            if (Math.random() > 0.8 && p.pos !== 'GOL') {
                ass++;
            }
            if (Math.random() > 0.98) {
                cv++;
            }
            
            p.est["Gols"] += gol;
            p.est["Ass"] += ass;
            p.est["CV"] += cv;
            
            relatorioJogadores.push({
                n: p.primeiroNome + ' ' + p.sobrenome,
                g: gol,
                a: ass,
                cv: cv,
                s: !isStarter
            });
        }
    });
    
    calendario.push({
        id: `match_${i}`,
        data: dataJogo.toISOString().split('T')[0],
        mando: mando,
        adversario: `Time Genérico ${i}`,
        campeonato: 'LaLiga 2',
        est: { gp, gc },
        relatorio: {
            f: '4-3-3',
            l: lineup,
            j: relatorioJogadores
        }
    });
    
    dataJogo.setDate(dataJogo.getDate() + 7);
}

// Criar uns jovens da base
const basePlayers = [
    { id: 'b1', primeiroNome: 'Miguel', sobrenome: 'Alonso', pos: 'ATA', status: 'Reserva', situacao: 'Base', idade: 16, alt: 175, pe: 'Dir.', contAnos: 2, contMeses: 0, multa: 1000000, valor: 500000, salario: 500, ovr: 58, pot: 86, baseOvr: 58, basePot: 86, dr: 3, pr: 3, s: [60,60,60,60,60,60], est: { "Gols": 0, "Ass": 0, "CA": 0, "CV": 0, "Jogos": 0 }, moral: 50, lesao: '' },
    { id: 'b2', primeiroNome: 'Juan', sobrenome: 'Pérez', pos: 'ZAG', status: 'Reserva', situacao: 'Base', idade: 17, alt: 188, pe: 'Esq.', contAnos: 1, contMeses: 0, multa: 500000, valor: 250000, salario: 500, ovr: 52, pot: 75, baseOvr: 52, basePot: 75, dr: 2, pr: 2, s: [50,50,50,50,50,50], est: { "Gols": 0, "Ass": 0, "CA": 0, "CV": 0, "Jogos": 0 }, moral: 50, lesao: '' }
];

mappedPlayers.push(...basePlayers);

const saveCaio = {
    nome: 'ELENCO DO CAIO',
    temporadaAtiva: 0,
    historico: [],
    mercado: [],
    temporadas: [
        {
            nome: 'Temporada 1',
            clube: 'Deportivo de La Coruña',
            verba: 15000000,
            salario: 500000,
            dataAtual: '2026-06-01',
            formacao: '4-3-3',
            lineup: lineup,
            jogadores: mappedPlayers,
            calendario: calendario,
            caixa: [],
            logNotificacoes: {
                'msg_1': { lida: true, dt: '2025-08-01', rem: 'Diretoria', tit: 'Bem-vindo ao Deportivo', txt: 'Esperamos o acesso à LaLiga.' },
                'msg_2': { lida: false, dt: '2026-05-30', rem: 'A Diretoria', tit: 'Fim de Temporada', txt: 'A temporada acabou. Por favor, acesse o calendário e clique em "Avançar Temporada" para prosseguir para o próximo ano!' }
            }
        }
    ]
};

const finalExport = {
    schemaVersion: 2,
    indiceAtivo: 0,
    elencos: [ saveCaio ]
};

const outputPath = path.join(__dirname, '../PASTA TESTE/elenco_deportivo_completo.json');
fs.writeFileSync(outputPath, JSON.stringify(finalExport, null, 2), 'utf8');
console.log('Arquivo JSON do Elenco gerado com sucesso em PASTA TESTE/elenco_deportivo_completo.json');
