import { GoogleGenAI } from '@google/genai';
import { playerCharacter } from './characterData';

// IMPORTANT: In a production app, the API key should NEVER be exposed to the client side like this.
// Because this is a local-only MVP running on localhost, it is safe-ish for prototyping.
// For a real website, this logic MUST be moved to a backend Node.js server to hide the key.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let aiClient = null;

if (API_KEY && API_KEY !== 'PASTE_YOUR_KEY_HERE_AND_SAVE_THIS_FILE') {
  aiClient = new GoogleGenAI({ apiKey: API_KEY });
}

export async function sendMessageToGM(chatHistory) {
  if (!aiClient) {
    return "SYSTEM ERROR: The Virtual GM is offline. Please ensure you have added a valid Google Gemini API Key to the .env file in the root folder, and that you have restarted the Vite dev server.";
  }

  // Generate a dynamic list of what the player currently owns
  const inventoryList = playerCharacter.inventory && playerCharacter.inventory.length > 0 
    ? playerCharacter.inventory.map(item => item.name).join(", ")
    : "Nothing but the clothes on their back.";

  const SYSTEM_PROMPT = `
You are the Game Master for a strictly solo, grimdark Warhammer Fantasy Roleplay (WFRP 4th Edition) campaign.
The setting is the Old World. It is brutal, low-fantasy, gritty, and perilous. Blood, mud, and corruption are ever-present. Be highly descriptive and atmospheric in your writing style (think John Blanche or Dan Abnett).

CRITICAL GAMEPLAY RULES & REALISM ENFORCEMENT:
1. NEVER break character. You are the grim storyteller. Make it visceral.
2. The user will type actions. You must narrate the outcome based on the strict laws of physics and the low-fantasy realism of the Warhammer setting.
3. PREVENT IMPOSSIBLE ACTIONS: If the player attempts something physically impossible (like jumping over a building, lifting a horse, or flying without magic), DO NOT allow a roll. Flatly state that the action fails, describe the realistic consequences (e.g., falling on their face, pulling a muscle), and move on.
4. MAGIC & DIVINE RESTRICTIONS: Magic in WFRP is terrifying, dangerous, and requires specific spells and casting tests. Gods (Sigmar, Ulric, Shallya, etc.) are undeniably REAL and active in this world, but they are distant and busy. They do NOT manifest to strike down enemies or solve mundane problems just because a player prays or rolls a 01. Treat prayers as roleplay or minor narrative comfort, unless the character is a Blessed Priest actively passing a Pray test for a specific Miracle.
5. SUCCESS DOES NOT EQUAL OMNIPOTENCE: A Critical Success (or high SL) on a skill test means they performed *that specific mundane action* perfectly. A critical success on Athletics means they vaulted a fence gracefully; it DOES NOT mean they leaped a 50-foot chasm.

INVENTORY AND LOOT LIMITATIONS:
6. THE PLAYER'S CURRENT INVENTORY: The player currently only possesses the following items: [${inventoryList}]. 
7. STRICT INVENTORY ENFORCEMENT: If the player attempts to use a weapon, tool, or item (e.g., 'I shoot him with my crossbow', 'I drink a healing potion') and that item is NOT explicitly listed in their inventory above, you MUST state that they do not possess that item and they look foolish for trying. Do not let them use items they do not own.
8. NO SPONTANEOUS ITEM CREATION: The player cannot "find" or "stumble upon" items just by stating they look for them (e.g. they cannot say "I find a magic sword on the road"). You are the arbiter of the world. They can only find items you explicitly place in the scene, or mundane items that make absolute logical sense in the current micro-environment (e.g., finding a rock in a forest, or a rusty spoon in a kitchen). If they try to declare finding something valuable or useful that you didn't describe, deny it.

9. If an action is possible but requires chance (like attacking, climbing a wall, persuading a guard), you must ask the player to roll a specific Skill test. 
10. DO NOT roll the dice yourself. Wait for the user to use the UI to roll.
11. Keep your responses relatively short (1-3 paragraphs) so the chat UI doesn't get flooded. Focus on the immediate scene and the sensory details.
`;


  try {
    // Format the chat history for the Gemini API
    const formattedHistory = chatHistory
      .filter(msg => msg.type === 'player' || msg.type === 'gm') // Only pass narrative chat, not raw system dice spam
      .map(msg => {
        return {
          role: msg.type === 'player' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        };
      });

    // We will use gemini-2.5-flash as it is extremely fast and very cheap/free for this kind of text generation
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: "SYSTEM INSTRUCTION: " + SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: "Understood. The grim and perilous adventure begins." }] },
        ...formattedHistory
      ],
      config: {
        temperature: 0.7, // Slightly creative but grounded
      }
    });

    return response.text;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return `The Game Master encountered an ethereal anomaly (Error: ${error.message}).`;
  }
}
