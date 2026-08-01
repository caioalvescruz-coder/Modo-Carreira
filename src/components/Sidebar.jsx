import React from 'react';
import './Sidebar.css';

function Sidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'central', label: 'CENTRAL' },
    { id: 'elenco', label: 'ELENCO' },
    { id: 'calendario', label: 'CALENDÁRIO' },
    { id: 'base', label: 'BASE' },
    { id: 'transferencias', label: 'TRANSFERÊNCIAS' },
    { id: 'tatica', label: 'ANÁLISE TÁTICA' },
    { id: 'estatisticas', label: 'ESTATÍSTICAS' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>EA FC 26</h2>
      </div>
      <nav className="sidebar-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
