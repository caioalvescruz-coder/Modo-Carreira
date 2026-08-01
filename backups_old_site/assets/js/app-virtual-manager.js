/**
 * Virtual Manager 4.0 - Inteligência Artificial para Modo Carreira
 * Arquitetura de Scanners Profundos, Catálogo Massivo de Cenários e Variações Dinâmicas.
 */

window.VirtualManager = (function() {
    
    // Core Engine
    const Core = {
        // Função principal que recebe um gatilho (trigger), analisa o contexto, sorteia a variação e despacha
        triggerEvent: function(eventName, contextData = {}) {
            if (!MessageCatalog[eventName]) {
                console.warn(`[VirtualManager] Evento não catalogado: ${eventName}`);
                return;
            }

            const scenarioGroup = MessageCatalog[eventName];
            
            // Avalia qual cenário exato se aplica baseado nas condições (se houver array de cenários)
            let selectedScenario = null;
            if (Array.isArray(scenarioGroup)) {
                selectedScenario = scenarioGroup.find(scenario => {
                    if (typeof scenario.condition === 'function') {
                        return scenario.condition(contextData);
                    }
                    return true; // Fallback
                });
            } else {
                selectedScenario = scenarioGroup;
            }

            if (!selectedScenario) return; // Nenhuma condição bateu

            // Sorteia uma variação
            const variations = selectedScenario.variations || [selectedScenario];
            const chosenVariation = variations[Math.floor(Math.random() * variations.length)];

            // Interpolação de variáveis no texto
            const parseTemplate = (str) => {
                if (!str) return '';
                return str.replace(/\{([^}]+)\}/g, (match, key) => {
                    const keys = key.split('.');
                    let val = contextData;
                    for (let k of keys) {
                        if (val === undefined || val === null) break;
                        val = val[k];
                    }
                    return val !== undefined ? val : match;
                });
            };

            const sender = chosenVariation.sender || window.InboxEngine?.Senders?.BOARD || { name: 'Sistema', icon: '⚙️' };
            const subject = parseTemplate(chosenVariation.subject);
            const body = parseTemplate(chosenVariation.body);
            const folder = chosenVariation.folder || 'entrada';
            const actions = chosenVariation.actions || [];

            // Dispara para o InboxEngine
            if (window.InboxEngine) {
                InboxEngine.dispatch(sender, subject, body, folder, actions);
            }
        },

        // Função utilitária para rodar todos os scanners periódicos
        runPeriodicScanners: function() {
            Scanners.squadDepth();
            Scanners.financesAndContracts();
            Scanners.youthAcademy();
        }
    };

    // Scanners Profundos (Deep Scanners)
    const Scanners = {
        squadDepth: function() {
            const s = typeof getSeason === 'function' ? getSeason() : null;
            if (!s || !s.jogadores) return {};

            const elenco = s.jogadores.filter(j => j.situacao === 'Elenco' || j.situacao === 'Emprest. - IN');
            
            const countPos = (posArray) => elenco.filter(j => {
                if (posArray.includes(j.pos)) return true;
                if (j.positions && j.positions.some(p => posArray.includes(p))) return true;
                return false;
            }).length;

            const depth = {
                GOL: countPos(['GOL', 'GL']),
                ZAG: countPos(['ZAG']),
                LD: countPos(['LD', 'ADD']),
                LE: countPos(['LE', 'ADE']),
                MEIO: countPos(['VOL', 'MC', 'MEI', 'MD', 'ME']),
                ATAQUE: countPos(['SA', 'ATA', 'PE', 'PD', 'PTD', 'PTE'])
            };

            const issues = [];
            if (depth.GOL < 3) issues.push({ type: 'DEFICIT', pos: 'Goleiro', count: depth.GOL, ideal: 3 });
            if (depth.GOL > 4) issues.push({ type: 'SURPLUS', pos: 'Goleiro', count: depth.GOL, ideal: 3 });
            
            if (depth.LD < 2) issues.push({ type: 'DEFICIT', pos: 'Lateral Direito', count: depth.LD, ideal: 2 });
            if (depth.LE < 2) issues.push({ type: 'DEFICIT', pos: 'Lateral Esquerdo', count: depth.LE, ideal: 2 });
            if (depth.ZAG < 4) issues.push({ type: 'DEFICIT', pos: 'Zagueiro', count: depth.ZAG, ideal: 4 });
            
            if (depth.MEIO < 5) issues.push({ type: 'DEFICIT', pos: 'Meio-Campo', count: depth.MEIO, ideal: 6 });
            if (depth.MEIO > 9) issues.push({ type: 'SURPLUS', pos: 'Meio-Campo', count: depth.MEIO, ideal: 7 });
            
            if (depth.ATAQUE < 4) issues.push({ type: 'DEFICIT', pos: 'Atacante', count: depth.ATAQUE, ideal: 5 });
            if (depth.ATAQUE > 7) issues.push({ type: 'SURPLUS', pos: 'Atacante', count: depth.ATAQUE, ideal: 5 });

            return { depth, issues };
        },

        financesAndContracts: function() {
            const s = typeof getSeason === 'function' ? getSeason() : null;
            if (!s || !s.jogadores) return {};

            const contractsEnding = s.jogadores.filter(j => j.empMeses === 6 || j.empMeses === 1);
            const loansEnding = s.jogadores.filter(j => j.situacao.includes('Emprest.') && j.empMeses <= 1);
            const budget = s.orcamento || 0;

            return { contractsEnding, loansEnding, budget };
        },

        youthAcademy: function() {
            const s = typeof getSeason === 'function' ? getSeason() : null;
            if (!s || !s.jogadores) return {};

            const base = s.jogadores.filter(j => j.situacao === 'Base');
            const analysis = base.map(j => {
                const potArr = (j.potencial || '0-0').split('-').map(Number);
                const minPot = potArr[0] || 0;
                const maxPot = potArr[1] || 0;
                const gap = maxPot - minPot;
                const ovr = parseInt(j.ovr) || 0;
                
                let status = 'NORMAL';
                if (gap <= 6 && minPot >= 85) status = 'CRAQUE_PRONTO';
                else if (gap > 15) status = 'INCERTO';
                else if (j.idade >= 18 && minPot < 75) status = 'ESTAGNADO';
                else if (ovr < 55 && maxPot > 88) status = 'FALSO_PROMISSOR';

                return { player: j, minPot, maxPot, gap, status };
            });

            return analysis;
        },

        preMatch: function(matchId) {
            const s = typeof getSeason === 'function' ? getSeason() : null;
            if (!s || !s.calendario) return null;
            const match = s.calendario.find(m => String(m.id) === String(matchId));
            if (!match) return null;

            // Simples avaliação baseada no Depth
            const squadStatus = this.squadDepth();
            return { match, squadStatus };
        },

        postMatch: function(stats) {
            // stats = { gp, gc, mando, adversario, jogadores: [...] }
            let status = 'NORMAL';
            if (stats.gp - stats.gc >= 3) status = 'GOLEADA_FEITA';
            else if (stats.gc - stats.gp >= 3) status = 'GOLEADA_SOFRIDA';
            else if (stats.gp < stats.gc && stats.mando === 'C') status = 'DERROTA_CASA';
            else if (stats.gp > stats.gc && stats.mando === 'F') status = 'VITORIA_FORA';
            else if (stats.gp === stats.gc) status = 'EMPATE';
            else if (stats.gp > stats.gc) status = 'VITORIA_MAGRA';
            else status = 'DERROTA_MAGRA';

            const cleanSheet = stats.gc === 0;
            const scorers = stats.jogadores.filter(j => j.gol > 0);
            const assisters = stats.jogadores.filter(j => j.ass > 0);
            const reds = stats.jogadores.filter(j => j.cv > 0);
            const injuries = stats.jogadores.filter(j => j.lesao);

            return { status, cleanSheet, scorers, assisters, reds, injuries };
        }
    };

    return {
        Core,
        Scanners
    };
})();

// Dicionário Massivo de Mensagens
window.MessageCatalog = {
    // ---------------------------------------------------------
    // CATEGORIA: EVENTOS ESPECÍFICOS (CARTÃO VERMELHO, ETC)
    // ---------------------------------------------------------
    PLAYER_SUSPENDED: [
        {
            condition: () => true,
            variations: [
                {
                    sender: { name: 'Comitê Disciplinar', icon: '⚖️' },
                    subject: 'Suspensão Confirmada: {player.primeiroNome} {player.sobrenome}',
                    body: '<p>Informamos que o jogador <b>{player.primeiroNome} {player.sobrenome}</b> foi punido com cartão vermelho direto na última partida. Ele cumprirá suspensão automática no próximo compromisso pela competição <b>{match.campeonato}</b>.</p>'
                },
                {
                    sender: { name: 'Assistente Técnico', icon: '👨‍🏫' },
                    subject: 'Cartão Vermelho: Desfalque Importante',
                    body: '<p>Chefe, a expulsão do {player.sobrenome} vai nos custar caro. Precisamos pensar num substituto imediato para o próximo jogo da {match.campeonato}.</p>'
                }
            ]
        }
    ],

    // ---------------------------------------------------------
    // CATEGORIA: TÁTICAS E PRÉ-JOGO (PRE_MATCH)
    // ---------------------------------------------------------
    PRE_MATCH_ANALYSIS: [
        {
            condition: (ctx) => ctx.importance === 'CRITICAL_DERBY',
            variations: [
                {
                    sender: { name: 'Assistente Técnico', icon: '👨‍🏫' },
                    subject: 'PRELEÇÃO: Clássico à vista!',
                    body: '<p>Chefe, o jogo de amanhã contra o <b>{opponent}</b> é um clássico! A torcida exige vitória. Sugiro força máxima: {suggestedXI}.</p>'
                },
                {
                    sender: { name: 'A Diretoria', icon: '🏢' },
                    subject: 'Derby: Tolerância Zero',
                    body: '<p>Lembramos que o jogo contra o {opponent} não é um jogo qualquer. Uma vitória amanhã é fundamental para a manutenção da paz no clube.</p>'
                }
            ]
        },
        {
            condition: (ctx) => ctx.fatigueLevel === 'HIGH' && ctx.importance !== 'CRITICAL_DERBY',
            variations: [
                {
                    sender: { name: 'Fisiologista', icon: '🩺' },
                    subject: 'Alerta de Desgaste Físico',
                    body: '<p>A equipe titular está no limite. Sugiro rodar o elenco contra o {opponent} amanhã para evitar lesões musculares graves.</p>'
                },
                {
                    sender: { name: 'Assistente Técnico', icon: '👨‍🏫' },
                    subject: 'Sugestão de Rotação',
                    body: '<p>Temos jogadores exaustos. Contra o {opponent}, deveríamos usar uma escalação alternativa. O que acha?</p>'
                }
            ]
        },
        {
            condition: (ctx) => ctx.squadStatus && ctx.squadStatus.depth.ZAG < 4,
            variations: [
                {
                    sender: { name: 'Assistente Técnico', icon: '👨‍🏫' },
                    subject: 'Problemas na Defesa para amanhã',
                    body: '<p>Vamos enfrentar o {opponent} amanhã, mas estamos com poucos zagueiros de ofício disponíveis. Talvez precisemos improvisar um volante na zaga.</p>'
                },
                {
                    sender: { name: 'Assistente Técnico', icon: '👨‍🏫' },
                    subject: 'Atenção ao sistema defensivo',
                    body: '<p>Nosso número de defensores está crítico (menos de 4 opções viáveis). Contra o {opponent}, jogue com a linha baixa para não expor os improvisados.</p>'
                }
            ]
        },
        {
            condition: (ctx) => ctx.streak === 'WINNING_3+',
            variations: [
                {
                    sender: { name: 'Assessoria de Imprensa', icon: '📰' },
                    subject: 'Embalados para o jogo de amanhã',
                    body: '<p>A imprensa esportiva nos coloca como favoritos absolutos contra o {opponent} após as últimas vitórias. Não podemos decepcionar.</p>'
                },
                {
                    sender: { name: 'A Diretoria', icon: '🏢' },
                    subject: 'Manter a pegada',
                    body: '<p>Estamos felizes com a sequência de vitórias. Queremos mais 3 pontos contra o {opponent} amanhã. Mantenha o time base.</p>'
                }
            ]
        },
        {
            condition: (ctx) => ctx.streak === 'LOSING_3+',
            variations: [
                {
                    sender: { name: 'A Diretoria', icon: '🏢' },
                    subject: 'Aviso: Precisamos vencer amanhã',
                    body: '<p>A sequência atual é inaceitável. O jogo contra o {opponent} amanhã virou uma final para o seu cargo. Exigimos uma mudança de postura.</p>'
                },
                {
                    sender: { name: 'Assistente Técnico', icon: '👨‍🏫' },
                    subject: 'Precisamos de um choque de realidade',
                    body: '<p>Chefe, os jogadores estão sem confiança. Talvez devêssemos mudar o esquema tático para enfrentar o {opponent} amanhã.</p>'
                }
            ]
        },
        // Fallback genérico para pré-jogo
        {
            condition: () => true,
            variations: [
                {
                    sender: { name: 'Assistente Técnico', icon: '👨‍🏫' },
                    subject: 'Análise: Jogo de Amanhã',
                    body: '<p>Amanhã enfrentaremos o <b>{opponent}</b> pela {competition}. Sugestão de time titular: {suggestedXI}. Vamos focar em manter a posse de bola.</p>'
                },
                {
                    sender: { name: 'Assistente Técnico', icon: '👨‍🏫' },
                    subject: 'Preparativos Finais',
                    body: '<p>Tudo pronto para o confronto contra o {opponent}. Aqui está a formação sugerida com base nos últimos treinos: {suggestedXI}.</p>'
                }
            ]
        }
    ],

    // ---------------------------------------------------------
    // CATEGORIA: FIM DE MÊS E CONTRATOS (FINANCES_AND_CONTRACTS)
    // ---------------------------------------------------------
    FINANCES_AND_CONTRACTS: [
        {
            condition: (ctx) => ctx.isLoanIN && ctx.performance === 'EXCELLENT',
            variations: [
                {
                    sender: { name: 'Diretor de Futebol', icon: '👔' },
                    subject: 'Opção de Compra: {player.primeiroNome} {player.sobrenome}',
                    body: '<p>O empréstimo do <b>{player.sobrenome}</b> está chegando ao fim. Ele vem sendo peça fundamental (Gols/Assistências acima da média). Sugiro fortemente que exerçamos a opção de compra antes que o clube de origem o peça de volta!</p>'
                },
                {
                    sender: { name: 'Assistente Técnico', icon: '👨‍🏫' },
                    subject: 'Temos que segurar o {player.sobrenome}!',
                    body: '<p>Chefe, o período de empréstimo dele está acabando, e ele foi titular absoluto nesta temporada. Por favor, fale com a diretoria para comprarmos ele em definitivo.</p>'
                }
            ]
        },
        {
            condition: (ctx) => ctx.isLoanIN && ctx.performance === 'POOR',
            variations: [
                {
                    sender: { name: 'Diretor de Futebol', icon: '👔' },
                    subject: 'Fim de Empréstimo: {player.sobrenome}',
                    body: '<p>O contrato de empréstimo do <b>{player.sobrenome}</b> está terminando. Dado o baixo impacto dele no time, já informei ao clube de origem que ele retornará ao final do mês.</p>'
                },
                {
                    sender: { name: 'Auxiliar Técnico', icon: '📋' },
                    subject: 'Devolução de Jogador',
                    body: '<p>O {player.sobrenome} infelizmente não rendeu o esperado. O empréstimo acaba logo, creio que podemos deixá-lo voltar e usar o orçamento em alguém melhor.</p>'
                }
            ]
        },
        {
            condition: (ctx) => ctx.isMainSquad && ctx.contractEnding && ctx.ovr >= 80,
            variations: [
                {
                    sender: { name: 'Diretor de Futebol', icon: '👔' },
                    subject: 'URGENTE: Renovação de {player.sobrenome}',
                    body: '<p>O contrato do <b>{player.sobrenome}</b> está expirando! Ele é um dos melhores do elenco (OVR {player.ovr}). Se não renovarmos agora, ele poderá assinar um pré-contrato e sair de graça.</p>'
                },
                {
                    sender: { name: 'Empresário', icon: '💼' },
                    subject: 'Interesse de outros clubes',
                    body: '<p>Olá. Meu cliente, {player.sobrenome}, tem apenas alguns meses de contrato. Já recebemos sondagens. Vocês pretendem fazer uma oferta de renovação ou ele está livre para negociar?</p>'
                }
            ]
        },
        {
            condition: (ctx) => ctx.isMainSquad && ctx.contractEnding && ctx.ovr < 65,
            variations: [
                {
                    sender: { name: 'Diretor de Futebol', icon: '👔' },
                    subject: 'Dispensa: {player.sobrenome}',
                    body: '<p>O contrato do <b>{player.sobrenome}</b> está no fim. Avaliando o OVR baixo dele, sugiro deixarmos o contrato expirar para aliviar a folha salarial.</p>'
                },
                {
                    sender: { name: 'Auxiliar Técnico', icon: '📋' },
                    subject: 'Fim de ciclo',
                    body: '<p>Creio que não vale a pena renovar com o {player.sobrenome}. O contrato dele acaba agora, é a chance de abrir espaço no elenco.</p>'
                }
            ]
        },
        {
            condition: (ctx) => ctx.isMonthEnd === true,
            variations: [
                {
                    sender: { name: 'Diretor Financeiro', icon: '📊' },
                    subject: 'Balanço Mensal: Atualização Necessária',
                    body: '<p>Chegamos ao fim de mais um mês! Por favor, lembre-se de <b>atualizar as verbas, overalls e atributos no site</b> com base no seu save no PS5 para que possamos continuar auxiliando de forma precisa.</p>'
                },
                {
                    sender: { name: 'Sistema', icon: '⚙️' },
                    subject: 'Lembrete de Atualização Manual',
                    body: '<p>Fim de mês detectado. Não esqueça de sincronizar os dados do seu PS5 (Evolução de Overalls, Verbas de Transferência e Vendas) com o Virtual Manager para manter os relatórios em dia.</p>'
                }
            ]
        }
    ],

    // ---------------------------------------------------------
    // CATEGORIA: PÓS-JOGO E IMPRENSA (POST_MATCH)
    // ---------------------------------------------------------
    POST_MATCH: [
        {
            condition: (ctx) => ctx.status === 'GOLEADA_FEITA',
            variations: [
                {
                    sender: { name: 'A Diretoria', icon: '🏢' },
                    subject: 'Parabéns pelo excelente resultado',
                    body: '<p>Estamos todos impressionados com a goleada por <b>{stats.gp}x{stats.gc}</b> contra o {stats.adversario}. O futebol apresentado hoje foi espetacular! Continue com o ótimo trabalho.</p>'
                },
                {
                    sender: { name: 'Assessoria de Imprensa', icon: '📰' },
                    subject: 'Repercussão da Goleada',
                    body: '<p>A mídia só fala da nossa vitória avassaladora de ontem. O clima entre os torcedores é de euforia. Um verdadeiro show!</p>'
                }
            ]
        },
        {
            condition: (ctx) => ctx.status === 'GOLEADA_SOFRIDA',
            variations: [
                {
                    sender: { name: 'A Diretoria', icon: '🏢' },
                    subject: 'Inaceitável: Explicações exigidas',
                    body: '<p>A humilhação sofrida para o {stats.adversario} ({stats.gp}x{stats.gc}) é inadmissível para os padrões deste clube. Exigimos uma resposta imediata na próxima rodada.</p>'
                },
                {
                    sender: { name: 'Comissão Técnica', icon: '👨‍🏫' },
                    subject: 'Precisamos de mudanças urgentes',
                    body: '<p>Chefe, o time sofreu um apagão generalizado ontem. Essa goleada abalou muito a confiança do elenco. Talvez devêssemos fazer um treino fechado.</p>'
                }
            ]
        },
        {
            condition: (ctx) => ctx.status === 'DERROTA_CASA',
            variations: [
                {
                    sender: { name: 'A Diretoria', icon: '🏢' },
                    subject: 'Derrota em Casa',
                    body: '<p>Nossa casa tem que ser uma fortaleza. Perder diante da nossa torcida por {stats.gp}x{stats.gc} contra o {stats.adversario} mancha a campanha.</p>'
                }
            ]
        },
        {
            condition: (ctx) => ctx.status === 'VITORIA_FORA',
            variations: [
                {
                    sender: { name: 'Comissão Técnica', icon: '👨‍🏫' },
                    subject: 'Grande vitória fora de casa!',
                    body: '<p>Excelente demonstração de força mental para superar o {stats.adversario} longe dos nossos domínios. Uma vitória muito tática.</p>'
                }
            ]
        },
        {
            condition: () => true, // Fallback genérico pós jogo
            variations: [
                {
                    sender: { name: 'Assessoria de Imprensa', icon: '📰' },
                    subject: 'Análise da Partida',
                    body: '<p>A imprensa destacou o placar de {stats.gp}x{stats.gc} contra o {stats.adversario}. Já estamos preparando a entrevista coletiva pós-jogo.</p>'
                }
            ]
        }
    ],

    // ---------------------------------------------------------
    // CATEGORIA: DESENVOLVIMENTO E BASE (YOUTH_ACADEMY)
    // ---------------------------------------------------------
    YOUTH_ACADEMY: [
        {
            condition: (ctx) => ctx.status === 'CRAQUE_PRONTO',
            variations: [
                {
                    sender: { name: 'Diretor da Base', icon: '⚽' },
                    subject: 'Jóia da Base: {player.primeiroNome} {player.sobrenome}',
                    body: '<p>Chefe, o jovem <b>{player.sobrenome}</b> (OVR {player.ovr}, POT {minPot}-{maxPot}) está pronto para a equipe principal! Sugiro dar alguns minutos a ele em jogos menos decisivos para ele ganhar ritmo profissional.</p>'
                },
                {
                    sender: { name: 'Auxiliar Técnico', icon: '📋' },
                    subject: 'Promoção de Talento',
                    body: '<p>Temos uma promessa muito valiosa na nossa academia. O {player.sobrenome} atingiu um teto altíssimo de desenvolvimento e o potencial dele já é muito claro. Precisamos aproveitá-lo logo!</p>'
                }
            ]
        },
        {
            condition: (ctx) => ctx.status === 'FALSO_PROMISSOR',
            variations: [
                {
                    sender: { name: 'Diretor da Base', icon: '⚽' },
                    subject: 'Avaliação de Potencial: {player.sobrenome}',
                    body: '<p>A comissão das categorias de base reavaliou o {player.sobrenome}. Apesar de um limite potencial interessante ({maxPot}), o OVR dele atual ({player.ovr}) está muito baixo para competir no nosso nível. Considere liberá-lo no futuro.</p>'
                }
            ]
        },
        {
            condition: (ctx) => ctx.status === 'ESTAGNADO',
            variations: [
                {
                    sender: { name: 'Preparador Físico', icon: '🏃‍♂️' },
                    subject: 'Evolução Estagnada na Base',
                    body: '<p>O desenvolvimento físico e técnico de <b>{player.sobrenome}</b> parece ter parado. Ele já passou da idade ideal para estourar. Talvez seja hora de negociá-lo ou liberá-lo do clube.</p>'
                }
            ]
        },
        {
            condition: (ctx) => ctx.status === 'INCERTO',
            variations: [
                {
                    sender: { name: 'Olheiro Chefe', icon: '🕵️' },
                    subject: 'Relatório Mensal: Observando {player.sobrenome}',
                    body: '<p>Ainda não conseguimos determinar com precisão o teto do <b>{player.sobrenome}</b> (Potencial entre {minPot}-{maxPot}). Precisamos mantê-lo na base por mais alguns meses até a margem diminuir.</p>'
                }
            ]
        },
        {
            condition: () => true, // Fallback
            variations: [
                {
                    sender: { name: 'Diretor da Base', icon: '⚽' },
                    subject: 'Relatório Mensal da Base',
                    body: '<p>Informo que as atividades da academia seguem de acordo com o plano. Continue acompanhando a evolução dos potenciais ({minPot}-{maxPot}) de perto.</p>'
                }
            ]
        }
    ]
};
