export const CELL_SIZE = 50;

export const GAME_DATA = {
    classes: {
        "warrior": { id: "warrior", name: "Warrior", hp: 20, atk: 5, agi: 9, arm: 2, quantity: 1 },
        "rogue": { id: "rogue", name: "Rogue", hp: 16, atk: 6, agi: 13, arm: 0, quantity: 1 },
        "mage": { id: "mage", name: "Mage", hp: 12, atk: 7, agi: 11, arm: 0, quantity: 1 },
        "cleric": { id: "cleric", name: "Cleric", hp: 18, atk: 4, agi: 10, arm: 1, quantity: 1 }
    },
    victoryConditions: [
        { id: "boss", name: "Dragon's Hoard", desc: "Defeat the Final Boss" },
        { id: "wealth", name: "Wealthy Adventurers", desc: "Collect 50 pennies as a group" },
        { id: "items", name: "Legendary Heroes", desc: "Each player owns 1 item worth 6+ pennies" },
        { id: "exploration", name: "Dungeon Masters", desc: "Explore and clear 15 map cards" },
        { id: "kills", name: "Monster Slayers", desc: "Defeat 20 monsters as a group" }
    ],
    monsterDeck: [
        // Lowered AGI from 10 to 9. Lowered HP from 12 to 10.
        { name: "Goblin Warlord", atk: 4, agi: 9, arm: 0, hp: 10, sprite: "👺", quantity: 6 }, 
        
        // Lowered AGI from 13 to 11. Lowered HP from 10 to 8.
        { name: "Skeleton King", atk: 5, agi: 11, arm: 1, hp: 8, sprite: "💀", quantity: 6 },  
        
        // Lowered AGI from 8 to 7. Lowered HP from 22 to 18.
        { name: "Orc Behemoth", atk: 6, agi: 7, arm: 2, hp: 18, sprite: "👹", quantity: 4 },   
        
        // Lowered AGI from 6 to 5. Lowered HP from 25 to 20.
        { name: "Giant Slime", atk: 3, agi: 5, arm: 0, hp: 20, sprite: "💧", quantity: 4 },
        
        // BOSS: Lowered AGI from 11 to 10. Lowered HP from 35 to 30.
        { name: "Minotaur", atk: 7, agi: 10, arm: 2, hp: 30, sprite: "🐂", quantity: 1 },
        
        // BOSS: Lowered AGI from 14 to 12. Lowered HP from 60 to 45.
        { name: "Red Dragon", atk: 9, agi: 12, arm: 4, hp: 45, sprite: "🐉", quantity: 1 }    
    ],
    itemDeck: [
        { name: "Potion", cost: 5, desc: "Heal 5 HP", type: "active", quantity: 8 },
        { name: "Iron Sword", cost: 10, desc: "+1 ATK", type: "passive", quantity: 4 },
        { name: "Leather Armor", cost: 10, desc: "+2 Max HP", type: "passive", quantity: 4 }
    ],
    eventDeck: [
        { name: "Spike Trap", desc: "A hidden pit opens!", effect: "1 Damage", quantity: 5 },
        { name: "Poison Gas", desc: "A cloud of noxious fumes.", effect: "1 Damage", quantity: 5 },
        { name: "Falling Net", desc: "You are entangled.", effect: "Turn Ends", quantity: 5 },
        { name: "Tripwire", desc: "Watch your step!", effect: "1 Damage", quantity: 5 }
    ],
    mapCards: {
        "dungeonEntrance": { 
            id: "dungeonEntrance", name: "Entrance", type: "room", locked: false, quantity: 1,
            grid: [ 
                { walls: ['top', 'left'] }, { walls: [] }, { walls: ['top', 'right'] }, 
                { walls: [] }, { walls: [] }, { walls: [] }, 
                { walls: ['bottom', 'left'] }, { walls: [] }, { walls: ['bottom', 'right'] } 
            ] 
        },
        "room_crossroads": { 
            id: "room_crossroads", name: "Crossroads Room", type: "room", locked: false, quantity: 10,
            grid: [ 
                { walls: ['top', 'left'] }, { walls: [] }, { walls: ['top', 'right'] }, 
                { walls: [] }, { walls: [] }, { walls: [] }, 
                { walls: ['bottom', 'left'] }, { walls: [] }, { walls: ['bottom', 'right'] } 
            ] 
        },
        "room_great_hall": { 
            id: "room_great_hall", name: "Great Hall", type: "room", locked: false, quantity: 10,
            grid: [ 
                { walls: ['top', 'left'] }, { walls: [] }, { walls: ['top', 'right'] }, 
                { walls: [] }, { walls: [] }, { walls: [] }, 
                { walls: ['bottom', 'left'] }, { walls: ['bottom'] }, { walls: ['bottom', 'right'] } 
            ] 
        },
        "room_prison": { 
            id: "room_prison", name: "Dungeon Prison", type: "room", locked: true, quantity: 5,
            grid: [ 
                { walls: ['top', 'left'] }, { walls: [] }, { walls: ['top', 'right'] }, 
                { walls: ['left'] }, { walls: [] }, { walls: ['right'] }, 
                { walls: ['bottom', 'left'] }, { walls: [] }, { walls: ['bottom', 'right'] } 
            ] 
        },
        "room_vault": { 
            id: "room_vault", name: "Treasure Vault", type: "room", locked: true, quantity: 5,
            grid: [ 
                { walls: ['top', 'left'] }, { walls: [] }, { walls: ['top', 'right'] }, 
                { walls: ['left'] }, { walls: [] }, { walls: ['right'] }, 
                { walls: ['bottom', 'left'] }, { walls: [] }, { walls: ['bottom', 'right'] } 
            ] 
        },
        "room_mid_boss": { 
            id: "room_mid_boss", name: "Lair of the Beast", type: "room", locked: true, quantity: 1,
            grid: [ 
                { walls: ['top', 'left'] }, { walls: [] }, { walls: ['top', 'right'] }, 
                { walls: ['left'] }, { walls: [] }, { walls: ['right'] }, 
                { walls: ['bottom', 'left'] }, { walls: [] }, { walls: ['bottom', 'right'] } 
            ] 
        },
        "room_final_boss": { 
            id: "room_final_boss", name: "Dragon's Keep", type: "room", locked: true, quantity: 1,
            grid: [ 
                { walls: ['top', 'left'] }, { walls: [] }, { walls: ['top', 'right'] }, 
                { walls: ['left'] }, { walls: [] }, { walls: ['right'] }, 
                { walls: ['bottom', 'left'] }, { walls: [] }, { walls: ['bottom', 'right'] } 
            ] 
        }
    },
    corridors: {
        "hall_ns": { id: "hall_ns", name: "Hallway (NS)", type: "corridor", quantity: 5, grid: [{type:'void', walls:[]},{walls:['left','right']},{type:'void', walls:[]},{type:'void', walls:[]},{walls:['left','right']},{type:'void', walls:[]},{type:'void', walls:[]},{walls:['left','right']},{type:'void', walls:[]}] },
        "hall_ew": { id: "hall_ew", name: "Hallway (EW)", type: "corridor", quantity: 5, grid: [{type:'void', walls:[]},{type:'void', walls:[]},{type:'void', walls:[]},{walls:['top','bottom']},{walls:['top','bottom']},{walls:['top','bottom']},{type:'void', walls:[]},{type:'void', walls:[]},{type:'void', walls:[]}] },
        "corner_ne": { id: "corner_ne", name: "Corner (NE)", type: "corridor", quantity: 5, grid: [{type:'void', walls:[]},{walls:['top','left']},{type:'void', walls:[]},{type:'void', walls:[]},{walls:['bottom','right']},{walls:['top','bottom']},{type:'void', walls:[]},{type:'void', walls:[]},{type:'void', walls:[]}] }, 
        "corner_nw": { id: "corner_nw", name: "Corner (NW)", type: "corridor", quantity: 5, grid: [{type:'void', walls:[]},{walls:['top','right']},{type:'void', walls:[]},{walls:['top','bottom']},{walls:['bottom','left']},{type:'void', walls:[]},{type:'void', walls:[]},{type:'void', walls:[]},{type:'void', walls:[]}] }, 
        "corner_se": { id: "corner_se", name: "Corner", type: "corridor", quantity: 5, grid: [{type:'void', walls:[]},{type:'void', walls:[]},{type:'void', walls:[]},{walls:['left','top']},{walls:['bottom','right']},{type:'void', walls:[]},{type:'void', walls:[]},{walls:['left','right']},{type:'void', walls:[]}] },
        "corner_sw": { id: "corner_sw", name: "Corner (SW)", type: "corridor", quantity: 5, grid: [{type:'void', walls:[]},{type:'void', walls:[]},{type:'void', walls:[]},{walls:['top','bottom']},{walls:['top','right']},{type:'void', walls:[]},{type:'void', walls:[]},{walls:['left','right']},{type:'void', walls:[]}] },
        "t_north": { id: "t_north", name: "T-Junction (N)", type: "corridor", quantity: 5, grid: [{type:'void', walls:[]}, {type:'void', walls:[]}, {type:'void', walls:[]}, {walls:['top','bottom']}, {walls:['top']}, {walls:['top','bottom']}, {type:'void', walls:[]}, {walls:['left','right']}, {type:'void', walls:[]}] },
        "t_south": { id: "t_south", name: "T-Junction (S)", type: "corridor", quantity: 5, grid: [{type:'void', walls:[]}, {walls:['left','right']}, {type:'void', walls:[]}, {walls:['top','bottom']}, {walls:['bottom']}, {walls:['top','bottom']}, {type:'void', walls:[]}, {type:'void', walls:[]}, {type:'void', walls:[]} ] },
        "t_east": { id: "t_east", name: "T-Junction (E)", type: "corridor", quantity: 5, grid: [{type:'void', walls:[]}, {walls:['left','right']}, {type:'void', walls:[]}, {walls:['top','bottom']}, {walls:['right']}, {type:'void', walls:[]}, {type:'void', walls:[]}, {walls:['left','right']}, {type:'void', walls:[]}] },
        "t_west": { id: "t_west", name: "T-Junction (W)", type: "corridor", quantity: 5, grid: [{type:'void', walls:[]}, {walls:['left','right']}, {type:'void', walls:[]}, {type:'void', walls:[]}, {walls:['left']}, {walls:['top','bottom']}, {type:'void', walls:[]}, {walls:['left','right']}, {type:'void', walls:[]}] },
        "crossroads": { id: "crossroads", name: "Junction", type: "corridor", quantity: 5, grid: [{type:'void', walls:[]}, {walls:['left','right']}, {type:'void', walls:[]}, {walls:['top','bottom']}, {walls:[]}, {walls:['top','bottom']}, {type:'void', walls:[]}, {walls:['left','right']}, {type:'void', walls:[]}] }
    }
};
