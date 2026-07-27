/**
 * Motor Dinâmico do Inbox 3.0
 * Arquitetura Desacoplada: Engine (Dados) + UI (Interface) + Triggers (Eventos)
 */

const getPlayer = (id) => {
  const s = typeof getSeason === 'function' ? getSeason() : null;
  if (!s || !s.jogadores) return null;
  return s.jogadores.find((j) => String(j.id) === String(id)) || null;
};

window.InboxEngine = {
  Senders: {
    BOARD: { name: 'A Diretoria', icon: '🏢', role: 'Gestão do Clube' },
    ASSISTANT: { name: 'Assistente Técnico', icon: '👨‍🏫', role: 'Tática e Elenco' },
    MEDICAL: { name: 'Chefe do Dept. Médico', icon: '🏥', role: 'Saúde e Prevenção' },
    SCOUT: { name: 'Olheiro Chefe', icon: '🕵️', role: 'Prospecção' },
    PRESS: { name: 'Assessoria de Imprensa', icon: '📰', role: 'Mídia' },
    PLAYER: { name: 'Jogador', icon: '🗣️', role: 'Elenco' },
    AGENT: { name: 'Agente do Jogador', icon: '💼', role: 'Contratos' },
  },

  Folders: {
    INBOX: 'entrada',
    ARCHIVED: 'arquivados',
    TRASH: 'lixeira',
    CONVERSATIONS: 'conversas',
  },

  generateId: function () {
    return 'mail_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  },

  dispatch: function (sender, subject, bodyHtml, folder = 'entrada', actions = []) {
    const s = getSeason();
    if (!s.inbox) s.inbox = [];

    const dateStr = s.dataAtual || new Date().toISOString().split('T')[0];

    const newMail = {
      id: this.generateId(),
      sender: sender,
      subject: subject,
      body: bodyHtml,
      date: dateStr,
      folder: folder,
      read: false,
      actions: actions,
      replied: false,
      archived: false,
      deleted: false,
    };

    s.inbox.push(newMail);
    salvarDados();
    InboxUI.refresh();
    return newMail;
  },

  markAsRead: function (id) {
    const s = getSeason();
    const mail = s.inbox.find((m) => m.id === id);
    if (mail && !mail.read) {
      mail.read = true;
      salvarDados();
      InboxUI.refresh();
    }
  },

  archive: function (id) {
    const s = getSeason();
    const mail = s.inbox.find((m) => m.id === id);
    if (mail) {
      mail.archived = true;
      mail.folder = 'arquivados'; // Mudou de lidos para arquivados
      salvarDados();
      InboxUI.refresh();
    }
  },

  delete: function (id) {
    const s = getSeason();
    const mail = s.inbox.find((m) => m.id === id);
    if (mail) {
      mail.deleted = true;
      mail.folder = 'lixeira';
      salvarDados();
      InboxUI.refresh();
    }
  },

  permanentDelete: function (id) {
    const s = getSeason();
    s.inbox = s.inbox.filter((m) => m.id !== id);
    salvarDados();
    InboxUI.refresh();
  },

  actionBenchPlayer: function (playerId, mailId) {
    const s = getSeason();
    for (let pos in s.lineup) {
      if (s.lineup[pos] === playerId) delete s.lineup[pos];
    }
    this.markActionTaken(mailId, 'Jogador movido para o banco.');
    if (typeof renderizar === 'function') renderizar();
  },

  actionPrioritizeRenewal: function (playerId, mailId) {
    const s = getSeason();
    if (!s.shortlist) s.shortlist = [];
    if (!s.shortlist.includes(playerId)) s.shortlist.push(playerId);
    this.markActionTaken(mailId, 'Jogador adicionado às prioridades.');
  },

  actionReplyPlayerPromise: function (playerId, promiseType, mailId) {
    const s = getSeason();
    if (!s.activePromises) s.activePromises = [];
    s.activePromises.push({
      playerId: playerId,
      type: promiseType,
      dateMade: s.dataAtual,
      status: 'pending',
    });
    this.markActionTaken(mailId, 'Promessa registrada. Cumpra-a ou haverá consequências.');
  },

  markActionTaken: function (mailId, feedbackMsg) {
    const s = getSeason();
    const mail = s.inbox.find((m) => m.id === mailId);
    if (mail) {
      mail.replied = true;
      mail.actions = [];
      mail.body += `<br><br><div style="padding: 10px; background: #2a313b; border-left: 3px solid #14f195; border-radius: 4px; margin-top: 15px;"><i>Ação tomada: ${feedbackMsg}</i></div>`;
      salvarDados();
      InboxUI.refresh();
    }
  },

  migrateLegacyEmails: function () {
    const s = typeof getSeason === 'function' ? getSeason() : null;
    if (!s || !s.inbox) return;
    let modified = false;

    s.inbox.forEach((m) => {
      if (m.txt && !m.subject) {
        modified = true;
        let sender = { name: 'Sistema', icon: '⚙️', role: 'Gerenciador' };
        let subject = 'Notificação';
        let body = m.txt;
        
        if (m.txt.startsWith('Assistente Técnico:')) {
           sender = InboxEngine.Senders.ASSISTANT;
           subject = 'Aviso do Assistente';
           body = `<p>${m.txt.replace('Assistente Técnico:', '').trim()}</p>`;
        } else if (m.txt.startsWith('Atenção:')) {
           sender = InboxEngine.Senders.BOARD;
           subject = 'Aviso Importante';
           body = `<p>${m.txt.replace('Atenção:', '').trim()}</p>`;
        } else if (m.txt.startsWith('URGENTE:')) {
           sender = InboxEngine.Senders.BOARD;
           subject = 'Ação Requerida';
           body = `<p><b>${m.txt.replace('URGENTE:', '').trim()}</b></p>`;
        } else if (m.txt.startsWith('Pré-Contrato:')) {
           sender = InboxEngine.Senders.AGENT;
           subject = 'Aviso de Contrato';
           body = `<p>${m.txt.replace('Pré-Contrato:', '').trim()}</p>`;
        } else {
           body = `<p>${m.txt}</p>`;
           if (m.txt.includes('jogo') || m.txt.includes('partida')) subject = 'Dia de Jogo';
           else if (m.txt.includes('Janela')) {
               subject = 'Mercado de Transferências';
               sender = InboxEngine.Senders.BOARD;
           }
        }
        
        m.sender = sender;
        m.subject = subject;
        m.body = body;
        m.date = m.date || m.data || s.dataAtual;
        m.folder = m.folder || (m.read ? 'arquivados' : 'entrada');
        m.actions = m.actions || [];
        m.replied = m.replied || false;
        m.archived = m.archived || false;
        m.deleted = m.deleted || false;
      }
    });

    if (modified) {
      if (typeof salvarDados === 'function') salvarDados();
    }
  }
};

window.InboxUI = {
  activeFolder: 'entrada',
  activeEmailId: null,

  refresh: function () {
    this.renderModal();
    if (typeof abaAtiva !== 'undefined' && abaAtiva === 'inboxmaster') {
      this.renderTab(this.activeFolder);
      if (this.activeEmailId) {
        this.openEmail(this.activeEmailId, false);
      }
    }
  },

  toggleModal: function () {
    const p = document.getElementById('inbox-panel');
    if(p) p.style.display = p.style.display === 'flex' ? 'none' : 'flex';
  },

  renderModal: function () {
    const s = getSeason();
    if (!s || !s.inbox) return;
    
    const unreadMails = s.inbox.filter((m) => !m.read && !m.deleted);
    const ur = unreadMails.length;
    
    const badge = document.getElementById('inbox-badge');
    if(badge) {
      badge.innerText = ur;
      badge.style.display = ur > 0 ? 'block' : 'none';
    }

    const list = document.getElementById('inbox-list');
    if(!list) return;

    if (ur === 0) {
      list.innerHTML = `<div style="padding: 15px; text-align: center; color: #94a3b8; font-size: 0.9em;">Nenhuma notificação não lida.</div>`;
      return;
    }

    list.innerHTML = [...unreadMails]
      .reverse()
      .slice(0, 5)
      .map((m) => {
        const mDate = m.date || m.data || '';
        const mDateFmt = mDate.includes('-') ? mDate.split('-').reverse().join('/') : mDate;
        const mText = m.subject || m.txt || 'Sem Assunto';
        const mId = m.id || '';
        return `<div class="inbox-msg unread" onclick="InboxUI.clickShortcut('${mId}')" style="position:relative;padding:10px;cursor:pointer;">
                  <div style="font-size:0.7em;color:#94a3b8">${mDateFmt}</div>
                  ${mText}
                </div>`;
      })
      .join('');
  },

  clickShortcut: function (id) {
    this.toggleModal();
    if(typeof mudarAba === 'function') mudarAba('inboxmaster');
    InboxEngine.markAsRead(id);
    this.openEmail(id, true);
  },

  renderTab: function (folder = 'entrada') {
    this.activeFolder = folder;
    const s = getSeason();
    if (!s.inbox) s.inbox = [];

    document.querySelectorAll('.sidebar-menu a').forEach((a) => a.classList.remove('ativo'));
    const link = document.getElementById('link-inboxmaster');
    if (link) link.classList.add('ativo');

    const mainTitle = document.getElementById('main-title');
    if(mainTitle) mainTitle.innerText = 'Caixa de E-mails';
    
    ['filtros-container', 'dashboard', 'elenco-container'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.style.display = 'none';
    });

    const container = document.getElementById('inbox-master-container');
    if(!container) return;
    container.style.display = 'flex';

    // Para compatibilidade, migrar emails 'lidos' para 'arquivados' caso existam no modelo antigo,
    // mas o novo sistema usará apenas 'arquivados' para isso.
    const countEntrada = s.inbox.filter((m) => m.folder === 'entrada' && !m.deleted).length;
    const countArquivados = s.inbox.filter((m) => (m.folder === 'arquivados' || m.folder === 'lidos') && !m.deleted).length;
    const countLixeira = s.inbox.filter((m) => m.folder === 'lixeira').length;
    const countConversas = s.inbox.filter((m) => m.folder === 'conversas' && !m.deleted).length;

    let emails = s.inbox.filter(
      (m) => (m.folder === folder || (folder === 'arquivados' && m.folder === 'lidos')) && (folder === 'lixeira' ? true : !m.deleted)
    );
    emails = [...emails].reverse();

    let html = `
      <div class="inbox-master-layout">
          <div class="inbox-sidebar">
              <div class="inbox-folder ${folder === 'entrada' ? 'active' : ''}" onclick="InboxUI.renderTab('entrada')">
                  <span>📥 Entrada</span> <span class="badge">${countEntrada}</span>
              </div>
              <div class="inbox-folder ${folder === 'conversas' ? 'active' : ''}" onclick="InboxUI.renderTab('conversas')">
                  <span>🗣️ Conversas</span> <span class="badge">${countConversas}</span>
              </div>
              <div class="inbox-folder ${folder === 'arquivados' ? 'active' : ''}" onclick="InboxUI.renderTab('arquivados')">
                  <span>🗄️ Arquivados</span> <span class="badge">${countArquivados}</span>
              </div>
              <div class="inbox-folder ${folder === 'lixeira' ? 'active' : ''}" onclick="InboxUI.renderTab('lixeira')">
                  <span>🗑️ Lixeira</span> <span class="badge">${countLixeira}</span>
              </div>
          </div>

          <div class="inbox-list-pane">
              ${emails.length === 0 ? '<div style="padding: 20px; color: #94a3b8; text-align: center;">Nenhuma mensagem nesta pasta.</div>' : ''}
              ${emails
                .map((m) => {
                  const sIcon = m.sender?.icon || '✉️';
                  const sName = m.sender?.name || 'Sistema';
                  const isActive = (m.id === this.activeEmailId) ? 'active' : '';
                  return `<div class="inbox-list-item ${m.read ? 'read' : 'unread'} ${isActive}" onclick="InboxUI.openEmail('${m.id}', true)">
                      <div class="inbox-item-icon">${sIcon}</div>
                      <div class="inbox-item-content">
                          <div class="inbox-item-header">
                              <span class="inbox-item-sender">${sName}</span>
                              <span class="inbox-item-date">${m.date}</span>
                          </div>
                          <div class="inbox-item-subject">${m.subject}</div>
                      </div>
                      ${m.read ? '' : '<div class="unread-dot"></div>'}
                  </div>`;
                })
                .join('')}
          </div>

          <div class="inbox-reading-pane" id="inbox-reading-pane">
              <div style="display:flex; height:100%; align-items:center; justify-content:center; color:#64748b;">
                  Selecione uma mensagem para ler
              </div>
          </div>
      </div>`;

    container.innerHTML = html;
    
    if(this.activeEmailId && !emails.find(e => e.id === this.activeEmailId)) {
        this.activeEmailId = null;
    }
  },

  openEmail: function (id, userClicked = false) {
    const s = getSeason();
    const mail = s.inbox.find((m) => m.id === id);
    if (!mail) return;

    this.activeEmailId = id;

    if (userClicked && !mail.read) {
        InboxEngine.markAsRead(id);
        return; 
    }

    const sIcon = mail.sender?.icon || '✉️';
    const sName = mail.sender?.name || 'Sistema';
    const sRole = mail.sender?.role || '';

    let actionsHtml = '';
    if (mail.actions && mail.actions.length > 0) {
      actionsHtml = '<div class="inbox-mail-actions">';
      mail.actions.forEach((act) => {
        const color = act.color || '#3b82f6';
        actionsHtml += `<button style="background: ${color}" onclick="${act.callbackStr.replace('{MAIL_ID}', mail.id)}">${act.label}</button>`;
      });
      actionsHtml += '</div>';
    }

    let headerButtons = '';
    if (mail.folder !== 'lixeira') {
        if (mail.folder !== 'arquivados' && mail.folder !== 'lidos') {
            headerButtons += `<button class="btn-del-mail" style="margin-right:5px;background:#64748b;" onclick="InboxEngine.archive('${mail.id}')" title="Arquivar">🗄️</button>`;
        }
        headerButtons += `<button class="btn-del-mail" style="background:#ef4444;" onclick="InboxEngine.delete('${mail.id}')" title="Excluir">🗑️</button>`;
    } else {
        headerButtons += `<button class="btn-del-mail" onclick="InboxEngine.permanentDelete('${mail.id}')" style="background:#ef4444" title="Excluir Permanentemente">🗑️</button>`;
    }

    const pane = document.getElementById('inbox-reading-pane');
    if (!pane) return; 

    pane.innerHTML = `
          <div class="inbox-mail-header">
              <div style="display:flex; justify-content: space-between; align-items: flex-start;">
                  <div style="display:flex; align-items: center; gap: 15px;">
                      <div class="inbox-mail-avatar">${sIcon}</div>
                      <div>
                          <div class="inbox-mail-sender">${sName}</div>
                          <div class="inbox-mail-role">${sRole}</div>
                      </div>
                  </div>
                  <div style="text-align: right;">
                      <div class="inbox-mail-date" style="margin-bottom: 5px;">${mail.date}</div>
                      ${headerButtons}
                  </div>
              </div>
              <div class="inbox-mail-subject" style="margin-top: 15px;">${mail.subject}</div>
          </div>
          <div class="inbox-mail-body">
              ${mail.body}
              ${actionsHtml}
          </div>
      `;
  }
};

window.InboxTriggers = {
  checkDailyTriggers: function (oldDateStr, newDateStr) {
    const s = getSeason();
    const nD = new Date(newDateStr);

    if (nD.getDate() === 1) {
      this.generateMonthlyBoardReport(nD);
    }
    if (nD.getDate() === 1 && nD.getMonth() === 0) {
      this.generateContractWarnings();
    }
  },

  checkPostMatchTriggers: function (matchData) {
    if (!matchData || !matchData.players) return;
    matchData.players.forEach((pStat) => {
      const player = getPlayer(pStat.id);
      if (!player) return;

      if (pStat.goals >= 3) {
        InboxEngine.dispatch(
          InboxEngine.Senders.PRESS,
          `Imprensa exalta ${player.name}`,
          `<p>A imprensa esportiva está em êxtase após a atuação de gala de <b>${player.name}</b> no último jogo.</p>`,
          'entrada'
        );
      }

      if (pStat.injury) {
        InboxEngine.dispatch(
          InboxEngine.Senders.MEDICAL,
          `Laudo Médico: Lesão de ${player.name}`,
          `<p>Treinador,</p><p>Infelizmente <b>${player.name}</b> sofreu uma lesão. Precisamos tirá-lo do time titular imediatamente para evitar agravamento.</p>`,
          'entrada',
          [
            {
              label: 'Tirar do Time Titular',
              callbackStr: `InboxEngine.actionBenchPlayer('${player.id}', '{MAIL_ID}')`,
              color: '#ff4d4d',
            },
          ]
        );
      }
    });
  },

  generateMonthlyBoardReport: function (dateObj) {
    const s = getSeason();
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    InboxEngine.dispatch(
      InboxEngine.Senders.BOARD,
      `Balanço do Clube - ${months[dateObj.getMonth()]}`,
      `<p>Prezado Treinador,</p>
       <p>Este é o balanço automático do mês. Lembramos que a nossa expectativa financeira para esta temporada é rigorosa.</p>
       <p>Orçamento Restante: <b>€ ${s.orcamento ? s.orcamento.toLocaleString() : 'N/A'}</b></p>`,
      'entrada'
    );
  },

  generateContractWarnings: function () {
    const s = getSeason();
    if (!s.elenco || s.elenco.length === 0) return;
    let warningPlayers = s.elenco.slice(0, 3);
    warningPlayers.forEach((pId) => {
      const p = getPlayer(pId);
      if (!p) return;
      InboxEngine.dispatch(
        InboxEngine.Senders.AGENT,
        `Contrato expirando: ${p.name}`,
        `<p>Olá, o contrato do meu cliente expira em 6 meses.</p>`,
        'conversas',
        [
          {
            label: 'Marcar como Prioridade',
            callbackStr: `InboxEngine.actionPrioritizeRenewal('${p.id}', '{MAIL_ID}')`,
            color: '#14f195',
          },
        ]
      );
    });
  },
};

setTimeout(() => {
  if (typeof mudarDataManager === 'function') {
    const originalMudarData = mudarDataManager;
    window.mudarDataManager = function (d) {
      const s = getSeason();
      const oldDate = s.dataAtual;
      originalMudarData(d);
      const newDate = s.dataAtual;
      if (oldDate !== newDate && typeof InboxTriggers !== 'undefined') {
        InboxTriggers.checkDailyTriggers(oldDate, newDate);
      }
    };
  }
}, 1000);
