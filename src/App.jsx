import React, { useState, useEffect } from 'react';
import { fetchDatabase } from './services/api';
import SquadDashboard from './components/SquadDashboard';
import { db, collection, onSnapshot } from './firebase';
import './App.css';

function App() {
  const [dbData, setDbData] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchDatabase();
      setDbData(data);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    // Listen to Firebase Overrides
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
    return <div className="error">Erro ao carregar o banco de dados. Certifique-se de exportar as tabelas para base_save e rodar o script parser_ueadbm.mjs.</div>;
  }

  // Merge overrides into roster
  const mergedRoster = dbData.roster?.map(player => {
    const playerOverrides = overrides[player.id];
    if (!playerOverrides) return player;
    
    // Merge nested attributes
    const mergedAttributes = { ...player.attributes };
    if (playerOverrides.skillmoves) mergedAttributes.skillmoves = playerOverrides.skillmoves;
    if (playerOverrides.weakfoot) mergedAttributes.weakfoot = playerOverrides.weakfoot;

    return {
      ...player,
      attributes: mergedAttributes,
      notes: playerOverrides.notes || ''
    };
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Manager FC 26</h1>
        <div className="team-info">
          <h2>{dbData.team?.name || 'Seu Time'}</h2>
          <span className="snapshot-date">Último Save: {new Date(dbData.snapshotDate).toLocaleString()}</span>
        </div>
      </header>
      
      <main className="app-main">
        <SquadDashboard roster={mergedRoster || []} />
      </main>
    </div>
  );
}

export default App;
