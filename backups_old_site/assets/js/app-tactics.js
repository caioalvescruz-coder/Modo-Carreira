function renderizarTaticas() {
  const s = getSeason(),
    o = ['GOL', 'LE', 'ZAG', 'LD', 'VOL', 'ME', 'MC', 'MEI', 'MD', 'PE', 'ATA', 'PD'],
    sts = [
      {
        k: 'Titular',
        l: 'TIT',
      },
      {
        k: 'Reserva',
        l: 'RES',
      },
      {
        k: 'Não Relacionado',
        l: 'N/R',
      },
    ];
  const cF = window.formacoesTaticas[s.formacao || '4-3-3'];

  // Normalizar lineup para usar referências dinâmicas
  const l = {};
  if (s.lineup && Array.isArray(s.lineup)) {
    s.lineup = Object.assign({}, s.lineup);
  }
  if (s.lineup) {
    for (let k in s.lineup) {
      let j = s.lineup[k];
      if (!j) continue;
      let ref;
      if (typeof j === 'string' || typeof j === 'number') {
        ref = s.jogadores.find(
          (p) =>
            p.id == j ||
            (p.primeiroNome || '') + (p.sobrenome || '') == j ||
            (p.primeiroNome || '') + (p.sobrenome || '') == String(j).replace('undefined', ''),
        );
      } else {
        ref = s.jogadores.find(
          (p) =>
            p.id == j.id ||
            ((p.primeiroNome || '') === (j.primeiroNome || '') &&
              (p.sobrenome || '') === (j.sobrenome || '')),
        );
        if (ref) s.lineup[k] = ref.id || (ref.primeiroNome || '') + (ref.sobrenome || '');
      }
      if (ref) l[k] = ref;
      else delete s.lineup[k];
    }
  }

  const nT = Object.keys(l).length;
  const btnReg = `<button onclick="abrirRelatorioPartida()" style="background:${nT === 11 ? '#10b981' : '#475569'};color:#fff;border:none;padding:5px 12px;border-radius:5px;cursor:${nT === 11 ? 'pointer' : 'not-allowed'};font-weight:900;margin-left:15px;box-shadow:0 4px 6px rgba(0,0,0,0.3)" ${nT !== 11 ? 'disabled title="Escale exatamente 11 jogadores"' : ''}>💾 Registrar Partida</button>`;
  let inP = Object.values(l).map((j) => j.primeiroNome + j.sobrenome);
  let sq = s.jogadores.filter(
    (j) =>
      j.situacao !== 'Base' &&
      j.situacao !== 'Emprest. - OUT' &&
      (!filtros.pos.length || filtros.pos.includes(j.pos)) &&
      (!filtros.status.length || filtros.status.includes(j.status)) &&
      !inP.includes(j.primeiroNome + j.sobrenome),
  );
  sq.sort((a, b) => {
    let vA =
        sortTaticasField === 'pos'
          ? o.indexOf(a.pos)
          : sortTaticasField === 'sobrenome'
            ? (a.sobrenome || '').toLowerCase()
            : a[sortTaticasField],
      vB =
        sortTaticasField === 'pos'
          ? o.indexOf(b.pos)
          : sortTaticasField === 'sobrenome'
            ? (b.sobrenome || '').toLowerCase()
            : b[sortTaticasField];
    return vA < vB
      ? sortTaticasDir === 'asc'
        ? -1
        : 1
      : vA > vB
        ? sortTaticasDir === 'asc'
          ? 1
          : -1
        : 0;
  });
  const nextM = s.calendario ? s.calendario.find(e => !e.relatorio) : null;
  const checkSusp = (j) => {
      if (j.suspenso === true && !j.suspensao) return true;
      if (j.suspensao && nextM && j.suspensao === nextM.campeonato) return true;
      return false;
  };
  const lH = sq
    .map((j) => {
      let isSusp = checkSusp(j);
      let selSt = `<select onchange="getSeason().jogadores[${s.jogadores.indexOf(j)}].status=this.value;salvarDados();renderizar()" style="background:transparent;color:inherit;border:1px solid #334155;border-radius:4px;cursor:pointer;font-size:0.85em;padding:2px;"><option value="Titular" ${j.status === 'Titular' ? 'selected' : ''}>TIT</option><option value="Reserva" ${j.status === 'Reserva' ? 'selected' : ''}>RES</option><option value="Não Relacionado" ${j.status === 'Não Relacionado' ? 'selected' : ''}>N/R</option></select>`;
      const posClass = j.pos === 'GOL' ? 'c-gol' : ['ZAG', 'LE', 'LD', 'CB', 'LB', 'RB', 'ADE', 'ADD'].includes(j.pos) ? 'c-def' : ['VOL', 'MC', 'MEI', 'MD', 'ME', 'CDM', 'CM', 'CAM', 'RM', 'LM'].includes(j.pos) ? 'c-mid' : 'c-atk';
      const nameHtml = `<div>${j.primeiroNome ? `<span style="font-size:0.85em;color:#cbd5e1;">${j.primeiroNome}</span> ` : ''}<span style="font-weight:900;color:#fbbf24;">${j.sobrenome}</span> ${isSusp ? '🟥' : ''}</div>`;
      return `<div class="taticas-list-item" ${isSusp ? 'style="border:1px solid #ef4444;background:#2d0000;"' : ''} draggable="${!isSusp}" ondragstart="${!isSusp ? `dragT(event,'L',${s.jogadores.indexOf(j)})` : 'return false'}"><div><div class="pos-stat-box ${posClass}" style="font-size:.75em;padding:2px 4px;border-radius:4px;display:inline-block;text-align:center;width:34px;">${j.pos}</div></div>${nameHtml}<div>${j.idade}</div><div><div class="stat-box ${getBg(j.ovr)}" style="padding:2px 4px;border-radius:3px;">${j.ovr}</div></div><div><div class="stat-box ${getBg(j.pot)}" style="padding:2px 4px;border-radius:3px;">${j.pot}</div></div><div>${selSt}</div></div>`;
    })
    .join('');
  let sOVR = {
    DEF: {
      s: 0,
      c: 0,
    },
    MEI: {
      s: 0,
      c: 0,
    },
    ATA: {
      s: 0,
      c: 0,
    },
  };
  const mH = Object.keys(cF.slots)
    .map((k) => {
      if (l[k]) {
        let sg = ['GOL', 'ZAG', 'LE', 'LD'].includes(l[k].pos)
          ? 'DEF'
          : ['VOL', 'MC', 'MEI', 'ME', 'MD'].includes(l[k].pos)
            ? 'MEI'
            : 'ATA';
        sOVR[sg].s += l[k].ovr;
        sOVR[sg].c++;
        let isSusp = checkSusp(l[k]);
        let cAdp = isSusp ? '#ef4444' : getAdp(l[k].pos, k),
          idJ = l[k].primeiroNome + l[k].sobrenome,
          isCap = s.capitao === idJ;
        return `<div class="pos-marker occupied" style="${cF.slots[k]};filter: drop-shadow(0 0 4px ${cAdp});${window.selCap ? 'cursor:crosshair;' : ''}" draggable="true" ondragstart="dragT(event,'P','${k}')" ondrop="dropT(event,'${k}')" ondragover="allowDrop(event)" onclick="if(window.selCap){getSeason().capitao='${idJ}';window.selCap=!1;salvarDados();renderizar();}">
                    <div class="jersey-bg">
                        <div class="name">${l[k].primeiroNome ? l[k].primeiroNome[0] + '. ' : ''}${l[k].sobrenome}</div>
                        <div class="ovr">${l[k].ovr}</div>
                        <div class="pos">${l[k].pos}</div>
                    </div>
                    ${!window.selCap ? `<div title="Remover do campo" onclick="event.stopPropagation(); removerDoCampo('${k}')" class="btn-remove-player">✖</div>` : ''}
                    ${isSusp ? '<div class="camisa-suspenso" title="Suspenso">🟥</div>' : ''}
                    ${isCap ? '<div class="camisa-capitao" title="Capitão">C</div>' : ''}
                    </div>`;
      }
      return `<div class="pos-marker" style="${cF.slots[k]}" ondrop="dropT(event,'${k}')" ondragover="allowDrop(event)">${k.replace(/\d/g, '')}</div>`;
    })
    .join('');
  const sB = `<div class="taticas-sector-bars"><span>⚔️ ATA: ${sOVR.ATA.c ? Math.round(sOVR.ATA.s / sOVR.ATA.c) : 0}</span><span>🧭 MEI: ${sOVR.MEI.c ? Math.round(sOVR.MEI.s / sOVR.MEI.c) : 0}</span><span>🛡️ DEF: ${sOVR.DEF.c ? Math.round(sOVR.DEF.s / sOVR.DEF.c) : 0}</span></div>`;
  const sideF =
    o
      .map(
        (p) =>
          `<button class="filtro-btn ${filtros.pos.includes(p) ? 'ativo' : ''}" onclick="toggleFiltro('pos','${p}')">${p}</button>`,
      )
      .join('') +
    `<div style="border-top:1px solid #2d3748;margin:5px 0;width:100%"></div>` +
    sts
      .map(
        (st) =>
          `<button class="filtro-btn ${filtros.status.includes(st.k) ? 'ativo' : ''}" onclick="toggleFiltro('status','${st.k}')">${st.l}</button>`,
      )
      .join('') +
    `<div style="border-top:1px solid #2d3748;margin:5px 0;width:100%"></div><button class="filtro-btn ${window.selCap ? 'ativo' : ''}" onclick="window.selCap=!window.selCap;renderizar()" title="Escolher Capitão">Capitão</button>${window.selCap ? '<div style="font-size:0.75em;color:#fbbf24;text-align:center;margin-top:5px;font-weight:bold;line-height:1.2;">👑 Clique em um<br>jogador no campo.</div>' : ''}`;
  return `<div style="width:100%;max-width:1200px;margin:0 auto;"><div style="display:flex;justify-content:center;gap:15px;margin-bottom:15px;background:#151d2e;padding:10px;border-radius:10px;border:1px solid #2d3748;"><div style="display:flex;align-items:center;gap:10px;"><label style="color:#fbbf24;font-weight:700;font-size:.9em;">Formação:</label><select onchange="mudarFormacao(this.value)" style="padding:5px;border-radius:5px;background:#0f172a;color:#fff;border:1px solid #334155;font-size:.9em;">${Object.keys(
    window.formacoesTaticas,
  )
    .map(
      (f) =>
        `<option value="${f}" ${(s.formacao || '4-3-3') === f ? 'selected' : ''}>${f}</option>`,
    )
    .join(
      '',
    )}</select></div><div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;">${[
    'Titular',
    'Secundário',
    'Reserva',
    'Promissores',
    'Outro',
  ]
    .map((o, i) => {
      let colors = ['#15803d', '#0284c7', '#9333ea', '#ea580c', '#475569'];
      return `<div style="display:flex;border-radius:5px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.3)">
        <button onclick="carregarLineup('${o}')" style="background:${colors[i]};color:white;border:none;padding:6px 12px;font-weight:bold;cursor:pointer;font-size:0.85em;transition:opacity 0.2s" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1" title="Carregar ${o}">${o}</button>
        <button onclick="salvarLineup('${o}')" style="background:${colors[i]};color:white;border:none;border-left:1px solid rgba(255,255,255,0.2);padding:6px 8px;cursor:pointer;font-size:0.85em;transition:filter 0.2s" onmouseover="this.style.filter='brightness(0.8)'" onmouseout="this.style.filter='none'" title="Salvar escalação atual como ${o}">💾</button>
    </div>`;
    })
    .join(
      '',
    )}${btnReg}</div></div><div class="taticas-wrapper" style="padding:0;"><div class="taticas-filter-sidebar">${sideF}</div><div><div class="pitch-container"><div class="pitch-line" style="top:50%;left:0;width:100%;"></div><div class="center-circle"></div>${mH}</div>${sB}</div><div class="taticas-list"><div class="taticas-list-header"><div onclick="sortTaticas('pos')">Pos</div><div onclick="sortTaticas('sobrenome')">Jogador</div><div onclick="sortTaticas('idade')">Id</div><div onclick="sortTaticas('ovr')">OVR</div><div onclick="sortTaticas('pot')">POT</div><div onclick="sortTaticas('status')">ST</div></div>${lH || '<div style="grid-column:1/-1;text-align:center;padding:20px;color:#94a3b8">Nenhum jogador livre para a busca.</div>'}</div></div></div>`;
}

const alternarVisualizacao = () => {
  consolidarEdicoes();
  modoTabela = !modoTabela;
  $('#btn-toggle-view').innerText = modoTabela ? '🪟' : '📄';
  renderizar();
};
const ordenarPelaTabela = (c) => {
  consolidarEdicoes();
  sortDir = $('#sort-select').value === c ? (sortDir === 'desc' ? 'asc' : 'desc') : 'desc';
  $('#sort-select').value = c;
  renderizar(true);
};
const exportarJSON = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(appData, null, 2)], {
      type: 'application/json',
    }),
  );
  a.download = 'backup_manager.json';
  a.click();
};
const importarJSON = (e) => {
  if (!e.target.files[0] || !confirm('Substituir TODOS os dados?')) return (e.target.value = '');
  const r = new FileReader();
  r.onload = (ev) => {
    try {
      const d = JSON.parse(ev.target.result);
      if (d?.elencos) {
        d.elencos.forEach((el) => {
          el.mercado = el.mercado || [defaultMercadoPlayer];
          el.lineup = el.lineup || {};
          if (!el.temporadas) {
            el.temporadas = [
              {
                nome: 'Temp 1',
                jogadores: el.jogadores || [],
                mercado: el.mercado,
                lineup: el.lineup,
                calendario: JSON.parse(JSON.stringify(defaultCalendarioLigue1)),
                verba: el.verba ?? 1e8,
                salario: el.salario ?? 5e5,
              },
            ];
            el.temporadaAtiva = 0;
            el.historico = [];
          } else
            el.temporadas.forEach(
              (t) =>
                (t.calendario =
                  t.calendario || JSON.parse(JSON.stringify(defaultCalendarioLigue1))),
            );
        });
        appData = d;
        appData.indiceAtivo = 0;
        salvarDados();
        renderizar();
        alert('Backup importado!');
      }
    } catch (e) {
      console.warn(e);
    }
    e.target.value = '';
  };
  r.readAsText(e.target.files[0]);
};

function inicializarBases(j) {
  j.baseOvr = j.baseOvr ?? +j.ovr;
  j.basePot = j.basePot ?? +j.pot;
  j.potMin = j.potMin ?? +(j.pot - 5);
  j.potMax = j.potMax ?? +j.pot;
  j.basePotMin = j.basePotMin ?? +j.potMin;
  j.basePotMax = j.basePotMax ?? +j.potMax;
  j.baseS = j.baseS ?? [...j.s];
}
const renderDeltaSpan = (j, c, sI) => {
  if (['idade', 'alt', 'contAnos', 'contMeses', 'multa', 'valor', 'salario'].includes(c)) return '';
  inicializarBases(j);
  let b =
    sI !== null
      ? j.baseS[sI]
      : c === 'ovr'
        ? j.baseOvr
        : c === 'potMin'
          ? j.basePotMin
          : c === 'potMax'
            ? j.basePotMax
            : j.basePot;
  let d = (sI !== null ? j[c][sI] : +j[c]) - b;
  return d > 0
    ? `<span style="color:#10b981;font-size:.75em;font-weight:900;margin-left:2px;" title="Variação">+${d}</span>`
    : d < 0
      ? `<span style="color:#ef4444;font-size:.75em;font-weight:900;margin-left:2px;" title="Variação">${d}</span>`
      : '';
};
const transformarEmInput = (el, i, c, sI, v) => {
  if (el.querySelector('input')) return;
  el.innerHTML = `<input type="number" value="${v}" style="width:35px;text-align:center;background:#0f172a;color:#fbbf24;border:1px solid #fbbf24;border-radius:4px;" onblur="salvarEdicaoManual(${i},'${c}',${sI},this.value)" onkeydown="if(event.key==='Enter')this.blur();" autofocus>`;
  el.querySelector('input').focus();
  el.querySelector('input').select();
};

function salvarEdicaoManual(i, c, sI, vS) {
  consolidarEdicoes();
  let v = +vS;
  if (isNaN(v)) return renderizar();
  const src =
    abaAtiva === 'mercado'
      ? subAbaMercado === 'alvos'
        ? getSeason().mercado
        : getSeason().jogadores
      : getSeason().jogadores;
  const j = src[i];
  inicializarBases(j);
  if (sI !== null) {
    j[c][sI] = v;
    j.baseS[sI] = v;
  } else {
    j[c] = v;
    if (c === 'ovr') j.baseOvr = v;
    if (c === 'pot') j.basePot = v;
    if (c === 'potMin') j.basePotMin = v;
    if (c === 'potMax') j.basePotMax = v;
  }
  salvarDados();
  renderizar();
}
window.sortTaticas = (f) => {
  sortTaticasDir = sortTaticasField === f ? (sortTaticasDir === 'asc' ? 'desc' : 'asc') : 'desc';
  sortTaticasField = f;
  renderizar();
};
window.dragT = (ev, t, id) => ev.dataTransfer.setData('s', t + ':' + id);
window.allowDrop = (ev) => ev.preventDefault();
window.dropT = (ev, k) => {
  ev.preventDefault();
  let [t, id] = ev.dataTransfer.getData('s').split(':');
  const s = getSeason();
  if (t === 'L') {
    const p = s.jogadores[id];
    s.lineup[k] = p.id || (p.primeiroNome || '') + (p.sobrenome || '');
  } else if (t === 'P') {
    let tmp = s.lineup[k];
    s.lineup[k] = s.lineup[id];
    if (tmp) s.lineup[id] = tmp;
    else delete s.lineup[id];
  }
  salvarDados();
  renderizar();
};
const exportarCSV = () => {
  if (abaAtiva === 'calendario') {
    const cal = getSeason().calendario || [];
    if (!cal.length) return alert('Sem jogos no calendário.');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob(
        [
          [
            'Data,Adversário,Mando,Rodada,Campeonato,GP,GC',
            ...cal.map((e) =>
              [e.data, e.adversario, e.mando, e.rodada, e.campeonato, e.gp || '', e.gc || ''].join(
                ',',
              ),
            ),
          ].join('\n'),
        ],
        { type: 'text/csv' },
      ),
    );
    a.download = `calendario_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    return;
  }
  const src =
    abaAtiva === 'mercado'
      ? subAbaMercado === 'alvos'
        ? getSeason().mercado
        : getSeason().jogadores
      : getSeason().jogadores;
  const l = src.filter((j) =>
    abaAtiva === 'base'
      ? j.situacao === 'Base'
      : abaAtiva === 'jogadores'
        ? j.situacao !== 'Base' && j.situacao !== 'Emprest. - OUT'
        : abaAtiva === 'mercado'
          ? subAbaMercado === 'alvos'
            ? true
            : j.situacao === 'Emprest. - OUT'
          : true,
  );
  if (!l.length) return alert('Sem jogadores.');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(
    new Blob(
      [
        [
          'Primeiro Nome,Sobrenome,Num,Pos,Status,Situação,Idade,Altura,Pé,Contrato Anos,Contrato Meses,Multa,Valor,Salário,OVR,POT,Dribles,Pé Ruim,S1,S2,S3,S4,S5,S6',
          ...l.map((j) =>
            [
              j.primeiroNome,
              j.sobrenome,
              j.num,
              j.pos,
              j.status,
              j.situacao,
              j.idade,
              j.alt,
              j.pe,
              j.contAnos,
              j.contMeses,
              j.multa,
              j.valor,
              j.salario,
              j.ovr,
              j.pot,
              j.dr,
              j.pr,
              ...j.s,
            ].join(','),
          ),
        ].join('\n'),
      ],
      {
        type: 'text/csv',
      },
    ),
  );
  a.download = `elenco_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
};
const toggleFiltroRenovacao = () => {
  consolidarEdicoes();
  filtroRenovacaoAtivo = !filtroRenovacaoAtivo;
  renderizar(true);
};

function avancarTemporada() {
  const e = appData.elencos[appData.indiceAtivo];
  let cs_temp = e.temporadas[e.temporadaAtiva];
  let pend = (cs_temp.calendario || []).filter((ev) => !ev.relatorio);
  if (pend.length > 0) {
    if (
      !confirm(
        `ALERTA CRÍTICO: Você possui ${pend.length} partida(s) pendente(s) no calendário sem relatório.\n\nSe avançar a temporada agora, as estatísticas destas partidas não farão parte do resumo final.\nDeseja avançar a temporada mesmo assim?`,
      )
    )
      return;
  }
  if (
    !confirm(
      `Avançar temporada para ${e.nome}?\n\n1. Cria Snapshot no Histórico\n2. OVR/POT atuais viram Base\n3. Estatísticas Resetadas`,
    )
  )
    return;
  consolidarEdicoes();
  let cs = e.temporadas[e.temporadaAtiva];
  let pS = cs.jogadores
    .map((j) => {
      let g = 0,
        a = 0,
        jg = 0,
        sM = 0;
      if (j.est)
        Object.values(j.est).forEach((c) => {
          g += c.gols || 0;
          a += c.ast || 0;
          jg += c.jogos || 0;
          let m =
            c.media !== undefined
              ? parseFloat(c.media)
              : c.jogos
                ? (c.somaNotas || 0) / c.jogos
                : 0;
          sM += m * (c.jogos || 1);
        });
      let med = jg ? sM / jg : 0,
        evo = +j.ovr - (j.baseOvr ?? +j.ovr);
      return {
        j,
        g,
        a,
        jg,
        med,
        evo,
        n: j.primeiroNome + ' ' + j.sobrenome,
      };
    })
    .filter((x) => x.jg > 0 || x.evo !== 0);
  let pS_g = [...pS].sort((a, b) => b.g - a.g),
    pS_a = [...pS].sort((a, b) => b.a - a.a),
    pS_e = [...pS].sort((a, b) => b.evo - a.evo),
    pS_m = [...pS].filter((x) => x.jg >= 5).sort((a, b) => a.med - b.med);
  let art = pS_g[0] || null,
    gar = pS_a[0] || null,
    rev = pS_e[0] || null,
    dec = pS_m[0] || null,
    cont = null;
  if (cs.livroCaixa) {
    let recG = cs.livroCaixa
      .filter((x) => x.tipo.includes('Compra') || x.tipo.includes('IN'))
      .map((x) => x.nome);
    cont = [...pS].filter((x) => recG.includes(x.n)).sort((a, b) => b.med - a.med)[0] || null;
  }
  let premios = {
    artilheiro:
      art?.g > 0
        ? {
            n: art.n,
            v: `${art.g} Gols`,
          }
        : null,
    garcom:
      gar?.a > 0
        ? {
            n: gar.n,
            v: `${gar.a} Assists`,
          }
        : null,
    revelacao:
      rev?.evo > 0
        ? {
            n: rev.n,
            v: `+${rev.evo} OVR`,
          }
        : null,
    decepcao: dec
      ? {
          n: dec.n,
          v: `Média ${dec.med.toFixed(1)}`,
        }
      : null,
    contratacao: cont
      ? {
          n: cont.n,
          v: `Média ${cont.med.toFixed(1)}`,
        }
      : null,
  };
  e.historico.push({
    nome: cs.nome + ' (Final)',
    data: new Date().toLocaleDateString(),
    jogadores: JSON.parse(JSON.stringify(cs.jogadores)),
    mercado: JSON.parse(JSON.stringify(cs.mercado)),
    calendario: JSON.parse(JSON.stringify(cs.calendario)),
    livroCaixa: JSON.parse(JSON.stringify(cs.livroCaixa || [])),
    premios,
  });
  let ns = JSON.parse(JSON.stringify(cs));
  ns.nome = 'Temporada ' + (e.temporadas.length + 1);
  let [csY, csM] = cs.dataAtual.split('-');
  let nY = +csY + (+csM >= 7 ? 1 : 0);
  ns.dataAtual = `${nY}-07-01`;
  ns.mesesDescontados = [];
  ['jogadores', 'mercado'].forEach((a) =>
    ns[a]?.forEach((j) => {
      j.baseOvr = +j.ovr;
      j.basePot = +j.pot;
      if (j.potMin) j.basePotMin = +j.potMin;
      if (j.potMax) j.basePotMax = +j.potMax;
      j.est = {};
      j.suspenso = false;
    }),
  );
  ns.calendario = [];
  ns.livroCaixa = [];
  e.temporadas.push(ns);
  e.temporadaAtiva = e.temporadas.length - 1;
  salvarDados();
  renderizar();
  alert('Temporada avançada!');
}

const defSvg = `<svg viewBox="0 0 24 24" width="35" height="35" fill="#475569"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
const tblSvg = `<svg viewBox="0 0 24 24" width="24" height="24" fill="#475569" style="vertical-align:middle;margin-right:5px"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

const fxDef = {
  idade: [15, 35, 1],
  ovr: [50, 99, 1],
  pot: [60, 99, 1],
  valor: [0, 200, 1],
};
window.updFx = (k, i, v) => {
  let val = parseFloat(v);
  if (k === 'valor') val *= 1000000;
  filtros.fx[k][i] = val;
  if (filtros.fx[k][0] > filtros.fx[k][1]) {
    if (i === 0) filtros.fx[k][0] = filtros.fx[k][1];
    else filtros.fx[k][1] = filtros.fx[k][0];
  }
  let [min, max] = fxDef[k];
  let v0 = k === 'valor' ? filtros.fx[k][0] / 1000000 : filtros.fx[k][0];
  let v1 = k === 'valor' ? filtros.fx[k][1] / 1000000 : filtros.fx[k][1];
  let blk = document.getElementById(`fx-blk-${k}`);
  if (blk) {
    let pct1 = Math.max(0, Math.min(100, ((v0 - min) / (max - min)) * 100));
    let pct2 = Math.max(0, Math.min(100, ((v1 - min) / (max - min)) * 100));
    blk.querySelector('.fx-sld-trk').style.left = `${pct1}%`;
    blk.querySelector('.fx-sld-trk').style.right = `${100 - pct2}%`;
    let slds = blk.querySelectorAll('.fx-sld');
    slds[0].value = v0;
    slds[1].value = v1;
    if (k === 'valor') blk.querySelector('.fx-lbl-val').innerHTML = `€${v0}M - €${v1}M`;
    else {
      let inps = blk.querySelectorAll('input[type="number"]');
      inps[0].value = v0;
      inps[1].value = v1;
    }
  }
  renderizar(true);
};
const buildFaixasHTML = () =>
  Object.keys(fxDef)
    .map((k) => {
      let [min, max, step] = fxDef[k];
      let v0 = k === 'valor' ? filtros.fx[k][0] / 1000000 : filtros.fx[k][0];
      let v1 = k === 'valor' ? filtros.fx[k][1] / 1000000 : filtros.fx[k][1];
      let pct1 = Math.max(0, Math.min(100, ((v0 - min) / (max - min)) * 100));
      let pct2 = Math.max(0, Math.min(100, ((v1 - min) / (max - min)) * 100));
      let isV = k === 'valor';
      return `<div class="fx-blk" id="fx-blk-${k}"><div class="fx-lbl"><span style="color:#94a3b8">${k}</span><div style="display:flex;align-items:center;gap:4px">${isV ? `<span class="fx-lbl-val">€${v0}M - €${v1}M</span>` : `<input type="number" value="${v0}" onblur="updFx('${k}',0,this.value)" onkeydown="if(event.key==='Enter')this.blur()"> <span style="color:#475569">-</span> <input type="number" value="${v1}" onblur="updFx('${k}',1,this.value)" onkeydown="if(event.key==='Enter')this.blur()">`}</div></div><div class="fx-sld-container"><div class="fx-sld-trk" style="left:${pct1}%; right:${100 - pct2}%"></div><input type="range" class="fx-sld" min="${min}" max="${max}" step="${step}" value="${v0}" oninput="updFx('${k}',0,this.value)"><input type="range" class="fx-sld" min="${min}" max="${max}" step="${step}" value="${v1}" oninput="updFx('${k}',1,this.value)"></div></div>`;
    })
    .join('');

window.salvarLineup = function (nome) {
  const s = getSeason();
  if (
    !confirm(
      'Deseja salvar a escalação atual como "' +
        nome +
        '"? Isso sobrescreverá qualquer escalação salva com este nome.',
    )
  )
    return;

  if (!s.lineupsSalvos) s.lineupsSalvos = {};
  let objToSave = {};
  if (s.lineup) {
    for (let k in s.lineup) objToSave[k] = s.lineup[k];
  }
  s.lineupsSalvos[nome] = JSON.parse(JSON.stringify(objToSave));
  s.lineupsSalvos[nome + '_formacao'] = s.formacao || '4-3-3';
  salvarDados();
  alert('Escalação "' + nome + '" salva com sucesso!');
};

window.mudarFormacao = function (nf) {
  const s = getSeason();
  s.formacao = nf;
  const nl = {},
    c = window.formacoesTaticas[nf];
  for (let p in s.lineup) if (c.slots[p]) nl[p] = s.lineup[p];
  s.lineup = nl;
  salvarDados();
  renderizar();
};

window.carregarLineup = function (nome) {
  const s = getSeason();
  if (
    !s.lineupsSalvos ||
    !s.lineupsSalvos[nome] ||
    Object.keys(s.lineupsSalvos[nome]).length === 0
  ) {
    alert('Nenhuma escalação salva como "' + nome + '".');
    return;
  }
  if (!confirm('Carregar a escalação "' + nome + '"? A escalação atual no campo será substituída.'))
    return;

  let saved = JSON.parse(JSON.stringify(s.lineupsSalvos[nome]));

  // Suporte para o formato antigo/duplicado que usava { formacao, jogadores }
  if (saved.formacao && saved.jogadores) {
    s.formacao = saved.formacao;
    s.lineup = saved.jogadores;
  } else {
    if (s.lineupsSalvos[nome + '_formacao']) {
      s.formacao = s.lineupsSalvos[nome + '_formacao'];
    }
    s.lineup = saved;
  }

  salvarDados();
  renderizar();
};
