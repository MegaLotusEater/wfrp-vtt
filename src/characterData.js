/**
 * WFRP 4e Player Character Data Structure
 * Fully expanded to support all character sheet tabs.
 */

export const playerCharacter = {
  // ── Header ──────────────────────────────────────────────────────────────
  name: "Dietrich",
  species: "Human (Reiklander)",
  gender: "Man",
  class: "Warriors",
  careerGroup: "Soldier",
  career: "Mercenary",
  status: "Brass 2",
  age: "",
  height: "",
  weight: "",
  hairColour: "",
  eyeColour: "",
  distinguishingMark: "",
  starSign: "",
  portrait: null,

  // ── Primary Statistics ───────────────────────────────────────────────────
  // Each stat has initial, advances, modifier; total is derived.
  stats: {
    WS:  { initial: 30, advances: 0, modifier: 0 },
    BS:  { initial: 30, advances: 0, modifier: 0 },
    S:   { initial: 30, advances: 0, modifier: 0 },
    T:   { initial: 30, advances: 0, modifier: 0 },
    I:   { initial: 30, advances: 0, modifier: 0 },
    Ag:  { initial: 30, advances: 0, modifier: 0 },
    Dex: { initial: 30, advances: 0, modifier: 0 },
    Int: { initial: 30, advances: 0, modifier: 0 },
    WP:  { initial: 30, advances: 0, modifier: 0 },
    Fel: { initial: 30, advances: 0, modifier: 0 }
  },

  // ── Movement ─────────────────────────────────────────────────────────────
  movement: { base: 4, walk: 8, run: 16 },

  // ── Secondary Characteristics ─────────────────────────────────────────────
  combat: {
    fortune:    0, fate:       2,
    resolve:    0, resilience: 1,
    woundsCurrent: 12, woundsMax: 12,
    criticalWounds: 0, maxCriticalWounds: 6,
    corruption: 0, maxCorruption: 10,
    advantage: 0
  },

  // ── Experience ────────────────────────────────────────────────────────────
  experience: { current: 0, spent: 0, total: 0 },

  // ── Careers ──────────────────────────────────────────────────────────────
  careers: [
    { name: "Mercenary", current: false, complete: false }
  ],

  // ── Skills ──────────────────────────────────────────────────────────────
  basicSkills: [
    { name: "Cool",           characteristic: "WP", advances: 0 },
    { name: "Dodge",          characteristic: "Ag", advances: 0 },
    { name: "Drive",          characteristic: "Ag", advances: 0 },
    { name: "Endurance",      characteristic: "T",  advances: 0 },
    { name: "Gamble",         characteristic: "Int",advances: 0 },
    { name: "Gossip",         characteristic: "Fel",advances: 0 },
    { name: "Haggle",         characteristic: "Fel",advances: 0 },
    { name: "Intimidate",     characteristic: "S",  advances: 0 },
    { name: "Intuition",      characteristic: "I",  advances: 0 },
    { name: "Leadership",     characteristic: "Fel",advances: 0 },
    { name: "Navigation",     characteristic: "I",  advances: 0 },
    { name: "Outdoor Survival",characteristic:"Int",advances: 0 },
    { name: "Perception",     characteristic: "I",  advances: 0 },
    { name: "Row",            characteristic: "S",  advances: 0 },
    { name: "Stealth",        characteristic: "Ag", advances: 0 }
  ],
  advancedSkills: [
    { name: "Melee (Basic)",  characteristic: "WS", advances: 0 },
    { name: "Ranged (Bow)",   characteristic: "BS", advances: 0 },
    { name: "Athletics",      characteristic: "Ag", advances: 0 }
  ],

  // Legacy flat skills map for game engine compatibility
  get skills() {
    const map = {};
    [...this.basicSkills, ...this.advancedSkills].forEach(s => { map[s.name] = s.advances; });
    return map;
  },
  slBonuses: {},

  // ── Talents ──────────────────────────────────────────────────────────────
  talents: [
    { name: "Ambidextrous", tests: "", timesTaken: "1/1" },
    { name: "Hardy",        tests: "", timesTaken: "1/1" }
  ],

  // ── Combat ───────────────────────────────────────────────────────────────
  weapons: [
    { name: "Hand Weapon (Sword)", group: "Melee (Basic)", damage: "SB+4", reach: "Average",        qualities: "", flaws: "", equipped: true  },
    { name: "Crossbow Pistol",     group: "Ranged (Crossbow)", damage: 7,  range: "10/20",          qualities: "", flaws: "", equipped: false }
  ],
  armour: [
    { name: "Leather Jack",   locations: "Body, Arms", AP: 1, qualities: "", flaws: "", worn: true  },
    { name: "Leather Hood",   locations: "Head",       AP: 1, qualities: "", flaws: "", worn: false }
  ],

  // ── Effects ──────────────────────────────────────────────────────────────
  conditions: {
    bleeding: 0, poisoned: 0, ablaze: 0, deafened: 0,
    stunned: 0, entangled: 0, fatigued: 0, blinded: 0,
    broken: 0, prone: false, surprised: false,
    unconscious: false, grappling: false, engaged: false
  },
  passiveEffects: [
    { name: "Ambidextrous", source: "Ambidextrous" },
    { name: "Hardy",        source: "Hardy"        }
  ],

  // ── Trappings / Inventory ────────────────────────────────────────────────
  money: { gc: 0, ss: 0, bp: 0 },
  inventory: [
    { category: "Ammunition",     name: "Crossbow Bolts", qty: 12, enc: 0  },
    { category: "Miscellaneous",  name: "Rope (10 yards)", qty: 1, enc: 1  }
  ],

  // ── Notes ─────────────────────────────────────────────────────────────────
  notes: ""
};

// Helper: Calculate the Tens digit (Bonus) for a stat
export function getStatBonus(statValue) {
  return Math.floor(statValue / 10);
}

// Derive total for a stat object
export function getStatTotal(statObj) {
  return statObj.initial + statObj.advances + statObj.modifier;
}

// Calculate max Wounds based on WFRP 4e formula (SBx2 + TB + WP bonus)
export function calculateMaxWounds(stats) {
  const sb = getStatBonus(getStatTotal(stats.S));
  const tb = getStatBonus(getStatTotal(stats.T));
  const wpb = getStatBonus(getStatTotal(stats.WP));
  return (sb * 2) + tb + wpb;
}
