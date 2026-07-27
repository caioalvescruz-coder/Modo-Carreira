const fs = require('fs');

let core = fs.readFileSync('assets/js/app-core.js', 'utf8');

// Replace the old toPlayerFromUniversalDB function
const oldFuncRegex = /window\.toPlayerFromUniversalDB = function\(columns\) \{[\s\S]*?\n\};/g;

const newFunc = `window.toPlayerFromUniversalDB = function(data) {
    const nameParts = (data.fullName || data.name || '').split(' ');
    const primeiroNome = nameParts.length > 1 ? nameParts[0] : '';
    const sobrenome = nameParts.length > 1 ? nameParts.slice(1).join(' ') : (data.fullName || data.name);
    
    // Parse values like "€54.5M", "€45K"
    const parseMoney = (valStr) => {
        if (!valStr) return 0;
        let str = valStr.replace(/[^0-9.MK]/g, '');
        let multi = 1;
        if (str.includes('M')) { multi = 1000000; str = str.replace('M',''); }
        if (str.includes('K')) { multi = 1000; str = str.replace('K',''); }
        return parseInt(parseFloat(str) * multi) || 0;
    };

    let ovrBase = parseInt(data.ovr) || 50;
    let potBase = parseInt(data.pot) || ovrBase;

    return {
        id: data.id,
        primeiroNome: primeiroNome,
        sobrenome: sobrenome,
        num: data.kit_number || '99',
        pos: data.position || 'MC',
        status: 'Não Relacionado',
        situacao: 'Observação',
        idade: parseInt(data.age) || 20,
        alt: parseInt(data.height) || 175,
        pe: data.foot || 'Dir.',
        contAnos: 0,
        contMeses: 0,
        multa: parseMoney(data.release_clause),
        valor: parseMoney(data.value),
        salario: parseMoney(data.wage),
        ovr: ovrBase,
        potMax: potBase,
        est: {},
        lesao: null,
        nacionalidade: data.nation || '',
        img: \`https://cdn.sofifa.net/players/\${(data.id || '000000').padStart(6, '0').slice(0,3)}/\${(data.id || '000000').padStart(6, '0').slice(3,6)}/24_120.png\`,
        attr: {
            pac: parseInt(data.pac) || 50,
            sho: parseInt(data.sho) || 50,
            pas: parseInt(data.pas) || 50,
            dri: parseInt(data.dri) || 50,
            def: parseInt(data.def) || 50,
            phy: parseInt(data.phy) || 50
        }
    };
};`;

core = core.replace(oldFuncRegex, newFunc);

// Replace loadDatabase
const oldLoadRegex = /window\.loadDatabase = async function\(\) \{[\s\S]*?window\.databaseLoaded = true;\n    \} catch \(e\) \{/g;
const newLoad = `window.loadDatabase = async function() {
    if (window.databaseLoaded) return;
    const loader = document.querySelector('#banco-loader');
    const grid = document.querySelector('#banco-grid');
    if(loader) loader.style.display = 'block';
    if(grid) grid.innerHTML = '';

    try {
        const response = await fetch('/data/base_sofifa.json');
        if (!response.ok) throw new Error('Falha ao baixar a base de dados (base_sofifa.json). Rode o script de compilação.');
        const dataRows = await response.json();
        
        window.bdJogadores = dataRows.map(window.toPlayerFromUniversalDB);
        window.databaseLoaded = true;
    } catch (e) {`;

core = core.replace(oldLoadRegex, newLoad);

fs.writeFileSync('assets/js/app-core.js', core, 'utf8');
console.log('App-core patched!');
