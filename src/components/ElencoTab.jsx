import React, { useState } from 'react';
import './ElencoTab.css';
import PlayerDetails from './PlayerDetails';

export default function ElencoTab({ roster }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'cards'
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // OVR sorting by default
  const sortedRoster = [...roster].sort((a, b) => (b.overall || 0) - (a.overall || 0));

  // Compute Highlights
  const bestOvr = sortedRoster.reduce((best, p) => (p.overall > (best?.overall || 0) ? p : best), null);
  const bestPot = sortedRoster.reduce((best, p) => (p.potential > (best?.potential || 0) ? p : best), null);
  
  // Calculate average age and total value
  const avgAge = sortedRoster.length ? (sortedRoster.reduce((sum, p) => sum + parseInt(p.age), 0) / sortedRoster.length).toFixed(1) : 0;
  
  // Sectors avg OVR
  const getSectorAvg = (positions) => {
    const players = sortedRoster.filter(p => positions.includes(p.position));
    if (!players.length) return 0;
    return Math.round(players.reduce((sum, p) => sum + p.overall, 0) / players.length);
  };

  const ataAvg = getSectorAvg(['ATA', 'SA', 'PD', 'PE']);
  const meiAvg = getSectorAvg(['MEI', 'MC', 'VOL', 'MD', 'ME']);
  const defAvg = getSectorAvg(['ZAG', 'LE', 'LD', 'L', 'ADD', 'ADE']);
  const golAvg = getSectorAvg(['GOL']);

  const getPosClass = (pos) => {
    if (['ATA', 'SA', 'PD', 'PE'].includes(pos)) return 'pos-atk';
    if (['MEI', 'MC', 'VOL', 'MD', 'ME'].includes(pos)) return 'pos-mid';
    if (['ZAG', 'LE', 'LD', 'L', 'ADD', 'ADE'].includes(pos)) return 'pos-def';
    return 'pos-gk';
  };

  const getOvrClass = (ovr) => {
    if (ovr >= 80) return 'ovr-high';
    if (ovr >= 70) return 'ovr-med';
    return 'ovr-low';
  };

  // Tracker Best Stats
  const topScorer = sortedRoster.reduce((best, p) => ((p.tracker?.Goals || 0) > (best?.tracker?.Goals || 0) ? p : best), null);
  const topAssister = sortedRoster.reduce((best, p) => ((p.tracker?.Assists || 0) > (best?.tracker?.Assists || 0) ? p : best), null);

  return (
    <div className="elenco-tab">
      <div className="elenco-header">
        <h2>HUB DO ELENCO COMPLETO</h2>
        <div className="view-toggles">
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>Lista</button>
          <button className={viewMode === 'cards' ? 'active' : ''} onClick={() => setViewMode('cards')}>Cards</button>
        </div>
      </div>

      <div className="overview-panels">
        <div className="panel">
          <h3>VISÃO GERAL</h3>
          <div className="panel-row"><span>Jogadores</span><span className="val-green">{sortedRoster.length}</span></div>
          <div className="panel-row"><span>Idade Média</span><span className="val-yellow">{avgAge}</span></div>
          <div className="panel-row"><span>Valor Total</span><span className="val-white">Calculando...</span></div>
        </div>

        <div className="panel">
          <h3>DESTAQUES TÉCNICOS</h3>
          <div className="panel-row">
            <span>Maior OVR</span>
            <span className="highlight-player">
              {bestOvr?.name} <span className="ovr-mini ovr-high">{bestOvr?.overall}</span> <span className="pot-mini ovr-high">{bestOvr?.potential}</span>
            </span>
          </div>
          <div className="panel-row">
            <span>Maior POT</span>
            <span className="highlight-player">
              {bestPot?.name} <span className="ovr-mini ovr-high">{bestPot?.overall}</span> <span className="pot-mini ovr-high">{bestPot?.potential}</span>
            </span>
          </div>
          <div className="panel-row">
            <span>Maior Evolução</span>
            <span className="highlight-player">N/D</span>
          </div>
        </div>

        <div className="panel">
          <h3>TEMPORADA ATUAL</h3>
          <div className="stats-row">
            <div className="stat-col">
              <span className="stat-title">ARTILHEIRO</span>
              <div className="stat-person">
                <div className="silhouette">👤</div>
                <div className="stat-info">
                  <span className="person-name">{topScorer?.name || 'Ninguém'}</span>
                  <span className="person-val">{topScorer?.tracker?.Goals || 0}</span>
                </div>
              </div>
            </div>
            <div className="stat-col">
              <span className="stat-title">LÍDER ASSIST.</span>
              <div className="stat-person">
                <div className="silhouette">👤</div>
                <div className="stat-info">
                  <span className="person-name">{topAssister?.name || 'Ninguém'}</span>
                  <span className="person-val val-yellow">{topAssister?.tracker?.Assists || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <h3>MÉDIA OVR POR SETOR</h3>
          <SectorBar label="ATA" value={ataAvg} color="#00a8ff" />
          <SectorBar label="MEI" value={meiAvg} color="#00ff66" />
          <SectorBar label="DEF" value={defAvg} color="#fbbf24" />
          <SectorBar label="GOL" value={golAvg} color="#ef4444" />
        </div>
      </div>

      <div className="filters-bar">
        {/* Futuramente: Filtros reais aqui */}
        <div className="filter-group">
          <span>/ STATUS:</span>
          <button className="active">TIT</button>
          <button>RES</button>
          <button>N/R</button>
        </div>
        <div className="filter-group">
          <span>/ POSIÇÃO:</span>
          <button>GOL</button>
          <button>ZAG</button>
          <button>MC</button>
          <button>ATA</button>
          {/* Etc */}
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>POSIÇÃO</th>
                <th>NOME</th>
                <th>#</th>
                <th>IDADE</th>
                <th>OVR</th>
                <th>POT</th>
                <th>VALOR</th>
                <th>MULTA</th>
                <th>SALÁRIO</th>
                <th>STATUS</th>
                <th>SITUAÇÃO</th>
                <th>PAPEL</th>
              </tr>
            </thead>
            <tbody>
              {sortedRoster.map((p, idx) => (
                <tr key={p.id} onClick={() => setSelectedPlayer(p)}>
                  <td><span className={`pos-badge ${getPosClass(p.position)}`}>{p.position}</span></td>
                  <td className="td-name">👤 {p.name} <span className="nation-code">{p.nationality}</span></td>
                  <td>{p.jerseyNumber || '-'}</td>
                  <td>{p.age}</td>
                  <td><span className={`ovr-box ${getOvrClass(p.overall)}`}>{p.overall}</span></td>
                  <td><span className={`pot-box ${getOvrClass(p.potential)}`}>{p.potential}</span></td>
                  <td>{p.valor || '€ -'}</td>
                  <td>{p.multa || '€ -'}</td>
                  <td>{p.wage ? `€${(p.wage/1000).toFixed(1)}K` : '-'}</td>
                  <td>{p.status}</td>
                  <td>{p.situacao}</td>
                  <td>{p.role || 'Crucial'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedPlayer && (
        <PlayerDetails player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}

function SectorBar({ label, value, color }) {
  return (
    <div className="sector-bar-container">
      <span className="sector-label">{label}</span>
      <div className="bar-bg">
        <div className="bar-fill" style={{ width: `${value}%`, backgroundColor: color }}></div>
      </div>
      <span className="sector-value">{value}</span>
    </div>
  );
}
