export let gameState = {
    players: [], 
    currentPlayerIndex: 0, 
    mapLayout: {}, 
    tokens: {}, 
    camera: { x: 0, y: 0, scale: 1.0 }, 
    isPanning: false, 
    panStart: { x: 0, y: 0 }, 
    modalOpen: false,
    initialPinchDist: null, 
    initialScale: 1.0,
    pendingTokenResolution: null, 
    pendingTokenRemoval: null,
    combat: { active: false, monster: null, tokenKey: null, playerId: null },
    victory: { required: [], stats: { monstersKilled: 0, roomsCleared: 0, bossKilled: false } },
    decks: { rooms: [], corridors: [] },
    stats: { roomsPlaced: 0, totalRooms: 0 }
};

export const selectedClasses = new Set();
export const selectedVictory = new Set();

export function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
export function drawCard(deck) { return deck[Math.floor(Math.random() * deck.length)]; }
