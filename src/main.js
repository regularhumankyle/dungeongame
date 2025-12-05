// src/main.js
import { GAME_DATA, CELL_SIZE } from './data.js';
import { gameState, selectedClasses, selectedVictory, pickRandom, drawCard } from './state.js';
import { log, combatLog, showModal, updateUI } from './ui.js';

// --- GAME LOGIC ---

function buildDecks() {
    let roomPool = [];
    Object.values(GAME_DATA.mapCards).forEach(room => {
        if (room.id === 'dungeonEntrance' || room.id.includes('boss')) return;
        const qty = room.quantity || 1;
        for(let i=0; i<qty; i++) roomPool.push(room);
    });

    // Shuffle
    for (let i = roomPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [roomPool[i], roomPool[j]] = [roomPool[j], roomPool[i]];
    }

    const midIndex = Math.floor(roomPool.length / 2);
    roomPool.splice(midIndex, 0, GAME_DATA.mapCards.room_mid_boss);
    roomPool.push(GAME_DATA.mapCards.room_final_boss);
    gameState.decks.rooms = roomPool;

    gameState.decks.corridors = [];
    Object.values(GAME_DATA.corridors).forEach(corr => {
        const qty = corr.quantity || 1;
        for(let i=0; i<qty; i++) gameState.decks.corridors.push(corr);
    });
    // Shuffle Corridors
    for (let i = gameState.decks.corridors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.decks.corridors[i], gameState.decks.corridors[j]] = [gameState.decks.corridors[j], gameState.decks.corridors[i]];
    }
    gameState.stats.totalRooms = gameState.decks.rooms.length;
}

function getCardAt(gx, gy) {
    for(const key in gameState.mapLayout) {
        const card = gameState.mapLayout[key];
        if (gx >= card.x && gx < card.x + 3 && gy >= card.y && gy < card.y + 3) return card;
    }
    return null;
}

function getCellAt(gx, gy) {
    const card = getCardAt(gx, gy);
    if(card) return card.grid[(gy - card.y) * 3 + (gx - card.x)];
    return null;
}

function isWallBlocking(cell, dx, dy) {
    if (!cell) return false;
    if (dy === -1 && cell.walls.includes('top')) return true;
    if (dy === 1 && cell.walls.includes('bottom')) return true;
    if (dx === -1 && cell.walls.includes('left')) return true;
    if (dx === 1 && cell.walls.includes('right')) return true;
    return false;
}

function placeCard(cardData, gx, gy) {
    const key = `${gx},${gy}`;
    const newCard = { ...cardData, x: gx, y: gy, isLocked: cardData.locked };
    gameState.mapLayout[key] = newCard;
    
    if (cardData.type === 'room') {
        gameState.stats.roomsPlaced++;
        if (cardData.id === 'room_mid_boss') {
            const mData = { ...GAME_DATA.monsterDeck.find(m => m.name === 'Minotaur') };
            mData.currentHp = mData.hp;
            gameState.tokens[`${gx+1},${gy+1}`] = { type: 'monster', revealed: true, monsterData: mData };
        } else if (cardData.id === 'room_final_boss') {
            const mData = { ...GAME_DATA.monsterDeck.find(m => m.name === 'Red Dragon') };
            mData.currentHp = mData.hp;
            gameState.tokens[`${gx+1},${gy+1}`] = { type: 'monster', revealed: true, monsterData: mData };
        } else {
            generateTokensForCard(newCard, gx, gy);
        }
    }
}

function generateTokensForCard(cardData, gx, gy) {
    if (cardData.id === 'dungeonEntrance' || cardData.id.includes('boss')) return;
    
    const availableSpots = [];
    cardData.grid.forEach((cell, i) => { if (cell && cell.type !== 'void') availableSpots.push(i); });
    
    // Shuffle spots
    for(let i=availableSpots.length-1; i>0; i--){
        const j = Math.floor(Math.random()*(i+1));
        [availableSpots[i], availableSpots[j]] = [availableSpots[j], availableSpots[i]];
    }
    
    let placedKey = false;
    availableSpots.forEach(idx => {
        const tx = gx + (idx % 3);
        const ty = gy + Math.floor(idx / 3);
        const lx = idx % 3; const ly = Math.floor(idx/3);
        const isEdge = (lx === 0 || lx === 2 || ly === 0 || ly === 2);
        
        let type = 'safe';
        let safeChance = isEdge ? 0.7 : 0.4; 

        if (cardData.locked && !placedKey && !isEdge) { type = 'key'; placedKey = true; }
        else {
            const roll = Math.random();
            if (roll < (1 - safeChance)) {
                const dangerRoll = Math.random();
                if (dangerRoll < 0.5) type = 'monster';       
                else if (dangerRoll < 0.75) type = 'loot';    
                else if (dangerRoll < 0.9) type = 'event';    
                else type = 'shop';    
            }
        }
        if (cardData.locked && !placedKey && idx === availableSpots[availableSpots.length-1]) { type = 'key'; }
        gameState.tokens[`${tx},${ty}`] = { type: type, revealed: false, monsterData: null };
    });
}

function attemptPlaceCard(gx, gy, entryDx, entryDy, type) {
    const gridX = Math.floor(gx / 3) * 3; const gridY = Math.floor(gy / 3) * 3;
    if (getCellAt(gridX+1, gridY+1)) return false; 
    
    if (type === 'room') {
        if (gameState.decks.rooms.length === 0) return false;
        const nextCard = gameState.decks.rooms[0];
        const cell = nextCard.grid[(gy - gridY) * 3 + (gx - gridX)];
        if (cell && cell.type !== 'void' && !isWallBlocking(cell, entryDx, entryDy)) {
            placeCard(nextCard, gridX, gridY);
            gameState.decks.rooms.shift();
            return true;
        }
        return false; 
    } else {
        for(let i=0; i<gameState.decks.corridors.length; i++) {
            const c = gameState.decks.corridors[i];
            const cell = c.grid[(gy - gridY) * 3 + (gx - gridX)];
            if (cell && cell.type !== 'void' && !isWallBlocking(cell, entryDx, entryDy)) {
                placeCard(c, gridX, gridY);
                gameState.decks.corridors.splice(i, 1); 
                return true;
            }
        }
    }
    return false;
}

function movePlayer(dx, dy) {
    if (gameState.modalOpen) return;
    const p = gameState.players[gameState.currentPlayerIndex];
    if (p.moves <= 0) { log("No moves left."); return; }

    const tx = p.x + dx; const ty = p.y + dy;
    const currentCell = getCellAt(p.x, p.y);
    const currentCard = getCardAt(p.x, p.y);
    const targetCard = getCardAt(tx, ty);

    if (isWallBlocking(currentCell, dx, dy)) { log("Blocked by wall."); return; }
    if (targetCard !== currentCard && currentCard && currentCard.isLocked) { log("Door is Locked!"); return; }
    if (!targetCard && currentCard && currentCard.isLocked) { log("Door is Locked!"); return; }

    if (!targetCard) {
        if (Math.abs(dx) + Math.abs(dy) > 1) { log("No diagonal exploration."); return; }
        const typeToFind = (currentCard.type === 'room') ? 'corridor' : 'room';
        if (!attemptPlaceCard(tx, ty, -dx, -dy, typeToFind)) { log("Blocked path."); return; }
        if (typeToFind === 'room') gameState.victory.stats.roomsCleared++;
    } else {
        const tCell = getCellAt(tx, ty);
        if (!tCell || tCell.type === 'void') { log("No floor there."); return; }
        if (isWallBlocking(tCell, -dx, -dy)) { log("Blocked by target wall."); return; }
    }

    const oldCard = getCardAt(p.x, p.y);
    p.x = tx; p.y = ty; p.moves--;
    p.fledTokenKey = null;
    const newCard = getCardAt(tx, ty); 

    updateUI(); 
    centerCameraOnPlayer();

    if (newCard && newCard !== oldCard && newCard.isLocked) {
        let msg = "The door slams shut behind you! Find the Key.";
        if (newCard.id.includes('boss')) msg = "The heavy doors seal shut.";
        showModal("LOCKED ROOM!", `You entered ${newCard.name}.`, msg);
        gameState.pendingTokenResolution = { x: tx, y: ty };
        return;
    }

    const tokenKey = `${tx},${ty}`;
    const token = gameState.tokens[tokenKey];
    if (token) {
        token.revealed = true;
        updateUI();
        setTimeout(() => resolveToken(token, p, tokenKey), 200); 
    }
}

function resolveToken(token, p, key) {
    if (token.type === 'safe') {
        log("The room is quiet.");
        delete gameState.tokens[key];
        updateUI();
        return; 
    }
    if (token.type === 'monster') {
        if (!token.monsterData) {
            token.monsterData = { ...drawCard(GAME_DATA.monsterDeck) };
            token.monsterData.currentHp = token.monsterData.hp;
        }
        startCombat(token.monsterData, key, gameState.currentPlayerIndex);
        return;
    }

    gameState.pendingTokenRemoval = key; 
    const modalOpts = document.getElementById("modal-options");
    document.getElementById("modal-close-btn").classList.remove("hidden");
    
    if (token.type === 'loot') {
        const isItem = Math.random() > 0.7;
        if (isItem) {
                const item = drawCard(GAME_DATA.itemDeck);
                p.inventory.push(item.name);
                showModal("Loot!", "You found an item!", `You got: ${item.name}`);
                checkVictory();
        } else {
            p.gold += 5;
            showModal("Loot!", "You found a pouch.", "You found 5 Pennies.");
            checkVictory();
        }
    } else if (token.type === 'event') {
        const event = drawCard(GAME_DATA.eventDeck);
        if(event.effect.includes("Damage")) p.hp = Math.max(0, p.hp - 1);
        else if (event.effect.includes("Turn Ends")) p.moves = 0;
        showModal("Event Triggered!", event.name, `${event.desc} (${event.effect})`);
    } else if (token.type === 'key') {
        log("KEY FOUND!");
        const card = getCardAt(p.x, p.y);
        if (card && card.isLocked) {
            card.isLocked = false; 
            showModal("Key Found!", "The doors unlock.", "You may now exit this room.");
        } else {
            showModal("Key Found", "It doesn't fit anything here.", "Kept for later.");
        }
    } else if (token.type === 'shop') {
        gameState.pendingTokenRemoval = null; 
        if (!token.shopItems) token.shopItems = [drawCard(GAME_DATA.itemDeck), drawCard(GAME_DATA.itemDeck)];
        showModal("Merchant", `You have ${p.gold} Pennies.`, "Buy something?");
        document.getElementById("modal-close-btn").classList.add("hidden"); 
        
        modalOpts.innerHTML = "";
        token.shopItems.forEach(item => {
            const btn = document.createElement('button');
            btn.className = "w-full bg-gray-700 hover:bg-gray-600 p-3 rounded border border-gray-500 flex justify-between";
            btn.innerHTML = `<span>${item.name} (${item.desc})</span> <span class="text-yellow-400">${item.cost}G</span>`;
            btn.addEventListener('click', () => {
                if(p.gold >= item.cost) {
                    p.gold -= item.cost; p.inventory.push(item.name); log(`Bought ${item.name}`);
                    updateUI(); 
                    document.getElementById('modal-backdrop').classList.add('hidden'); gameState.modalOpen = false;
                    checkVictory();
                } else { alert("Not enough gold!"); }
            });
            modalOpts.appendChild(btn);
        });
        const leaveBtn = document.createElement('button');
        leaveBtn.className = "w-full bg-red-900 hover:bg-red-800 p-3 rounded mt-4";
        leaveBtn.innerText = "Leave Shop";
        leaveBtn.addEventListener('click', () => { document.getElementById('modal-backdrop').classList.add('hidden'); gameState.modalOpen = false; });
        modalOpts.appendChild(leaveBtn);
    }
    updateUI();
}

// --- SETUP FUNCTIONS ---
function renderSetup() {
    const grid = document.getElementById('class-selection-grid');
    grid.innerHTML = ''; 

    Object.values(GAME_DATA.classes).forEach(cls => {
        const el = document.createElement('div');
        el.className = 'class-card bg-gray-800 p-4 rounded border border-gray-600 text-white';
        el.innerHTML = `<h3 class="font-bold text-lg">${cls.name}</h3><p class="text-sm">HP: ${cls.hp} | ATK: ${cls.atk}</p><p class="text-xs text-gray-400">AGI: ${cls.agi} | ARM: ${cls.arm}</p>`;
        el.onclick = () => {
            if (selectedClasses.has(cls.id)) { selectedClasses.delete(cls.id); el.classList.remove('selected'); }
            else if (selectedClasses.size < 4) { selectedClasses.add(cls.id); el.classList.add('selected'); }
            updateStartButton();
        };
        grid.appendChild(el);
    });

    const vGrid = document.getElementById('victory-selection-grid');
    vGrid.innerHTML = '';
    GAME_DATA.victoryConditions.forEach(vc => {
        const el = document.createElement('div');
        el.className = 'victory-card text-white';
        el.innerHTML = `<h3 class="font-bold text-yellow-400">${vc.name}</h3><p class="text-sm text-gray-300">${vc.desc}</p>`;
        el.onclick = () => {
            const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
            const limit = parseInt(difficulty);
            if (selectedVictory.has(vc.id)) {
                 selectedVictory.delete(vc.id); el.classList.remove('selected');
            } else {
                if (selectedVictory.size >= limit) {
                    const first = selectedVictory.values().next().value;
                    selectedVictory.delete(first);
                    Array.from(vGrid.children).forEach(child => {
                        if(child.innerText.includes(GAME_DATA.victoryConditions.find(v=>v.id===first).name)) child.classList.remove('selected');
                    });
                }
                selectedVictory.add(vc.id); el.classList.add('selected');
            }
            updateStartButton();
        };
        vGrid.appendChild(el);
    });
}

function updateStartButton() {
    const btn = document.getElementById('start-game-btn');
    const err = document.getElementById('setup-error-msg');
    const diff = parseInt(document.querySelector('input[name="difficulty"]:checked').value);
    
    let valid = true;
    let msg = "";
    if (selectedClasses.size === 0) { valid = false; msg = "Select at least 1 Class."; }
    else if (selectedVictory.size !== diff) { valid = false; msg = `Select exactly ${diff} Victory Condition(s).`; }
    
    btn.disabled = !valid;
    err.innerText = msg;
}

function startGame() {
    const ids = Array.from(selectedClasses);
    const vicIds = Array.from(selectedVictory);

    gameState.players = ids.map((id, i) => ({
        id: `p${i+1}`, class: GAME_DATA.classes[id], 
        hp: GAME_DATA.classes[id].hp, maxHp: GAME_DATA.classes[id].hp,
        gold: 5, moves: 1, x: 1, y: 1, inventory: [], fledTokenKey: null 
    }));

    gameState.victory.required = vicIds;
    gameState.mapLayout = {}; gameState.tokens = {};
    gameState.stats.roomsPlaced = 0;
    
    buildDecks(); 
    placeCard(GAME_DATA.mapCards.dungeonEntrance, 0, 0);

    gameState.currentPlayerIndex = 0;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    updateUI(); centerCameraOnPlayer(); log("Dungeon initialized.");
}

// --- COMBAT & TURN LOGIC ---
function startCombat(m, k, pid) {
    gameState.combat = { active: true, monster: m, tokenKey: k, playerIndex: pid };
    document.getElementById('combat-backdrop').classList.remove('hidden');
    document.getElementById('combat-actions').classList.remove('hidden');
    document.getElementById('combat-continue-btn').classList.add('hidden');
    document.getElementById('game-log').innerHTML = ''; 
    updateCombatUI(); combatLog(`A ${m.name} draws near!`);
}

function updateCombatUI() {
    const m = gameState.combat.monster; const p = gameState.players[gameState.combat.playerIndex];
    document.getElementById('combat-monster-name').innerText = m.name;
    document.getElementById('combat-monster-sprite').innerText = m.sprite;
    const hpPct = Math.max(0, (m.currentHp / m.hp) * 100);
    document.getElementById('combat-monster-hp').style.width = `${hpPct}%`;
    document.getElementById('combat-monster-stats').innerText = `HP: ${Math.max(0, m.currentHp)}/${m.hp} | AGI: ${m.agi} | ARM: ${m.arm}`;
    const tokenEl = document.getElementById('combat-player-token');
    tokenEl.className = `w-16 h-16 rounded-full border-4 border-white flex items-center justify-center font-bold text-xl token-${p.class.id}`;
    tokenEl.innerText = `P${gameState.combat.playerIndex + 1}`;
    document.getElementById('combat-player-name').innerText = p.class.name;
    document.getElementById('combat-player-stats').innerText = `HP: ${p.hp}/${p.maxHp} | ATK: ${p.class.atk} | AGI: ${p.class.agi}`;
}

function runCombatRound(action) {
    const p = gameState.players[gameState.combat.playerIndex];
    const m = gameState.combat.monster;
    document.getElementById('combat-actions').classList.add('hidden');
    
    if (action === 'attack') {
        let atk = p.class.atk; if(p.inventory.includes("Iron Sword")) atk++;
        const roll = Math.floor(Math.random()*6)+1 + Math.floor(Math.random()*6)+1;
        combatLog(`Rolled ${roll} + ATK ${atk} = ${roll+atk}`);
        if(roll+atk >= m.agi) {
            const dmg = Math.max(1, atk - m.arm);
            m.currentHp -= dmg;
            combatLog(`HIT! ${dmg} damage.`);
        } else combatLog("MISS!");
    } else if (action === 'item') { 
        const idx = p.inventory.indexOf("Potion");
        if (idx > -1) {
            p.inventory.splice(idx, 1);
            p.hp = Math.min(p.maxHp, p.hp + 5);
            combatLog(`You drank a potion. Recovered 5 HP.`);
        }
    }

    updateCombatUI();
    if(m.currentHp <= 0) { setTimeout(() => { combatLog("VICTORY!"); document.getElementById('combat-continue-btn').classList.remove('hidden'); }, 1000); return; }
    
    setTimeout(() => {
        const roll = Math.floor(Math.random()*6)+1 + Math.floor(Math.random()*6)+1;
        if(roll+m.atk >= p.class.agi) {
            const dmg = Math.max(1, m.atk - p.class.arm);
            p.hp -= dmg;
            combatLog(`${m.name} hits for ${dmg}!`);
        } else combatLog(`${m.name} missed!`);
        updateCombatUI();
        if(p.hp <= 0) { combatLog("Collapsed..."); setTimeout(endCombatRound, 2000); }
        else setTimeout(endCombatRound, 1000);
    }, 1000);
}

function endCombatRound() {
    const m = gameState.combat.monster;
    if (m.currentHp <= 0) {
        delete gameState.tokens[gameState.combat.tokenKey];
        gameState.players[gameState.combat.playerIndex].gold += 2;
        gameState.victory.stats.monstersKilled++;
        if (m.name === 'Red Dragon') gameState.victory.stats.bossKilled = true;
        
        const tRoom = getCardAt(gameState.players[gameState.combat.playerIndex].x, gameState.players[gameState.combat.playerIndex].y);
        if (tRoom && tRoom.id.includes('boss')) {
                tRoom.isLocked = false;
                log("The Boss is slain. The doors unlock!");
        }
        checkVictory();
    } else gameState.tokens[gameState.combat.tokenKey].monsterData = m;
    
    gameState.combat.active = false;
    document.getElementById('combat-backdrop').classList.add('hidden');
    updateUI(); 
    endTurn();
}

function checkVictory() {
    let won = true;
    const stats = gameState.victory.stats;
    const players = gameState.players;
    const totalGold = players.reduce((acc, p) => acc + p.gold, 0);
    const legendaryCount = players.filter(p => p.inventory.includes("Iron Sword") || p.inventory.includes("Leather Armor")).length;

    gameState.victory.required.forEach(req => {
            if (req === 'wealth' && totalGold < 50) won = false;
            if (req === 'items' && legendaryCount < players.length) won = false;
            if (req === 'exploration' && stats.roomsCleared < 15) won = false;
            if (req === 'kills' && stats.monstersKilled < 20) won = false;
            if (req === 'boss' && !stats.bossKilled) won = false;
    });

    if (won) {
        showModal("GAME WON!", "Congratulations!", "You have completed your quest objectives.");
        document.getElementById('modal-close-btn').innerText = "Play Again";
        document.getElementById('modal-close-btn').onclick = () => location.reload();
    }
    
    const tracker = document.getElementById('victory-list');
    tracker.innerHTML = '';
    gameState.victory.required.forEach(reqId => {
        const cond = GAME_DATA.victoryConditions.find(c => c.id === reqId);
        let status = "0"; let target = "?";
        if (reqId === 'kills') { status = gameState.victory.stats.monstersKilled; target = 20; }
        if (reqId === 'exploration') { status = gameState.victory.stats.roomsCleared; target = 15; }
        if (reqId === 'wealth') { status = totalGold; target = 50; }
        if (reqId === 'items') { status = legendaryCount; target = players.length; }
        if (reqId === 'boss') { status = gameState.victory.stats.bossKilled ? "1" : "0"; target = "1"; }
        const p = document.createElement('p');
        p.innerText = `- ${cond.name}: ${status}/${target}`;
        tracker.appendChild(p);
    });
}

function endTurn() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    const p = gameState.players[gameState.currentPlayerIndex];
    p.moves = 1; log(`Turn: ${p.class.name}`);
    updateUI(); centerCameraOnPlayer();
    
    const key = `${p.x},${p.y}`;
    const token = gameState.tokens[key];
    if (token && token.type === 'monster' && token.monsterData) {
        if (p.fledTokenKey === key) { log(`You tread carefully around the ${token.monsterData.name}...`); p.fledTokenKey = null; }
        else { setTimeout(() => startCombat(token.monsterData, key, gameState.currentPlayerIndex), 500); }
    }
}

// --- INITIALIZATION & EVENTS ---
function centerCameraOnPlayer() {
    const p = gameState.players[gameState.currentPlayerIndex];
    const container = document.getElementById('map-container');
    const tx = (p.x * CELL_SIZE) + (CELL_SIZE/2); const ty = (p.y * CELL_SIZE) + (CELL_SIZE/2);
    gameState.camera.x = -tx + (container.clientWidth/2); gameState.camera.y = -ty + (container.clientHeight/2);
    updateCamera();
}
function updateCamera() {
    document.getElementById('map-area').style.transform = `translate(${gameState.camera.x}px, ${gameState.camera.y}px) scale(${gameState.camera.scale})`;
}

document.addEventListener('DOMContentLoaded', () => {
    renderSetup();
    
    // Attach Event Listeners
    document.getElementById('start-game-btn').addEventListener('click', startGame);
    document.getElementById('end-turn-btn').addEventListener('click', endTurn);
    
    document.querySelectorAll('.dpad-btn').forEach(btn => btn.addEventListener('click', () => {
        const dx = parseInt(btn.dataset.dx); const dy = parseInt(btn.dataset.dy);
        if(dx===0 && dy===0) log("Waiting..."); else movePlayer(dx, dy);
    }));

    document.getElementById('modal-close-btn').addEventListener('click', () => {
        document.getElementById('modal-backdrop').classList.add('hidden'); gameState.modalOpen = false;
        if(gameState.pendingTokenResolution) {
            const { x, y } = gameState.pendingTokenResolution;
            gameState.pendingTokenResolution = null;
            const token = gameState.tokens[`${x},${y}`];
            if (token) { token.revealed = true; updateUI(); setTimeout(() => resolveToken(token, gameState.players[gameState.currentPlayerIndex], `${x},${y}`), 200); }
        }
        if(gameState.pendingTokenRemoval) {
            delete gameState.tokens[gameState.pendingTokenRemoval];
            gameState.pendingTokenRemoval = null;
            updateUI();
        }
    });
    
    document.getElementById('btn-attack').addEventListener('click', () => runCombatRound('attack'));
    document.getElementById('btn-item').addEventListener('click', () => {
        const p = gameState.players[gameState.combat.playerIndex];
        if(p.inventory.includes("Potion")) runCombatRound('item');
        else combatLog("No usable items!");
    });
    document.getElementById('btn-run').addEventListener('click', () => {
         combatLog("You ran away!");
         const p = gameState.players[gameState.combat.playerIndex];
         p.fledTokenKey = gameState.combat.tokenKey;
         setTimeout(endCombatRound, 1000);
    });
    document.getElementById('combat-continue-btn').addEventListener('click', endCombatRound);

    // Camera Logic
    const mapContainer = document.getElementById('map-container');
    mapContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        gameState.camera.scale = Math.min(Math.max(0.5, gameState.camera.scale + scaleAmount), 3.0);
        updateCamera();
    }, { passive: false });
    
    // ... Copy the Touch/Pan logic from original script here ...
});
