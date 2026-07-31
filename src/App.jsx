import { useState, useRef, useEffect } from 'react'
import MapCanvas from './MapCanvas'
import { rollSkillTest, calculateDamage } from './gameEngine'
import { playerCharacter, getStatBonus, getStatTotal } from './characterData'
import { sendMessageToGM } from './llmService'
import TabbedSidebar from './TabbedSidebar'
import CharacterSheet from './CharacterSheet'

const currentScene = {
  title: 'The Old World',
  backgroundImageSrc: '/grimdark-hero.png',
  showScale: false
};

function readStoredValue(key, fallback) {
  const storedValue = localStorage.getItem(key);

  if (storedValue === null) {
    return fallback;
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    return storedValue;
  }
}

function writeStoredValue(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function App() {
  const [messages, setMessages] = useState(() => {
    const savedMessages = readStoredValue('wfrp-vtt-messages', null);
    if (savedMessages) return savedMessages;
    return [{ id: 1, sender: 'Game Master', text: 'The rain lashes against the cobblestones of Altdorf. You stand before the Black Boar inn. What do you do?', type: 'gm' }];
  });

  const [inputText, setInputText] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(() => {
    return readStoredValue('wfrp-vtt-selectedSkill', 'Melee (Basic)');
  });
  const [isGMDrafting, setIsGMDrafting] = useState(false);
  
  // New state for Foundry-style UI
  const [isChatOpen, setIsChatOpen] = useState(() => {
    return readStoredValue('wfrp-vtt-isChatOpen', true);
  });
  const [isSidebarPanelOpen, setIsSidebarPanelOpen] = useState(() => {
    return readStoredValue('wfrp-vtt-isSidebarPanelOpen', true);
  });
  const [openSheetTokenId, setOpenSheetTokenId] = useState(null);
  
  // State for temporary popups when chat is closed
  const [popupMessage, setPopupMessage] = useState(null);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    writeStoredValue('wfrp-vtt-messages', messages);
  }, [messages]);

  useEffect(() => {
    writeStoredValue('wfrp-vtt-selectedSkill', selectedSkill);
  }, [selectedSkill]);

  useEffect(() => {
    writeStoredValue('wfrp-vtt-isChatOpen', isChatOpen);
  }, [isChatOpen]);

  useEffect(() => {
    writeStoredValue('wfrp-vtt-isSidebarPanelOpen', isSidebarPanelOpen);
  }, [isSidebarPanelOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isGMDrafting) return;
    
    const newPlayerMsg = {
      id: Date.now(),
      sender: 'Player',
      text: inputText,
      type: 'player'
    };
    
    const updatedHistory = [...messages, newPlayerMsg];
    setMessages(updatedHistory);
    setInputText('');
    setIsGMDrafting(true);

    const gmResponseText = await sendMessageToGM(updatedHistory);

    const responseMsg = {
      id: Date.now() + 1,
      sender: 'Game Master',
      text: gmResponseText,
      type: 'gm'
    };

    setMessages(prev => [...prev, responseMsg]);
    
    // Trigger popup if chat is closed
    if (!isChatOpen) {
      setPopupMessage(responseMsg);
      // Auto dismiss after 8 seconds
      setTimeout(() => setPopupMessage(null), 8000);
    }
    
    setIsGMDrafting(false);
  };

  const handleRoll = (skillFromSheet) => {
    // If called directly from the sheet, it passes a string. Otherwise use the dropdown.
    const skillToRoll = typeof skillFromSheet === 'string' ? skillFromSheet : selectedSkill;
    if (!skillToRoll) return;

    const skillStatMap = {
      'Melee (Basic)': 'WS',
      'Dodge': 'Ag',
      'Endurance': 'T',
      'Intimidate': 'S',
      'Perception': 'I'
    };

    const statName = skillStatMap[skillToRoll] || 'WS';
    const statValue = getStatTotal(playerCharacter.stats[statName]);
    const skillAdvances = playerCharacter.basicSkills.find(s => s.name === skillToRoll)?.advances
                       ?? playerCharacter.advancedSkills.find(s => s.name === skillToRoll)?.advances
                       ?? 0;
    const slBonus = playerCharacter.slBonuses ? (playerCharacter.slBonuses[skillToRoll] || 0) : 0;

    const result = rollSkillTest(skillToRoll, statValue, skillAdvances, 0, slBonus);
    
    let extraMessage = "";
    if (skillToRoll.includes('Melee') && result.isSuccess) {
      const weapon = playerCharacter.weapons?.find(w => w.group?.includes('Melee'));
      const weaponDmg = weapon ? (typeof weapon.damage === 'number' ? weapon.damage : 4) : 4;
      const attackerSB = getStatBonus(getStatTotal(playerCharacter.stats.S));
      const damage = calculateDamage(weaponDmg, attackerSB, result.sl);
      extraMessage = ` Deals ${damage} Damage!`;
    }

    const rollMsg = {
      id: Date.now(),
      sender: 'System',
      text: `Rolled ${result.skill} (${result.roll} vs ${result.target}). SL: ${result.sl > 0 ? '+' : ''}${result.sl}. ${result.message}${extraMessage}`,
      type: 'system',
      isRoll: true,
      successLevel: result.sl
    };

    setMessages(prev => [...prev, rollMsg]);
    
    if (!isChatOpen) {
      setPopupMessage(rollMsg);
      setTimeout(() => setPopupMessage(null), 5000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="vtt-container foundry-layout">
      
      {/* 1. LAYER ZERO: Background Canvas (100vw / 100vh) */}
      <div className="foundry-canvas-layer">
        <MapCanvas
          backgroundImageSrc={currentScene.backgroundImageSrc}
          showScale={currentScene.showScale}
          onTokenDoubleClick={(id) => setOpenSheetTokenId(id)}
        />
      </div>

      {/* 2. TOP LEFT: Current Scene */}
      <header className="scene-title-plaque">
        <span className="nav-title">{currentScene.title}</span>
      </header>

      {/* Temporary Floating Popup (When Chat is Closed) */}
      {!isChatOpen && popupMessage && (
        <div className={`chat-popup ${popupMessage.type === 'gm' ? 'gm' : 'system'}`}>
          <span className="sender">{popupMessage.sender} says:</span>
          <p>{popupMessage.text}</p>
        </div>
      )}

      {/* 3. BOTTOM OVERLAY: Full Width Chat */}
      <section className={`foundry-chat-overlay ${isSidebarPanelOpen ? 'sidebar-open' : ''} ${!isChatOpen ? 'closed' : ''}`}>
        
        {/* Toggle Button */}
        <div className="chat-toggle-handle" onClick={() => setIsChatOpen(!isChatOpen)}>
          {isChatOpen ? '▼ Hide Chat' : '▲ Show Chat'}
        </div>
        <div className="chat-history">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.type} ${msg.isRoll ? 'roll' : ''}`}>
              <span className="sender">{msg.sender}:</span>
              <p>{msg.text}</p>
            </div>
          ))}
          {isGMDrafting && (
            <div className="message gm system-thinking">
               <span className="sender">Game Master is considering...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-controls">
          <div className="roll-group">
            <select 
              value={selectedSkill} 
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="skill-select"
            >
              {Object.keys(playerCharacter.skills).map(skillName => (
                <option key={skillName} value={skillName}>{skillName}</option>
              ))}
            </select>
            <button className="btn-roll" onClick={handleRoll}>Roll</button>
          </div>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="I enter the inn cautiously..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="btn-send" onClick={handleSend}>Send</button>
          </div>
        </div>
      </section>

      {/* 4. RIGHT OVERLAY: Tabbed Sidebar */}
      <TabbedSidebar playerCharacter={playerCharacter} onActiveTabChange={(tab) => setIsSidebarPanelOpen(tab !== null)} />

      {/* 5. DRAGGABLE CHARACTER SHEET */}
      {openSheetTokenId && (
        <CharacterSheet 
          character={playerCharacter} 
          onClose={() => setOpenSheetTokenId(null)}
          onRoll={handleRoll}
        />
      )}

    </div>
  )
}

export default App
