import React, { useState, useEffect } from 'react';
import './SquadDashboard.css';
import PlayerDetails from './PlayerDetails';
import { Filter, Users, Activity, Loader, Shield, ChevronUp, ChevronDown } from 'lucide-react';

export default function SquadDashboard({ roster }) {
  const [filterPos, setFilterPos] = useState('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Ordene o elenco por OVR desc (padrão)
  const sortedRoster = [...roster].sort((a, b) => (b.overall || 0) - (a.overall || 0));
  
  const filteredRoster = filterPos === 'ALL' 
    ? sortedRoster 
    : sortedRoster.filter(p => {
        if (filterPos === 'ATA') return ['ATA', 'SA', 'PD', 'PE'].includes(p.position);
        if (filterPos === 'MEI') return ['MEI', 'MC', 'VOL', 'MD', 'ME'].includes(p.position);
        if (filterPos === 'DEF') return ['ZAG', 'LE', 'LD', 'L', 'ADD', 'ADE'].includes(p.position);
        if (filterPos === 'GOL') return p.position === 'GOL';
        return true;
      });

  return (
    <div className="squad-dashboard">
      <div className="dashboard-header">
        <h3 className="section-title">
          <Shield className="icon-title" size={24} /> 
          Elenco Atual ({roster.length} Jogadores)
        </h3>
        
        <div className="filters">
          <button className={filterPos === 'ALL' ? 'active' : ''} onClick={() => setFilterPos('ALL')}>Todos</button>
          <button className={filterPos === 'ATA' ? 'active' : ''} onClick={() => setFilterPos('ATA')}>Ataque</button>
          <button className={filterPos === 'MEI' ? 'active' : ''} onClick={() => setFilterPos('MEI')}>Meio</button>
          <button className={filterPos === 'DEF' ? 'active' : ''} onClick={() => setFilterPos('DEF')}>Defesa</button>
          <button className={filterPos === 'GOL' ? 'active' : ''} onClick={() => setFilterPos('GOL')}>Goleiros</button>
        </div>
      </div>

      <div className="players-grid">
        {filteredRoster.map(player => (
          <PlayerCard key={player.id} player={player} onClick={() => setSelectedPlayer(player)} />
        ))}
      </div>
      
      {selectedPlayer && (
        <PlayerDetails player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}

function PlayerCard({ player, onClick }) {
  // Simulação de evolução (futuramente virá da comparação de snapshots)
  // Para agora, vamos apenas mostrar o potencial como base para a cor, e deixar o +0 preparado
  const evolution = 0; // Ex: +1, +2
  const overall = player.overall || 0;
  
  const getOvrColor = (ovr) => {
    if (ovr >= 80) return '#10b981'; // Verde forte
    if (ovr >= 75) return '#fbbf24'; // Amarelo
    return '#ef4444'; // Vermelho
  };

  const getPositionClass = (pos) => {
    const atk = ['ATA', 'SA', 'PD', 'PE'];
    const mid = ['MEI', 'MC', 'VOL', 'MD', 'ME'];
    const def = ['ZAG', 'LE', 'LD', 'L', 'ADD', 'ADE'];
    if (atk.includes(pos)) return 'pos-atk';
    if (mid.includes(pos)) return 'pos-mid';
    if (def.includes(pos)) return 'pos-def';
    return 'pos-gk';
  };

  const isGK = player.position === 'GOL';

  const stats = isGK ? [
    { label: 'ELA', val: player.attributes.pacdiv },
    { label: 'MAN', val: player.attributes.shohan },
    { label: 'CHU', val: player.attributes.paskic },
    { label: 'REF', val: player.attributes.driref },
    { label: 'VEL', val: player.attributes.defspe },
    { label: 'POS', val: player.attributes.phypos },
  ] : [
    { label: 'RIT', val: player.attributes.pacdiv },
    { label: 'FIN', val: player.attributes.shohan },
    { label: 'PAS', val: player.attributes.paskic },
    { label: 'CON', val: player.attributes.driref },
    { label: 'DEF', val: player.attributes.defspe },
    { label: 'FIS', val: player.attributes.phypos },
  ];

  return (
    <div className="player-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="card-top">
        <div className={`player-ovr ${getPositionClass(player.position)}`}>
          <span className="ovr-value" style={{ color: getOvrColor(overall) }}>{overall}</span>
          <span className="ovr-pos">{player.position}</span>
        </div>
        <div className="player-info-basic">
          <div className="player-name">{player.name}</div>
          <span className="player-status">{player.statusElenco}</span>
        </div>
        <div className="player-evolution">
          {evolution > 0 ? <span className="evo-up"><ChevronUp size={14} />{evolution}</span> : 
           evolution < 0 ? <span className="evo-down"><ChevronDown size={14} />{Math.abs(evolution)}</span> : 
           <span className="evo-neutral">-</span>}
        </div>
      </div>
      
      <div className="card-stats">
        {stats.map((s, idx) => (
          <div key={idx} className="stat-item">
            <span className="stat-name">{s.label}</span>
            <span className="stat-value">{s.val}</span>
          </div>
        ))}
      </div>
      
      <div className="card-footer">
        <span>Idade: {player.age} anos</span>
        <span>Potencial: {player.potential}</span>
        <span>Contrato: {Math.floor(player.contract?.monthsLeft / 12)}a {player.contract?.monthsLeft % 12}m</span>
      </div>
    </div>
  );
}

function Stat({ name, value }) {
  const numValue = parseInt(value) || 0;
  const color = numValue >= 80 ? '#10b981' : numValue >= 70 ? '#fbbf24' : '#ef4444';
  
  return (
    <div className="stat-item">
      <span className="stat-name">{name}</span>
      <span className="stat-value" style={{ color }}>{numValue}</span>
    </div>
  );
}
