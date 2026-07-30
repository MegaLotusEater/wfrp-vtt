import React, { useState } from 'react';
import { getStatTotal } from './characterData';

function TabbedSidebar({ playerCharacter, onActiveTabChange }) {
  // 'null' means the sidebar is closed. A string means that tab is open.
  const [activeTab, setActiveTab] = useState('actors');

  const toggleTab = (tabName) => {
    const next = activeTab === tabName ? null : tabName;
    setActiveTab(next);
    if (onActiveTabChange) onActiveTabChange(next);
  };

  return (
    <aside className="foundry-tabbed-sidebar">
      
      {/* Expanding Content Panel */}
      <div className={`sidebar-panel ${activeTab !== null ? 'open' : 'closed'}`}>
        
        {/* ACTORS TAB CONTENT */}
        {activeTab === 'actors' && (
          <div className="sidebar-content">
            <h2>{playerCharacter?.name || 'Dietrich'}</h2>
            <div className="stats-vertical">
              <div className="stat-row">
                <span title="Weapon Skill">WS: {getStatTotal(playerCharacter.stats.WS)}</span>
                <span title="Ballistic Skill">BS: {getStatTotal(playerCharacter.stats.BS)}</span>
                <span title="Strength">S: {getStatTotal(playerCharacter.stats.S)}</span>
              </div>
              <div className="stat-row">
                <span title="Toughness">T: {getStatTotal(playerCharacter.stats.T)}</span>
                <span title="Agility">Ag: {getStatTotal(playerCharacter.stats.Ag)}</span>
                <span title="Intelligence">I: {getStatTotal(playerCharacter.stats.I)}</span>
              </div>
              <div className="stat-row highlight" style={{marginTop: '1rem'}}>
                <span title="Wounds (Health)">Wounds: {playerCharacter.combat.woundsCurrent}/{playerCharacter.combat.woundsMax}</span>
              </div>
              <div className="stat-row highlight">
                <span title="Fate">Fate: {playerCharacter.combat.fate}</span>
                <span title="Resilience">Res: {playerCharacter.combat.resilience}</span>
              </div>
            </div>
            
            <div style={{marginTop: '2rem', textAlign: 'center', color: 'var(--color-accent-gold)', fontSize: '0.8rem', opacity: 0.7}}>
              <p>Double-click tokens on the map to open detailed sheets. (Coming Soon)</p>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== 'actors' && activeTab !== null && (
          <div className="sidebar-content">
            <h2 style={{textTransform: 'capitalize'}}>{activeTab}</h2>
            <p style={{textAlign: 'center', opacity: 0.5, marginTop: '2rem'}}>Construction in progress...</p>
          </div>
        )}
      </div>

      {/* Persistent Icon Column */}
      <nav className="sidebar-icon-strip">
        <button 
          className={`icon-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => toggleTab('chat')}
          title="Chat Messages"
        >
          💬
        </button>
        <button 
          className={`icon-btn ${activeTab === 'combat' ? 'active' : ''}`}
          onClick={() => toggleTab('combat')}
          title="Combat Encounters"
        >
          ⚔️
        </button>
        <button 
          className={`icon-btn ${activeTab === 'actors' ? 'active' : ''}`}
          onClick={() => toggleTab('actors')}
          title="Actors & Characters"
        >
          👤
        </button>
        <div className="icon-spacer"></div>
        <button 
          className={`icon-btn ${activeTab === 'compendium' ? 'active' : ''}`}
          onClick={() => toggleTab('compendium')}
          title="Compendium Packs"
        >
          📚
        </button>
        <button 
          className={`icon-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => toggleTab('settings')}
          title="Game Settings"
        >
          ⚙️
        </button>
      </nav>

    </aside>
  );
}

export default TabbedSidebar;
