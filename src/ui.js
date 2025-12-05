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

export function animateDiceRoll(d1, d2, isHit) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('dice-overlay');
        const die1El = document.getElementById('die-1');
        const die2El = document.getElementById('die-2');
        const resultText = document.getElementById('dice-result-text');
        
        overlay.classList.remove('hidden');
        die1El.classList.add('shake-dice');
        die2El.classList.add('shake-dice');
        resultText.innerText = '';
        
        const interval = setInterval(() => {
            die1El.innerText = Math.floor(Math.random() * 6) + 1;
            die2El.innerText = Math.floor(Math.random() * 6) + 1;
        }, 50);

        setTimeout(() => {
            clearInterval(interval);
            die1El.classList.remove('shake-dice');
            die2El.classList.remove('shake-dice');
            die1El.innerText = d1;
            die2El.innerText = d2;
            
            if (isHit) {
                resultText.innerText = "HIT!";
                resultText.className = "h-8 text-2xl font-bold text-green-400 drop-shadow-md";
            } else {
                resultText.innerText = "MISS...";
                resultText.className = "h-8 text-2xl font-bold text-gray-500 drop-shadow-md";
            }

            setTimeout(() => {
                overlay.classList.add('hidden');
                resolve(); 
            }, 1200);

        }, 800);
    });
}

export function updateUI() {
    const mapArea = document.getElementById('map-area');
    if(!mapArea) return;
    mapArea.innerHTML = ''; 

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
        } else if (t.revealed || t.type === 'key') {
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

    gameState.players.forEach((p, index) => {
        const pEl = document.createElement('div');
        const isActive = index === gameState.currentPlayerIndex;
        const isDown = p.downed;
        pEl.className = `player-token token-${p.class.id} ${isActive ? 'active' : ''} ${isDown ? 'opacity-50 grayscale' : ''}`;
        pEl.innerText = isDown ? '☠️' : `P${index+1}`;
        pEl.style.left = (p.x * CELL_SIZE + 10) + 'px';
        pEl.style.top = (p.y * CELL_SIZE + 10) + 'px';
        pEl.style.zIndex = 20;
        mapArea.appendChild(pEl);
    });

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
                <div class="flex justify-between">
                    <span>Health</span>
                    <span class="${p.downed ? 'text-red-600 font-bold' : ''}">${p.hp}/${p.maxHp} ${p.downed ? '(DOWN)' : ''}</span>
                </div>
                <div class="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                    <div class="bg-green-600 h-full" style="width: ${hpPercent}%"></div>
                </div>
            </div>`;
        document.getElementById('mov-points').innerText = p.moves;
        const invEl = document.getElementById('inventory-list');
        invEl.innerHTML = p.inventory.length ? p.inventory.map(i => `<span class="bg-gray-700 px-2 py-1 rounded mr-1">${i}</span>`).join('') : "Empty";
    
        const ctxContainer = document.getElementById('context-actions');
        if (ctxContainer) {
            ctxContainer.innerHTML = '';
            
            if (!p.downed && !gameState.combat.active) {
                gameState.players.forEach((target, idx) => {
                    if (idx !== gameState.currentPlayerIndex && target.downed) {
                        const dist = Math.abs(p.x - target.x) + Math.abs(p.y - target.y);
                        let canRevive = false;
                        
                        if (dist === 0) {
                            const key = `${p.x},${p.y}`;
                            const token = gameState.tokens[key];
                            const monsterHere = (token && token.type === 'monster');
                            if (!monsterHere) canRevive = true;
                        }
                        else if (dist === 1) {
                            canRevive = true;
                        }

                        if (canRevive) {
                            const btn = document.createElement('button');
                            btn.className = "w-full bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-2 rounded text-xs animate-pulse";
                            btn.innerText = `🚑 Revive ${target.class.name} (P${idx+1})`;
                            btn.onclick = () => window.dispatchEvent(new CustomEvent('revive-player', { detail: { targetIndex: idx } }));
                            ctxContainer.appendChild(btn);
                        }
                    }
                });
            }
            if (p.downed) {
                 const warning = document.createElement('div');
                 warning.className = "bg-red-900 text-red-200 p-2 rounded text-xs text-center border border-red-500 font-bold";
                 warning.innerText = "You are unconscious! Wait for help.";
                 ctxContainer.appendChild(warning);
            }
        }
    }
}
