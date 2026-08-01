import React from 'react';
import './Header.css';

function Header({ teamName, coachName, currentDate }) {
  return (
    <header className="top-header">
      <div className="header-left">
        <div className="club-badge">
          {teamName.substring(0, 3).toUpperCase()}
        </div>
        <div className="club-info">
          <h1>{teamName}</h1>
          <span className="coach-name">Treinador: {coachName}</span>
        </div>
      </div>
      <div className="header-right">
        <div className="season-info">
          <span className="season-year">TEMPORADA 2026/2027</span>
          <span className="current-date">{currentDate}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
