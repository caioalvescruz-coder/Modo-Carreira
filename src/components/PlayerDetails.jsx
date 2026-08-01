import React, { useState } from 'react';
import { db, doc, setDoc } from '../firebase';
import './PlayerDetails.css';

export default function PlayerDetails({ player, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    skillmoves: player?.attributes?.skillmoves || 0,
    weakfoot: player?.attributes?.weakfoot || 0,
    notes: player?.notes || '',
    valor: player?.valor || '',
    multa: player?.multa || '',
    dedicacaoAtaque: player?.dedicacaoAtaque || 'Média',
    dedicacaoDefesa: player?.dedicacaoDefesa || 'Média',
    playstyles: player?.playstyles?.join(', ') || ''
  });

  if (!player) return null;

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...editForm,
        playstyles: editForm.playstyles.split(',').map(s => s.trim()).filter(Boolean)
      };
      await setDoc(doc(db, 'players', player.id), dataToSave, { merge: true });
      setIsEditing(false);
    } catch (err) {
      console.error("Erro ao salvar no firebase:", err);
      alert("Erro ao salvar");
    }
  };

  const getOvrColor = (ovr) => {
    if (ovr >= 80) return '#00ff66';
    if (ovr >= 70) return '#fbbf24';
    return '#ef4444';
  };

  const attrColor = (val) => {
    if (val >= 80) return 'text-green';
    if (val >= 70) return 'text-yellow';
    return 'text-red';
  };

  const isGK = player.position === 'GOL';

  return (
    <div className="player-details-overlay" onClick={onClose}>
      <div className="player-details-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        {/* Header Superior */}
        <div className="pd-header-top">
          <div className="pd-header-left">
            <div className="pd-photo-placeholder">👤</div>
            <div className="pd-name-block">
              <div className="pd-first-name">{player.name}</div>
              <div className="pd-last-name">{player.name} <span className="pd-jersey">{player.jerseyNumber || ''}</span></div>
              <div className="pd-badges">
                <span className="badge-status">{player.status === 'Não Definido' ? 'TIT' : player.status.substring(0,3).toUpperCase()}</span>
                <span className="badge-pos">{player.position}</span>
              </div>
            </div>
          </div>
          <div className="pd-header-center">
            <div className="ovr-box-big">
              <span className="ovr-label">OVR</span>
              <span className="ovr-value" style={{color: getOvrColor(player.overall)}}>{player.overall}</span>
            </div>
            <div className="ovr-box-big">
              <span className="ovr-label">POT</span>
              <span className="ovr-value" style={{color: getOvrColor(player.potential)}}>{player.potential}</span>
            </div>
          </div>
          <div className="pd-header-right">
            <div className="season-stats">
              <div className="s-stat"><span className="s-val text-green">{player.tracker?.Appearances || 0}</span><span className="s-lbl">JOGOS</span></div>
              <div className="s-stat"><span className="s-val text-green">{player.tracker?.Goals || 0}</span><span className="s-lbl">GOLS</span></div>
              <div className="s-stat"><span className="s-val text-green">{player.tracker?.Assists || 0}</span><span className="s-lbl">ASSISTS</span></div>
              <div className="s-stat"><span className="s-val text-green">{player.tracker?.finalRating || '0.0'}</span><span className="s-lbl">NOTA</span></div>
            </div>
          </div>
        </div>

        <div className="pd-action-bar">
          {!isEditing ? (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>✎ Modo Edição (Nuvem)</button>
          ) : (
            <div className="edit-actions-row">
              <button className="btn-save" onClick={handleSave}>✔ Salvar</button>
              <button className="btn-cancel" onClick={() => setIsEditing(false)}>✖ Cancelar</button>
            </div>
          )}
        </div>

        <div className="pd-body-grid">
          {/* Coluna Esquerda */}
          <div className="pd-col-left">
            <div className="pd-card">
              <h3>DADOS BIOGRÁFICOS</h3>
              <div className="pd-row"><span>Idade</span><span>{player.age} Anos</span></div>
              <div className="pd-row"><span>Nacionalidade</span><span>{player.nationality}</span></div>
              <div className="pd-row"><span>Altura</span><span>{player.height} cm</span></div>
              <div className="pd-row"><span>Peso</span><span>{player.weight} kg</span></div>
              <div className="pd-row"><span>Pé Bom</span><span>{player.preferredFoot}</span></div>
              {isEditing ? (
                <>
                  <div className="pd-row">
                    <span>Dedicação</span>
                    <input type="text" className="pd-input" placeholder="Alta / Média" value={editForm.dedicacaoAtaque} onChange={e => setEditForm({...editForm, dedicacaoAtaque: e.target.value})} />
                  </div>
                  <div className="pd-row"><span>Fintas</span><input type="number" min="1" max="5" className="pd-input" value={editForm.skillmoves} onChange={e => setEditForm({...editForm, skillmoves: e.target.value})} /></div>
                  <div className="pd-row"><span>Pé Ruim</span><input type="number" min="1" max="5" className="pd-input" value={editForm.weakfoot} onChange={e => setEditForm({...editForm, weakfoot: e.target.value})} /></div>
                </>
              ) : (
                <>
                  <div className="pd-row"><span>Dedicação</span><span>{player.dedicacaoAtaque}</span></div>
                  <div className="pd-row"><span>Fintas</span><span className="text-yellow">{'★'.repeat(player.attributes.skillmoves)}</span></div>
                  <div className="pd-row"><span>Pé Ruim</span><span className="text-yellow">{'★'.repeat(player.attributes.weakfoot)}</span></div>
                </>
              )}
            </div>

            <div className="pd-card">
              <h3>CONTRATO E FINANÇAS</h3>
              {isEditing ? (
                <>
                  <div className="pd-row"><span>Valor</span><input type="text" className="pd-input" value={editForm.valor} onChange={e => setEditForm({...editForm, valor: e.target.value})} /></div>
                  <div className="pd-row"><span>Multa</span><input type="text" className="pd-input" value={editForm.multa} onChange={e => setEditForm({...editForm, multa: e.target.value})} /></div>
                </>
              ) : (
                <>
                  <div className="pd-row"><span>Valor</span><span>{player.valor || '€ -'}</span></div>
                  <div className="pd-row"><span>Multa</span><span>{player.multa || '€ -'}</span></div>
                </>
              )}
              <div className="pd-row"><span>Salário</span><span>{player.wage ? `€ ${player.wage}` : '-'}</span></div>
              <div className="pd-row"><span>Duração</span><span>{player.contract?.monthsLeft ? `${Math.floor(player.contract.monthsLeft/12)} Anos` : '-'}</span></div>
              <div className="pd-row"><span>Função</span><span>{player.role || 'Crucial'}</span></div>
            </div>

            <div className="pd-card">
              <h3>PLAYSTYLES</h3>
              {isEditing ? (
                <input type="text" className="pd-input" placeholder="Finesse, Passo Rápido..." value={editForm.playstyles} onChange={e => setEditForm({...editForm, playstyles: e.target.value})} />
              ) : (
                <div className="playstyles-list">
                  {player.playstyles && player.playstyles.length > 0 ? player.playstyles.map((ps, i) => (
                    <span key={i} className="playstyle-badge">{ps}</span>
                  )) : <span className="text-muted">Nenhum</span>}
                </div>
              )}
            </div>
          </div>

          {/* Coluna Central - Atributos */}
          <div className="pd-col-center">
            {isGK ? (
              <div className="attr-grid-gk">
                {/* Goleiros têm layout reduzido ou específico, mas vamos usar o padrao adaptado */}
                <div className="pd-card attr-card">
                  <div className="attr-header"><span>Goleiro</span><span className={attrColor(player.attributes.pacdiv)}>{player.attributes.pacdiv}</span></div>
                  <div className="pd-row"><span>Mergulho</span><span className={attrColor(player.attributes.pacdiv)}>{player.attributes.pacdiv}</span></div>
                  <div className="pd-row"><span>Manejo</span><span className={attrColor(player.attributes.shohan)}>{player.attributes.shohan}</span></div>
                  <div className="pd-row"><span>Chute</span><span className={attrColor(player.attributes.paskic)}>{player.attributes.paskic}</span></div>
                  <div className="pd-row"><span>Reflexos</span><span className={attrColor(player.attributes.driref)}>{player.attributes.driref}</span></div>
                  <div className="pd-row"><span>Velocidade</span><span className={attrColor(player.attributes.defspe)}>{player.attributes.defspe}</span></div>
                  <div className="pd-row"><span>Posicionam.</span><span className={attrColor(player.attributes.phypos)}>{player.attributes.phypos}</span></div>
                </div>
              </div>
            ) : (
              <div className="attr-grid-field">
                <div className="pd-card attr-card">
                  <div className="attr-header"><span>RITMO</span><span className={attrColor(player.attributes.pacdiv)}>{player.attributes.pacdiv}</span></div>
                  <div className="pd-row"><span>Aceleração</span><span className={attrColor(player.attributes.acceleration)}>{player.attributes.acceleration}</span></div>
                  <div className="pd-row"><span>Pique</span><span className={attrColor(player.attributes.sprintspeed)}>{player.attributes.sprintspeed}</span></div>
                </div>

                <div className="pd-card attr-card">
                  <div className="attr-header"><span>PASSE</span><span className={attrColor(player.attributes.paskic)}>{player.attributes.paskic}</span></div>
                  <div className="pd-row"><span>Visão</span><span className={attrColor(player.attributes.vision)}>{player.attributes.vision}</span></div>
                  <div className="pd-row"><span>Cruzamento</span><span className={attrColor(player.attributes.crossing)}>{player.attributes.crossing}</span></div>
                  <div className="pd-row"><span>Prec. Falta</span><span className={attrColor(player.attributes.freekickaccuracy)}>{player.attributes.freekickaccuracy}</span></div>
                  <div className="pd-row"><span>Passe Curto</span><span className={attrColor(player.attributes.shortpassing)}>{player.attributes.shortpassing}</span></div>
                  <div className="pd-row"><span>Passe Longo</span><span className={attrColor(player.attributes.longpassing)}>{player.attributes.longpassing}</span></div>
                  <div className="pd-row"><span>Efeito</span><span className={attrColor(player.attributes.curve)}>{player.attributes.curve}</span></div>
                </div>

                <div className="pd-card attr-card">
                  <div className="attr-header"><span>DEFESA</span><span className={attrColor(player.attributes.defspe)}>{player.attributes.defspe}</span></div>
                  <div className="pd-row"><span>Intercept.</span><span className={attrColor(player.attributes.interceptions)}>{player.attributes.interceptions}</span></div>
                  <div className="pd-row"><span>Prec. Cab.</span><span className={attrColor(player.attributes.headingaccuracy)}>{player.attributes.headingaccuracy}</span></div>
                  <div className="pd-row"><span>Noção Def.</span><span className={attrColor(player.attributes.defensiveawareness)}>{player.attributes.defensiveawareness}</span></div>
                  <div className="pd-row"><span>Dividida</span><span className={attrColor(player.attributes.standingtackle)}>{player.attributes.standingtackle}</span></div>
                  <div className="pd-row"><span>Carrinho</span><span className={attrColor(player.attributes.slidingtackle)}>{player.attributes.slidingtackle}</span></div>
                </div>

                <div className="pd-card attr-card">
                  <div className="attr-header"><span>FINALIZAÇÃO</span><span className={attrColor(player.attributes.shohan)}>{player.attributes.shohan}</span></div>
                  <div className="pd-row"><span>Posicionam.</span><span className={attrColor(player.attributes.positioning)}>{player.attributes.positioning}</span></div>
                  <div className="pd-row"><span>Finalização</span><span className={attrColor(player.attributes.finishing)}>{player.attributes.finishing}</span></div>
                  <div className="pd-row"><span>Força Chute</span><span className={attrColor(player.attributes.shotpower)}>{player.attributes.shotpower}</span></div>
                  <div className="pd-row"><span>Chute Longe</span><span className={attrColor(player.attributes.longshots)}>{player.attributes.longshots}</span></div>
                  <div className="pd-row"><span>Voleios</span><span className={attrColor(player.attributes.volleys)}>{player.attributes.volleys}</span></div>
                  <div className="pd-row"><span>Pênaltis</span><span className={attrColor(player.attributes.penalties)}>{player.attributes.penalties}</span></div>
                </div>

                <div className="pd-card attr-card">
                  <div className="attr-header"><span>DRIBLE</span><span className={attrColor(player.attributes.driref)}>{player.attributes.driref}</span></div>
                  <div className="pd-row"><span>Agilidade</span><span className={attrColor(player.attributes.agility)}>{player.attributes.agility}</span></div>
                  <div className="pd-row"><span>Equilíbrio</span><span className={attrColor(player.attributes.balance)}>{player.attributes.balance}</span></div>
                  <div className="pd-row"><span>Reação</span><span className={attrColor(player.attributes.reactions)}>{player.attributes.reactions}</span></div>
                  <div className="pd-row"><span>Contr. Bola</span><span className={attrColor(player.attributes.ballcontrol)}>{player.attributes.ballcontrol}</span></div>
                  <div className="pd-row"><span>Drible</span><span className={attrColor(player.attributes.dribbling)}>{player.attributes.dribbling}</span></div>
                  <div className="pd-row"><span>Compostura</span><span className={attrColor(player.attributes.composure)}>{player.attributes.composure}</span></div>
                </div>

                <div className="pd-card attr-card">
                  <div className="attr-header"><span>FÍSICO</span><span className={attrColor(player.attributes.phypos)}>{player.attributes.phypos}</span></div>
                  <div className="pd-row"><span>Impulsão</span><span className={attrColor(player.attributes.jumping)}>{player.attributes.jumping}</span></div>
                  <div className="pd-row"><span>Fôlego</span><span className={attrColor(player.attributes.stamina)}>{player.attributes.stamina}</span></div>
                  <div className="pd-row"><span>Força</span><span className={attrColor(player.attributes.strength)}>{player.attributes.strength}</span></div>
                  <div className="pd-row"><span>Agressiv.</span><span className={attrColor(player.attributes.aggression)}>{player.attributes.aggression}</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Coluna Direita */}
          <div className="pd-col-right">
            <div className="pd-card pd-notes">
              <h3>RELATÓRIO DE OBSERVAÇÃO</h3>
              <div className="notes-content">
                <div className="notes-tip">
                  <strong>DICA DO TÉCNICO</strong><br/>
                  Atleta em excelente fase técnica e ritmo ideal.
                </div>
                {isEditing ? (
                  <textarea 
                    className="notes-textarea"
                    value={editForm.notes}
                    onChange={e => setEditForm({...editForm, notes: e.target.value})}
                    placeholder="Adicione notas pessoais aqui..."
                  />
                ) : (
                  <div className="notes-display">
                    {player.notes || 'Sem anotações no Firebase.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
