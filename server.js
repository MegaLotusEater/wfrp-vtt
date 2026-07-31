import http from 'node:http';
import { Buffer } from 'node:buffer';
import { GoogleGenAI } from '@google/genai';
import process from 'node:process';
import { playerCharacter } from './src/characterData.js';

const PORT = Number(process.env.PORT || 8787);
const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

const aiClient = API_KEY && API_KEY !== 'PASTE_YOUR_KEY_HERE_AND_SAVE_THIS_FILE'
  ? new GoogleGenAI({ apiKey: API_KEY })
  : null;

const SYSTEM_PROMPT = `
You are the Game Master for a strictly solo, grimdark Warhammer Fantasy Roleplay (WFRP 4th Edition) campaign.
The setting is the Old World. It is brutal, low-fantasy, gritty, and perilous. Blood, mud, and corruption are ever-present. Be highly descriptive and atmospheric in your writing style (think John Blanche or Dan Abnett).

CRITICAL GAMEPLAY RULES & REALISM ENFORCEMENT:
1. NEVER break character. You are the grim storyteller. Make it visceral.
2. The user will type actions. You must narrate the outcome based on the strict laws of physics and the low-fantasy realism of the Warhammer setting.
3. PREVENT IMPOSSIBLE ACTIONS: If the player attempts something physically impossible (like jumping over a building, lifting a horse, or flying without magic), DO NOT allow a roll. Flatly state that the action fails, describe the realistic consequences (e.g., falling on their face, pulling a muscle), and move on.
4. MAGIC & DIVINE RESTRICTIONS: Magic in WFRP is terrifying, dangerous, and requires specific spells and casting tests. Gods (Sigmar, Ulric, Shallya, etc.) are undeniably REAL and active in this world, but they are distant and busy. They do NOT manifest to strike down enemies or solve mundane problems just because a player prays or rolls a 01. Treat prayers as roleplay or minor narrative comfort, unless the character is a Blessed Priest actively passing a Pray test for a specific Miracle.
5. SUCCESS DOES NOT EQUAL OMNIPOTENCE: A Critical Success (or high SL) on a skill test means they performed that specific mundane action perfectly. A critical success on Athletics means they vaulted a fence gracefully; it DOES NOT mean they leaped a 50-foot chasm.

INVENTORY AND LOOT LIMITATIONS:
6. THE PLAYER'S CURRENT INVENTORY: The player currently only possesses the following items: [${playerCharacter.inventory.map(item => item.name).join(', ')}].
7. STRICT INVENTORY ENFORCEMENT: If the player attempts to use a weapon, tool, or item (e.g., 'I shoot him with my crossbow', 'I drink a healing potion') and that item is NOT explicitly listed in their inventory above, you MUST state that they do not possess that item and they look foolish for trying. Do not let them use items they do not own.
8. NO SPONTANEOUS ITEM CREATION: The player cannot "find" or "stumble upon" items just by stating they look for them (e.g. they cannot say "I find a magic sword on the road"). You are the arbiter of the world. They can only find items you explicitly place in the scene, or mundane items that make absolute logical sense in the current micro-environment (e.g., finding a rock in a forest, or a rusty spoon in a kitchen). If they try to declare finding something valuable or useful that you didn't describe, deny it.

9. If an action is possible but requires chance (like attacking, climbing a wall, persuading a guard), you must ask the player to roll a specific Skill test.
10. DO NOT roll the dice yourself. Wait for the user to use the UI to roll.
11. Keep your responses relatively short (1-3 paragraphs) so the chat UI doesn't get flooded. Focus on the immediate scene and the sensory details.
`;

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  response.end(JSON.stringify(payload));
}

function writeEmpty(response, statusCode) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  response.end();
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => {
      try {
        const rawBody = Buffer.concat(chunks).toString('utf8');
        resolve(rawBody ? JSON.parse(rawBody) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

function formatChatHistory(chatHistory) {
  return chatHistory
    .filter((message) => message.type === 'player' || message.type === 'gm')
    .map((message) => ({
      role: message.type === 'player' ? 'user' : 'model',
      parts: [{ text: message.text }],
    }));
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'OPTIONS') {
    writeEmpty(response, 204);
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
    writeJson(response, 200, { ok: true });
    return;
  }

  if (request.method !== 'POST' || requestUrl.pathname !== '/api/gm') {
    writeJson(response, 404, { error: 'Not found' });
    return;
  }

  if (!aiClient) {
    writeJson(response, 500, { error: 'GEMINI_API_KEY is missing from the server environment.' });
    return;
  }

  try {
    const body = await readRequestBody(request);
    const chatHistory = Array.isArray(body.chatHistory) ? body.chatHistory : null;

    if (!chatHistory) {
      writeJson(response, 400, { error: 'chatHistory must be an array.' });
      return;
    }

    const formattedHistory = formatChatHistory(chatHistory);
    const gmResponse = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `SYSTEM INSTRUCTION: ${SYSTEM_PROMPT}` }] },
        { role: 'model', parts: [{ text: 'Understood. The grim and perilous adventure begins.' }] },
        ...formattedHistory,
      ],
      config: {
        temperature: 0.7,
      },
    });

    writeJson(response, 200, { text: gmResponse.text || '' });
  } catch (error) {
    console.error('AI Generation Error:', error);
    writeJson(response, 500, {
      error: error instanceof Error ? error.message : 'Unknown AI generation error.',
    });
  }
});

server.listen(PORT, () => {
  console.log(`Gemini proxy listening on http://localhost:${PORT}`);
});
