// src/ui.js
import { gameState } from './state.js';
import { GAME_DATA, CELL_SIZE } from './data.js';

export function log(msg) {
    const l = document.getElementById('game-log');
    const d = document.createElement('div'); d.innerText = `> ${msg}`; l.prepend(d);
}

export function combatLog(msg) {
    const area = document.getElementById('combat-log-area');
    const p = document.createElement('p'); p.className = "mb-2"; p.innerText = `> ${msg}`; area.prepend(p);
}

export function showModal(title, desc, content) {
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-description").innerText = desc;
    document.getElementById("modal-content").innerHTML = content;
    document.getElementById("modal-options").innerHTML = "";
    document.getElementById("modal-close-btn").classList.remove("hidden");
    document.getElementById("modal-backdrop").classList.remove("hidden");
    gameState.modalOpen = true;
}

export function updateUI() {
    // 1. Render Map Area
    const mapArea = document.getElementById('map-area');
    if(!mapArea) return;
    mapArea.innerHTML = ''; 

    // Render Map Cards
    Object.values(gameState.mapLayout).forEach(card => {
        const cardEl = document.createElement('div');
        const isBoss = card.id.includes('boss');
        cardEl.className = `map-card-container ${card.isLocked ? 'locked-room' : ''} ${isBoss ? 'boss-room' : ''}`;
        cardEl.style.left = (card.x * CELL_SIZE) + 'px';
        cardEl.style.top = (card.y * CELL_SIZE) + 'px';
        
        const header = document.createElement('div');
        header.className = 'card-header';
        if(isBoss) header.style.color = '#ef4444';
        header.innerText = card.name;
        cardEl.appendChild(header);

        const gridEl = document.createElement('div');
        gridEl.className = 'map-card-grid';

        card.grid.forEach((cell) => {
            const cellEl = document.createElement('div');
            cellEl.className = 'grid-space';
            if(cell.type === 'void') {
                cellEl.classList.add('space-void');
            } else {
                if(cell.walls.includes('top')) cellEl.classList.add('wall-top');
                if(cell.walls.includes('bottom')) cellEl.classList.add('wall-bottom');
                if(cell.walls.includes('left')) cellEl.classList.add('wall-left');
                if(cell.walls.includes('right')) cellEl.classList.add('wall-right');
                if(card.isLocked) cellEl.classList.add('locked-door');
            }
            gridEl.appendChild(cellEl);
        });
        cardEl.appendChild(gridEl);
        mapArea.appendChild(cardEl);
    });

    // Render Tokens
    Object.keys(gameState.tokens).forEach(key => {
        const t = gameState.tokens[key];
        const [tx, ty] = key.split(',').map(Number);
        const tokenEl = document.createElement('div');
        const offset = 13; 
        tokenEl.style.left = (tx * CELL_SIZE + offset) + 'px';
        tokenEl.style.top = (ty * CELL_SIZE + offset) + 'px';

        if (t.type === 'monster' && t.revealed) {
            tokenEl.className = 'token-marker token-monster';
            if(t.monsterData && (t.monsterData.name === 'Red Dragon' || t.monsterData.name === 'Minotaur')) {
                tokenEl.className = 'token-marker token-boss';
                tokenEl.style.left = (tx * CELL_SIZE + 5) + 'px'; 
                tokenEl.style.top = (ty * CELL_SIZE + 5) + 'px';
                tokenEl.innerText = t.monsterData.sprite;
            } else {
                tokenEl.innerText = t.monsterData ? t.monsterData.sprite : "👹";
            }
        } else if (t.revealed || t.type === 'shop' || t.type === 'key') {
            tokenEl.className = `token-marker token-${t.type}`;
            if(t.type==='loot') tokenEl.innerText = '💰';
            else if(t.type==='event') tokenEl.innerText = '⚡';
            else if(t.type==='key') tokenEl.innerText = '🔑';
            else if(t.type==='shop') tokenEl.innerText = '🛒';
        } else {
            tokenEl.className = 'token-marker';
            tokenEl.innerText = '?';
        }
        mapArea.appendChild(tokenEl);
    });

    // Render Players
    gameState.players.forEach((p, index) => {
        const pEl = document.createElement('div');
        const isActive = index === gameState.currentPlayerIndex;
        pEl.className = `player-token token-${p.class.id} ${isActive ? 'active' : ''}`;
        pEl.innerText = `P${index+1}`;
        pEl.style.left = (p.x * CELL_SIZE + 10) + 'px';
        pEl.style.top = (p.y * CELL_SIZE + 10) + 'px';
        pEl.style.zIndex = 20;
        mapArea.appendChild(pEl);
    });

    // Sidebar Stats
    const p = gameState.players[gameState.currentPlayerIndex];
    if(p) {
        const statsEl = document.getElementById('player-stats-container');
        const hpPercent = (p.hp / p.maxHp) * 100;
        statsEl.innerHTML = `
            <div class="flex justify-between items-end border-b border-gray-600 pb-2 mb-2">
                <div><span class="text-2xl font-bold text-white">${p.class.name}</span></div>
                <div class="text-right"><span class="text-yellow-400 font-bold text-xl">${p.gold} 🪙</span></div>
            </div>
            <div class="space-y-1 text-sm">
                <div class="flex justify-between"><span>Health</span><span>${p.hp}/${p.maxHp}</span></div>
                <div class="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                    <div class="bg-green-600 h-full" style="width: ${hpPercent}%"></div>
                </div>
            </div>`;
        document.getElementById('mov-points').innerText = p.moves;
        const invEl = document.getElementById('inventory-list');
        invEl.innerHTML = p.inventory.length ? p.inventory.map(i => `<span class="bg-gray-700 px-2 py-1 rounded mr-1">${i}</span>`).join('') : "Empty";
    }
}
