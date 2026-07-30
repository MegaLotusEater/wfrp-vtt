import React, { useState, useEffect } from 'react';
import { getStatTotal } from './characterData';

// ─────────────────────────────────────────────────────────────────────────────
// Tab content components
// ─────────────────────────────────────────────────────────────────────────────
function TabMain({ ch }) {
  const statKeys = ['WS','BS','S','T','I','Ag','Dex','Int','WP','Fel'];
  return (
    <div className="sheet-tab-content">
      {/* Stats table */}
      <table className="stats-table">
        <thead>
          <tr><th></th>{statKeys.map(k => <th key={k}>{k}</th>)}</tr>
        </thead>
        <tbody>
          <tr><td className="row-label">Initial</td>   {statKeys.map(k=><td key={k}>{ch.stats[k].initial}</td>)}</tr>
          <tr><td className="row-label">Advances</td>  {statKeys.map(k=><td key={k}>{ch.stats[k].advances}</td>)}</tr>
          <tr><td className="row-label">Modifier</td>  {statKeys.map(k=><td key={k}>{ch.stats[k].modifier}</td>)}</tr>
          <tr className="totals-row"><td className="row-label">Total</td>{statKeys.map(k=><td key={k}>{getStatTotal(ch.stats[k])}</td>)}</tr>
        </tbody>
      </table>

      {/* Movement + Fortune/Fate + Wounds */}
      <div className="secondary-row">
        <div className="sec-block">
          <div className="sec-value">{ch.movement.base}</div><div className="sec-label">Move</div>
          <div className="sec-value">{ch.movement.walk}</div><div className="sec-label">Walk</div>
          <div className="sec-value">{ch.movement.run}</div><div className="sec-label">Run</div>
        </div>
        <div className="sec-block">
          <div className="sec-pair"><span className="sec-label">Fortune</span><span className="sec-value">{ch.combat.fortune}</span></div>
          <div className="sec-pair"><span className="sec-label">Fate</span><span className="sec-value">{ch.combat.fate}</span></div>
          <div className="sec-pair"><span className="sec-label">Resolve</span><span className="sec-value">{ch.combat.resolve}</span></div>
          <div className="sec-pair"><span className="sec-label">Resilience</span><span className="sec-value">{ch.combat.resilience}</span></div>
        </div>
        <div className="sec-block wounds-block">
          <div className="sec-label">Wounds</div>
          <div className="sec-wounds">{ch.combat.woundsCurrent} / {ch.combat.woundsMax}</div>
        </div>
      </div>

      {/* Criticals / Corruption / Experience */}
      <div className="tertiary-row">
        <div className="tert-block">
          <span className="sec-label">Critical Wounds</span>
          <div className="tert-values"><span>{ch.combat.criticalWounds}</span><span>{ch.combat.maxCriticalWounds}</span></div>
        </div>
        <div className="tert-block">
          <span className="sec-label">Corruption</span>
          <div className="tert-values"><span>{ch.combat.corruption}</span><span>{ch.combat.maxCorruption}</span></div>
        </div>
        <div className="tert-block exp-block">
          <span className="sec-label">Experience</span>
          <div className="tert-values">
            <span>Current<br/><b>{ch.experience.current}</b></span>
            <span>Spent<br/><b>{ch.experience.spent}</b></span>
            <span>Total<br/><b>{ch.experience.total}</b></span>
          </div>
        </div>
      </div>

      {/* Careers */}
      <div className="section-header">
        <span>Careers</span><span>Current</span><span>Complete</span>
      </div>
      <div className="career-list">
        {ch.careers.map((c, i) => (
          <div key={i} className="career-row">
            <span className="career-name">{c.name}</span>
            <span>{c.current ? '✅' : '○'}</span>
            <span>{c.complete ? '✅' : '○'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabSkills({ ch }) {
  const statTotal = (key) => getStatTotal(ch.stats[key]);
  const skillTotal = (s) => statTotal(s.characteristic) + s.advances;

  return (
    <div className="sheet-tab-content scrollable-split">
      <div className="skill-column">
        <div className="skill-header-row"><span>Basic Skills</span><span>Char.</span><span>Adv.</span><span>Total</span></div>
        {ch.basicSkills.map((s, i) => (
          <div key={i} className={`skill-row ${s.advances > 0 ? 'trained' : ''}`}>
            <span>{s.name}</span>
            <span>{s.characteristic} {statTotal(s.characteristic)}</span>
            <span>{s.advances}</span>
            <span className="skill-total">{skillTotal(s)}</span>
          </div>
        ))}
      </div>
      <div className="skill-column">
        <div className="skill-header-row"><span>Grouped & Advanced Skills</span><span>Char.</span><span>Adv.</span><span>Total</span></div>
        {ch.advancedSkills.map((s, i) => (
          <div key={i} className={`skill-row ${s.advances > 0 ? 'trained' : ''}`}>
            <span>{s.name}</span>
            <span>{s.characteristic} {statTotal(s.characteristic)}</span>
            <span>{s.advances}</span>
            <span className="skill-total">{skillTotal(s)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabTalents({ ch }) {
  return (
    <div className="sheet-tab-content">
      <div className="talent-header-row">
        <span>Talents</span><span>Tests</span><span>Times Taken</span>
      </div>
      <div className="talent-list">
        {ch.talents.map((t, i) => (
          <div key={i} className="talent-row">
            <span className="talent-name">{t.name}</span>
            <span className="talent-tests">{t.tests}</span>
            <span className="talent-times">{t.timesTaken}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabCombat({ ch }) {
  return (
    <div className="sheet-tab-content">
      <div className="section-header"><span>Weapons</span><span>Group</span><span>Dmg</span><span>Range/Reach</span><span>Eq.</span></div>
      <div className="combat-list">
        {ch.weapons.map((w, i) => (
          <div key={i} className="combat-row">
            <span className="combat-name">{w.name}</span>
            <span>{w.group}</span>
            <span>{w.damage}</span>
            <span>{w.reach || w.range || '—'}</span>
            <span>{w.equipped ? '✅' : '○'}</span>
          </div>
        ))}
      </div>
      <div className="section-header" style={{marginTop:'1rem'}}><span>Armour</span><span>Locations</span><span>AP</span><span>Worn</span></div>
      <div className="combat-list">
        {ch.armour.map((a, i) => (
          <div key={i} className="combat-row">
            <span className="combat-name">{a.name}</span>
            <span>{a.locations}</span>
            <span>{a.AP}</span>
            <span>{a.worn ? '✅' : '○'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabEffects({ ch }) {
  const condList = [
    ['bleeding','Bleeding'],['poisoned','Poisoned'],['ablaze','Ablaze'],
    ['deafened','Deafened'],['stunned','Stunned'],['entangled','Entangled'],
    ['fatigued','Fatigued'],['blinded','Blinded'],['broken','Broken'],
    ['prone','Prone'],['surprised','Surprised'],['unconscious','Unconscious'],
    ['grappling','Grappling'],['engaged','Engaged']
  ];
  return (
    <div className="sheet-tab-content scrollable-split">
      {/* Left column: Conditions */}
      <div className="effects-conditions">
        {condList.map(([key, label]) => (
          <div key={key} className="condition-row">
            <span>{label}</span>
            <span className="condition-val">
              {typeof ch.conditions[key] === 'boolean'
                ? (ch.conditions[key] ? '✅' : '○')
                : ch.conditions[key]}
            </span>
          </div>
        ))}
      </div>

      {/* Right column: Effects sections */}
      <div className="effects-passive">
        {/* Temporary Effects */}
        <div className="skill-header-row"><span>Temporary Effects</span><span>Source</span></div>
        {(ch.temporaryEffects || []).length === 0 && (
          <div className="skill-row" style={{color:'#aaa',fontStyle:'italic'}}><span>None</span></div>
        )}
        {(ch.temporaryEffects || []).map((e, i) => (
          <div key={i} className="skill-row"><span>{e.name}</span><span>{e.source}</span></div>
        ))}

        {/* Injury */}
        <div className="skill-header-row" style={{marginTop:'0.5rem'}}><span>Injury</span><span>Location</span><span>Duration</span></div>
        {(ch.injuries || []).length === 0 && (
          <div className="skill-row" style={{color:'#aaa',fontStyle:'italic'}}><span>None</span></div>
        )}
        {(ch.injuries || []).map((e, i) => (
          <div key={i} className="skill-row"><span>{e.name}</span><span>{e.location}</span><span>{e.duration}</span></div>
        ))}

        {/* Criticals */}
        <div className="skill-header-row" style={{marginTop:'0.5rem'}}><span>Criticals</span><span>Location</span></div>
        {(ch.criticals || []).length === 0 && (
          <div className="skill-row" style={{color:'#aaa',fontStyle:'italic'}}><span>None</span></div>
        )}

        {/* Psychology */}
        <div className="skill-header-row" style={{marginTop:'0.5rem'}}><span>Psychology</span></div>
        {(ch.psychology || []).length === 0 && (
          <div className="skill-row" style={{color:'#aaa',fontStyle:'italic'}}><span>None</span></div>
        )}

        {/* Corruption & Mutations */}
        <div className="skill-header-row" style={{marginTop:'0.5rem'}}><span>Corruption & Mutations</span></div>
        {(ch.mutations || []).length === 0 && (
          <div className="skill-row" style={{color:'#aaa',fontStyle:'italic'}}><span>None</span></div>
        )}

        {/* Disease */}
        <div className="skill-header-row" style={{marginTop:'0.5rem'}}><span>Disease</span><span>Incubation</span><span>Duration</span></div>
        {(ch.diseases || []).length === 0 && (
          <div className="skill-row" style={{color:'#aaa',fontStyle:'italic'}}><span>None</span></div>
        )}

        {/* Passive Effects */}
        <div className="skill-header-row" style={{marginTop:'0.5rem'}}><span>Passive Effects</span><span>Source</span></div>
        {(ch.passiveEffects || []).map((e, i) => (
          <div key={i} className="skill-row"><span>{e.name}</span><span>{e.source}</span></div>
        ))}
        {(ch.passiveEffects || []).length === 0 && (
          <div className="skill-row" style={{color:'#aaa',fontStyle:'italic'}}><span>None</span></div>
        )}

        {/* Disabled Effects */}
        <div className="skill-header-row" style={{marginTop:'0.5rem'}}><span>Disabled Effects</span><span>Source</span></div>
        {(ch.disabledEffects || []).length === 0 && (
          <div className="skill-row" style={{color:'#aaa',fontStyle:'italic'}}><span>None</span></div>
        )}
      </div>
    </div>
  );
}

function TabTrappings({ ch }) {
  const grouped = {};
  ch.inventory.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });
  return (
    <div className="sheet-tab-content">
      {/* Money */}
      <div className="section-header">
        <span>Money</span><span>Qty.</span><span>Enc.</span>
      </div>
      <div className="trapping-row"><span>Gold Crowns</span><span>{ch.money.gc}</span><span>0.26</span></div>
      <div className="trapping-row"><span>Silver Shillings</span><span>{ch.money.ss}</span><span>0.02</span></div>
      <div className="trapping-row"><span>Brass Pennies</span><span>{ch.money.bp}</span><span>0.01</span></div>

      {/* Grouped inventory */}
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <div className="section-header"><span>{cat}</span><span>Qty.</span><span>Enc.</span></div>
          {items.map((item, i) => (
            <div key={i} className="trapping-row">
              <span>{item.name}</span><span>{item.qty}</span><span>{item.enc}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function TabNotes({ ch }) {
  return (
    <div className="sheet-tab-content">
      <textarea
        className="notes-textarea"
        defaultValue={ch.notes}
        placeholder="Notes about this character..."
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const TABS = ['Main','Skills','Talents','Combat','Effects','Trappings','Notes'];

function CharacterSheet({ character, onClose, onRoll }) {
  const [position, setPosition] = useState({ x: 80, y: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('Main');

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    const onMove = (e) => {
      if (isDragging) setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isDragging, dragOffset]);

  if (!character) return null;
  const ch = character;

  return (
    <div className="cs-window" style={{ left: position.x, top: position.y }}>

      {/* ── Title Bar ───────────────────────────────────────── */}
      <div className="cs-titlebar" onMouseDown={handleMouseDown}>
        <span>Player Character: {ch.name}</span>
        <button onClick={onClose} className="btn-close">×</button>
      </div>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="cs-header">
        <div className="cs-portrait">
          {ch.portrait ? <img src={ch.portrait} alt="Portrait" /> : <div className="portrait-placeholder">?</div>}
        </div>
        <div className="cs-bio">
          <div className="bio-row top">
            <div className="bio-field"><span className="bio-value">{ch.name || '—'}</span><span className="bio-label">Name</span></div>
            <div className="bio-field"><span className="bio-value">{ch.species || '—'}</span><span className="bio-label">Species</span></div>
            <div className="bio-field"><span className="bio-value">{ch.gender || '—'}</span><span className="bio-label">Gender</span></div>
          </div>
          <div className="bio-row">
            <div className="bio-field"><span className="bio-value">{ch.class || '—'}</span><span className="bio-label">Class</span></div>
            <div className="bio-field"><span className="bio-value">{ch.careerGroup || '—'}</span><span className="bio-label">Career Group</span></div>
            <div className="bio-field"><span className="bio-value">{ch.career || '—'}</span><span className="bio-label">Career</span></div>
          </div>
          <div className="bio-row">
            <div className="bio-field"><span className="bio-value">{ch.status || '—'}</span><span className="bio-label">Status</span></div>
            <div className="bio-field"><span className="bio-value">{ch.age || '—'}</span><span className="bio-label">Age</span></div>
            <div className="bio-field"><span className="bio-value">{ch.height || '—'}</span><span className="bio-label">Height</span></div>
            <div className="bio-field"><span className="bio-value">{ch.weight || '—'}</span><span className="bio-label">Weight</span></div>
            <div className="bio-field"><span className="bio-value">{ch.hairColour || '—'}</span><span className="bio-label">Hair Colour</span></div>
          </div>
          <div className="bio-row">
            <div className="bio-field"><span className="bio-value">{ch.eyeColour || '—'}</span><span className="bio-label">Eye Colour</span></div>
            <div className="bio-field"><span className="bio-value">{ch.distinguishingMark || '—'}</span><span className="bio-label">Distinguishing Mark</span></div>
            <div className="bio-field"><span className="bio-value">{ch.starSign || '—'}</span><span className="bio-label">Star Sign</span></div>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ─────────────────────────────────── */}
      <div className="cs-tabs">
        {TABS.map(t => (
          <button key={t} className={`cs-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────────────────── */}
      <div className="cs-body">
        {activeTab === 'Main'      && <TabMain      ch={ch} />}
        {activeTab === 'Skills'    && <TabSkills    ch={ch} />}
        {activeTab === 'Talents'   && <TabTalents   ch={ch} />}
        {activeTab === 'Combat'    && <TabCombat    ch={ch} />}
        {activeTab === 'Effects'   && <TabEffects   ch={ch} />}
        {activeTab === 'Trappings' && <TabTrappings ch={ch} />}
        {activeTab === 'Notes'     && <TabNotes     ch={ch} />}
      </div>

    </div>
  );
}

export default CharacterSheet;
