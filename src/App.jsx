import React, { useState, useEffect } from 'react';
import { fetchDatabase, fetchTrackerStats } from './services/api';
import ElencoTab from './components/ElencoTab';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { db, collection, onSnapshot } from './firebase';
import './App.css';

function App() {
  const [dbData, setDbData] = useState(null);
  const [trackerStats, setTrackerStats] = useState({});
  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('elenco');

  useEffect(() => {
    async function loadData() {
      const data = await fetchDatabase();
      const tStats = await fetchTrackerStats();
      setDbData(data);
      setTrackerStats(tStats);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'players'), (snapshot) => {
      const data = {};
      snapshot.forEach(doc => {
        data[doc.id] = doc.data();
      });
      setOverrides(data);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Carregando dados do EA FC...</div>;
  }

  if (!dbData) {
    return <div className="error">Erro ao carregar o banco de dados.</div>;
  }

  const mergedRoster = dbData.roster?.map(player => {
    const playerOverrides = overrides[player.id];
    const pTracker = trackerStats[player.name];

    const mergedAttributes = { ...player.attributes };
    if (playerOverrides) {
      if (playerOverrides.skillmoves) mergedAttributes.skillmoves = playerOverrides.skillmoves;
      if (playerOverrides.weakfoot) mergedAttributes.weakfoot = playerOverrides.weakfoot;
    }

    return {
      ...player,
      attributes: mergedAttributes,
      tracker: pTracker || null,
      notes: playerOverrides?.notes || '',
      status: playerOverrides?.status || 'Não Definido',
      situacao: playerOverrides?.situacao || 'Elenco',
      valor: playerOverrides?.valor || '',
      multa: playerOverrides?.multa || '',
      playstyles: playerOverrides?.playstyles || [],
      dedicacaoAtaque: playerOverrides?.dedicacaoAtaque || 'Média',
      dedicacaoDefesa: playerOverrides?.dedicacaoDefesa || 'Média',
    };
  });

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="main-content">
        <Header 
          teamName={dbData.team?.name || 'Seu Clube FC'} 
          coachName="Manager" 
          currentDate="15 AGO 2026" 
        />
        
        <main className="tab-content">
          {activeTab === 'elenco' && <ElencoTab roster={mergedRoster || []} />}
          {activeTab === 'central' && <div className="placeholder-tab"><h2>Central</h2><p>Visão geral da carreira em breve.</p></div>}
          {activeTab === 'calendario' && <div className="placeholder-tab"><h2>Calendário</h2><p>Jogos e agenda.</p></div>}
          {activeTab === 'base' && <div className="placeholder-tab"><h2>Base</h2><p>Academia de jovens.</p></div>}
          {activeTab === 'transferencias' && <div className="placeholder-tab"><h2>Transferências</h2><p>Negociações e olheiros.</p></div>}
          {activeTab === 'tatica' && <div className="placeholder-tab"><h2>Análise Tática</h2><p>Esquemas e táticas.</p></div>}
          {activeTab === 'estatisticas' && <div className="placeholder-tab"><h2>Estatísticas</h2><p>Dados consolidados da temporada.</p></div>}
        </main>
      </div>
    </div>
  );
}

export default App;

