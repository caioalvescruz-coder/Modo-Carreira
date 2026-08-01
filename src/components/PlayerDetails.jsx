import React, { useState } from 'react';
import { db, doc, setDoc } from '../firebase';
import './PlayerDetails.css';

export default function PlayerDetails({ player, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    skillmoves: player?.attributes?.skillmoves || 0,
    weakfoot: player?.attributes?.weakfoot || 0,
    notes: player?.notes || ''
  });

  if (!player) return null;

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'players', player.id), editForm, { merge: true });
      setIsEditing(false);
    } catch (err) {
      console.error("Erro ao salvar no firebase:", err);
      alert("Erro ao salvar");
    }
  };

  return (
    <div className="player-details-overlay" onClick={onClose}>
      <div className="player-details-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="pd-header">
          <div className="pd-ovr-container">
            <span className="pd-ovr">{player.overall}</span>
          </div>
          <div className="pd-info">
            <div className="pd-positions">
              {player.positions?.join(' · ') || player.position}
            </div>
            <div className="pd-name">{player.name.toUpperCase()}</div>
            
            <div className="pd-bio">
              <div className="bio-item">
                <span className="bio-label">Idade</span>
                <span className="bio-val">{player.age}</span>
              </div>
              <div className="bio-item">
                <span className="bio-label">Altura e peso</span>
                <span className="bio-val">{player.height} cm / {player.weight} kg</span>
              </div>
              <div className="bio-item">
                <span className="bio-label">Perna boa</span>
                <span className="bio-val">{player.preferredFoot}</span>
              </div>
            </div>
            
            <div className="pd-edit-actions">
              {!isEditing ? (
                <button className="btn-edit" onClick={() => setIsEditing(true)}>Editar Nuvem</button>
              ) : (
                <div className="edit-actions-row">
                  <button className="btn-save" onClick={handleSave}>Salvar</button>
                  <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancelar</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pd-body">
          {player.notes && !isEditing && (
            <div className="pd-notes-display">
              <h4>Anotações (Nuvem):</h4>
              <p>{player.notes}</p>
            </div>
          )}

          {isEditing && (
            <div className="pd-edit-form">
              <label>
                Anotações:
                <textarea 
                  value={editForm.notes}
                  onChange={e => setEditForm({...editForm, notes: e.target.value})}
                  placeholder="Ex: Vender na próxima janela..."
                />
              </label>
              <div className="edit-stars-row">
                <label>
                  Fintas: 
                  <input type="number" min="1" max="5" value={editForm.skillmoves} onChange={e => setEditForm({...editForm, skillmoves: e.target.value})} />
                </label>
                <label>
                  Perna Ruim: 
                  <input type="number" min="1" max="5" value={editForm.weakfoot} onChange={e => setEditForm({...editForm, weakfoot: e.target.value})} />
                </label>
              </div>
            </div>
          )}

          <div className="pd-section-resumo">
            <h3 className="pd-section-title">Resumo</h3>
            <div className="resumo-grid">
              <div className="resumo-col-left">
                {player.position === 'GOL' ? (
                  <>
                    <div className="stat-row"><span>Elasticidade</span><span className="stat-val stat-great">{player.attributes.pacdiv}</span></div>
                    <div className="stat-row"><span>Manejo</span><span className="stat-val stat-great">{player.attributes.shohan}</span></div>
                    <div className="stat-row"><span>Chute</span><span className="stat-val stat-good">{player.attributes.paskic}</span></div>
                    <div className="stat-row"><span>Reflexos</span><span className="stat-val stat-great">{player.attributes.driref}</span></div>
                    <div className="stat-row"><span>Velocidade</span><span className="stat-val stat-bad">{player.attributes.defspe}</span></div>
                    <div className="stat-row"><span>Posicionamento</span><span className="stat-val stat-good">{player.attributes.phypos}</span></div>
                  </>
                ) : (
                  <>
                    <div className="stat-row"><span>Ritmo</span><span className="stat-val stat-good">{player.attributes.pacdiv}</span></div>
                    <div className="stat-row"><span>Finalizações</span><span className="stat-val stat-good">{player.attributes.shohan}</span></div>
                    <div className="stat-row"><span>Passes</span><span className="stat-val stat-great">{player.attributes.paskic}</span></div>
                    <div className="stat-row"><span>Condução</span><span className="stat-val stat-great">{player.attributes.driref}</span></div>
                    <div className="stat-row"><span>Defesa</span><span className="stat-val stat-bad">{player.attributes.defspe}</span></div>
                    <div className="stat-row"><span>Físico</span><span className="stat-val stat-avg">{player.attributes.phypos}</span></div>
                  </>
                )}
              </div>
              <div className="resumo-col-right">
                <div className="stat-row"><span>Fintas</span><span className="stat-stars">{'★'.repeat(player.attributes.skillmoves)}{'☆'.repeat(5 - (player.attributes.skillmoves || 0))}</span></div>
                <div className="stat-row"><span>Perna ruim</span><span className="stat-stars">{'★'.repeat(player.attributes.weakfoot)}{'☆'.repeat(5 - (player.attributes.weakfoot || 0))}</span></div>
              </div>
            </div>
          </div>

          <div className="pd-details-grid">
            <div className="pd-column">
            <h3 className="pd-section-title">Físico</h3>
            <div className="stat-row"><span>Aceleração</span><span className="stat-val stat-good">{player.attributes.acceleration}</span></div>
            <div className="stat-row"><span>Agilidade</span><span className="stat-val stat-good">{player.attributes.agility}</span></div>
            <div className="stat-row"><span>Equilíbrio</span><span className="stat-val stat-avg">{player.attributes.balance}</span></div>
            <div className="stat-row"><span>Força</span><span className="stat-val stat-bad">{player.attributes.strength}</span></div>
            <div className="stat-row"><span>Fôlego</span><span className="stat-val stat-avg">{player.attributes.stamina}</span></div>
            <div className="stat-row"><span>Impulsão</span><span className="stat-val stat-bad">{player.attributes.jumping}</span></div>
            <div className="stat-row"><span>Pique</span><span className="stat-val stat-avg">{player.attributes.sprintspeed}</span></div>
          </div>

          <div className="pd-column">
            <h3 className="pd-section-title">Mental</h3>
            <div className="stat-row"><span>Combativ.</span><span className="stat-val stat-bad">{player.attributes.aggression}</span></div>
            <div className="stat-row"><span>Frieza</span><span className="stat-val stat-avg">{player.attributes.composure}</span></div>
            <div className="stat-row"><span>Intercept.</span><span className="stat-val stat-bad">{player.attributes.interceptions}</span></div>
            <div className="stat-row"><span>Pos. ataque</span><span className="stat-val stat-good">{player.attributes.positioning}</span></div>
            <div className="stat-row"><span>Reação</span><span className="stat-val stat-good">{player.attributes.reactions}</span></div>
            <div className="stat-row"><span>Visão</span><span className="stat-val stat-great">{player.attributes.vision}</span></div>
          </div>
          
          <div className="pd-column pd-col-wide">
            <h3 className="pd-section-title">Técnico</h3>
            <div className="stat-grid-2">
              <div className="stat-row"><span>Cabeceio</span><span className="stat-val stat-bad">{player.attributes.headingaccuracy}</span></div>
              <div className="stat-row"><span>Cruzamento</span><span className="stat-val stat-avg">{player.attributes.crossing}</span></div>
              <div className="stat-row"><span>Finalização</span><span className="stat-val stat-avg">{player.attributes.finishing}</span></div>
              <div className="stat-row"><span>Passe curto</span><span className="stat-val stat-great">{player.attributes.shortpassing}</span></div>
              <div className="stat-row"><span>Voleio</span><span className="stat-val stat-good">{player.attributes.volleys}</span></div>
              <div className="stat-row"><span>Condução</span><span className="stat-val stat-great">{player.attributes.dribbling}</span></div>
              <div className="stat-row"><span>Contr. bola</span><span className="stat-val stat-great">{player.attributes.ballcontrol}</span></div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
