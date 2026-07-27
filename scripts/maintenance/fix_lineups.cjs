const fs = require('fs');

let tactics = fs.readFileSync('assets/js/app-tactics.js', 'utf8');

const funcsToInject = `
window.salvarLineup = function(nome) {
    if (!confirm('Deseja salvar a escalação atual como "' + nome + '"? Isso sobrescreverá qualquer escalação salva com este nome.')) return;
    const s = getSeason();
    if (!s.lineupsSalvos) s.lineupsSalvos = {};
    s.lineupsSalvos[nome] = JSON.parse(JSON.stringify(s.lineup || {}));
    salvarDados();
    alert('Escalação "' + nome + '" salva com sucesso!');
};

window.carregarLineup = function(nome) {
    const s = getSeason();
    if (!s.lineupsSalvos || !s.lineupsSalvos[nome] || Object.keys(s.lineupsSalvos[nome]).length === 0) {
        alert('Nenhuma escalação salva como "' + nome + '".');
        return;
    }
    if (!confirm('Carregar a escalação "' + nome + '"? A escalação atual no campo será substituída.')) return;
    s.lineup = JSON.parse(JSON.stringify(s.lineupsSalvos[nome]));
    salvarDados();
    renderizar();
};
`;

if (!tactics.includes('window.salvarLineup')) {
    tactics += `\n${funcsToInject}\n`;
    fs.writeFileSync('assets/js/app-tactics.js', tactics, 'utf8');
    console.log("Injected salvarLineup and carregarLineup into app-tactics.js");
} else {
    console.log("Functions already exist.");
}
