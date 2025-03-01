Can you create a workspace for a game using Devvit, Reddit's developer platform using the Interactive Posts feature.
Use react+vite (only jsx) for frontend and flask for backend(if any needed). For any database usees make use of mongodb for the same.

this is the game idea:

# Pixel Territory - Implementation Plan

Let's develop a comprehensive implementation plan for your "Pixel Territory" game for the Reddit Hackathon:

## Core Game Mechanics

### Grid System

- 20×20 grid (400 cells) for a good balance of complexity and performance
- Each cell stores: owner ID, color, capture timestamp, and power level
- Implement using a JSON data structure that can be efficiently stored and updated

### Territory Claiming Rules

- New players can claim any unclaimed cell
- Players can only expand to cells adjacent to their territory (orthogonally, not diagonally)
- Claiming an opponent's cell requires more "power" than they have in that cell
- Power accumulates over time for each player's territory

## User Interface

### Post Display

- Main grid visualization using CSS grid or canvas element
- Hover states to show cell information (owner, capture time)
- Territory statistics panel showing top players and their territory sizes
- Clear color coding for different players' territories

### Interaction Method

- Click/tap interface for cell selection
- Simple confirmation for claiming cells
- Visual feedback for successful/unsuccessful claims

## Technical Implementation

import { Devvit } from '@devvit/public-api';
import { useState } from '@devvit/public-api';

// Define our grid size
const GRID_SIZE = 20;

// Define player territory cell
interface Cell {
owner: string; // Reddit username
color: string; // Hex color code
timestamp: number; // When this cell was claimed
power: number; // Power level of this cell
}

// Define the game state
interface GameState {
grid: Cell[][];
players: {
[username: string]: {
color: string;
cellCount: number;
lastAction: number;
}
};
lastReset: number;
gameActive: boolean;
}

// Initialize a new game state
function createNewGameState(): GameState {
const emptyGrid: Cell[][] = [];

for (let y = 0; y < GRID_SIZE; y++) {
const row: Cell[] = [];
for (let x = 0; x < GRID_SIZE; x++) {
row.push({
owner: '',
color: '#e0e0e0', // Light gray for unclaimed
timestamp: 0,
power: 0
});
}
emptyGrid.push(row);
}

return {
grid: emptyGrid,
players: {},
lastReset: Date.now(),
gameActive: true
};
}

// Check if a cell can be claimed by a player
function canClaimCell(state: GameState, x: number, y: number, username: string): boolean {
// Out of bounds
if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return false;

const cell = state.grid[y][x];

// If cell is already owned by the player
if (cell.owner === username) return false;

// Check if player has any adjacent cells (for expansion)
const hasAdjacentTerritory = (
(x > 0 && state.grid[y][x-1].owner === username) || // Left
(x < GRID_SIZE-1 && state.grid[y][x+1].owner === username) || // Right
(y > 0 && state.grid[y-1][x].owner === username) || // Top
(y < GRID_SIZE-1 && state.grid[y+1][x].owner === username) // Bottom
);

// New players can claim any empty cell
if (!hasAdjacentTerritory && !state.players[username]) {
return cell.owner === '';
}

// Existing players must expand from their territory
if (!hasAdjacentTerritory) return false;

// Calculate attack power (based on territory size and time since last action)
const playerStats = state.players[username];
const timeSinceLastAction = Date.now() - playerStats.lastAction;
const attackPower = Math.min(10, Math.floor(timeSinceLastAction / 60000) + 1); // +1 power per minute, max 10

// If cell is empty, can claim
if (cell.owner === '') return true;

// If cell is owned by another player, need more power than their cell's power
return attackPower > cell.power;
}

// Claim a cell for a player
function claimCell(state: GameState, x: number, y: number, username: string): GameState {
if (!canClaimCell(state, x, y, username)) return state;

// Deep clone the state to avoid direct mutation
const newState = JSON.parse(JSON.stringify(state)) as GameState;

// If this is a new player, initialize their data
if (!newState.players[username]) {
// Generate a unique color for the player
const playerColor = generateUniqueColor(Object.values(newState.players).map(p => p.color));

    newState.players[username] = {
      color: playerColor,
      cellCount: 0,
      lastAction: Date.now()
    };

}

// Update the cell
const playerInfo = newState.players[username];
const timeSinceLastAction = Date.now() - playerInfo.lastAction;
const power = Math.min(10, Math.floor(timeSinceLastAction / 60000) + 1);

// If we're taking from another player, decrease their count
if (newState.grid[y][x].owner && newState.grid[y][x].owner !== username) {
newState.players[newState.grid[y][x].owner].cellCount--;
}

// Update the cell data
newState.grid[y][x] = {
owner: username,
color: playerInfo.color,
timestamp: Date.now(),
power: power
};

// Update player stats
newState.players[username].cellCount++;
newState.players[username].lastAction = Date.now();

return newState;
}

// Generate a unique color for a new player
function generateUniqueColor(existingColors: string[]): string {
const letters = '0123456789ABCDEF';
let color;

// Keep generating colors until we find one that's not too similar to existing ones
do {
color = '#';
for (let i = 0; i < 6; i++) {
color += letters[Math.floor(Math.random() * 16)];
}
} while (existingColors.some(existing => colorDistance(existing, color) < 100));

return color;
}

// Calculate "distance" between colors to ensure they're visually distinct
function colorDistance(color1: string, color2: string): number {
// Convert hex to RGB
const r1 = parseInt(color1.slice(1, 3), 16);
const g1 = parseInt(color1.slice(3, 5), 16);
const b1 = parseInt(color1.slice(5, 7), 16);

const r2 = parseInt(color2.slice(1, 3), 16);
const g2 = parseInt(color2.slice(3, 5), 16);
const b2 = parseInt(color2.slice(5, 7), 16);

// Calculate Euclidean distance
return Math.sqrt(
Math.pow(r1 - r2, 2) +
Math.pow(g1 - g2, 2) +
Math.pow(b1 - b2, 2)
);
}

// Main component for rendering the post content
const PixelTerritoryGame = () => {
// Get current user
const [user] = useState(async context => {
return await context.reddit.getUserId();
});

// Get or initialize game state
const [gameState, setGameState] = useState(async context => {
try {
const storedState = await context.redis.get('gameState');
if (storedState) {
return JSON.parse(storedState) as GameState;
}
} catch (e) {
console.error('Failed to load game state', e);
}

    // If no state exists or error loading, create a new one
    const newState = createNewGameState();
    await context.redis.set('gameState', JSON.stringify(newState));
    return newState;

});

// Handle cell click
const handleCellClick = async (x: number, y: number) => {
if (!user || !gameState.gameActive) return;

    const username = user;

    if (canClaimCell(gameState, x, y, username)) {
      const newState = claimCell(gameState, x, y, username);
      setGameState(newState);

      // Save state to Redis
      await Devvit.redis.set('gameState', JSON.stringify(newState));
    }

};

// Render the grid
return (
<div className="pixel-territory-container">
<h1>Pixel Territory</h1>
<div className="game-grid">
{gameState.grid.map((row, y) => (
<div key={row-${y}} className="grid-row">
{row.map((cell, x) => (
<div
key={cell-${x}-${y}}
className={grid-cell ${cell.owner ? 'claimed' : 'unclaimed'}}
style={{ backgroundColor: cell.color }}
onClick={() => handleCellClick(x, y)}
title={cell.owner ? Owned by ${cell.owner} : 'Unclaimed territory'}
/>
))}
</div>
))}
</div>

      <div className="leaderboard">
        <h2>Territory Leaders</h2>
        <ul>
          {Object.entries(gameState.players)
            .sort((a, b) => b[1].cellCount - a[1].cellCount)
            .slice(0, 5)
            .map(([username, data]) => (
              <li key={username}>
                <span className="player-color" style={{ backgroundColor: data.color }}></span>
                <span className="player-name">{username}</span>
                <span className="player-score">{data.cellCount} cells</span>
              </li>
            ))
          }
        </ul>
      </div>

      <div className="game-info">
        <p>Claim territory by clicking on cells adjacent to your existing territory.</p>
        <p>Build the largest empire to win!</p>
        <p>Game resets daily at midnight UTC.</p>
      </div>
    </div>

);
};

// Schedule daily resets
Devvit.addSchedulerHandler({
name: 'dailyReset',
onRun: async context => {
const newState = createNewGameState();
await context.redis.set('gameState', JSON.stringify(newState));

    // Optional: Archive the previous day's results
    const previousState = await context.redis.get('gameState');
    if (previousState) {
      const date = new Date().toISOString().split('T')[0];
      await context.redis.set(gameState-${date}, previousState);
    }

}
});

Devvit.schedule({
handler: 'dailyReset',
cron: '0 0 \* \* \*' // Run at midnight UTC daily
});

// Register the app
Devvit.addInteractivePost({
name: 'main',
render: PixelTerritoryGame
});

export default Devvit;

## Feature Enhancements

### Alliance System

- Allow players to form alliances through a simple invitation system
- Allied territories can't attack each other and contribute to a combined score
- Implementation through comment-based commands (e.g., "@username alliance request")

### Power-ups and Special Abilities

- Daily random power-up cells appear on the map
- Types of power-ups:
  - Shield: Temporary protection for a cell
  - Bomb: Claim multiple cells at once
  - Teleport: Claim a non-adjacent cell
  - Color Bomb: Change all adjacent enemy cells to your color

### Daily Challenges

- Special objectives that give bonus points (e.g., "Create a 5×5 square")
- Themed days (e.g., "Two-team Tuesday" where only two colors battle)
- Achievement badges shown on the leaderboard

## Technical Features

### Auto-Scheduling

- Daily reset at midnight UTC using Devvit's scheduler
- Automatic posting of daily results and statistics
- Weekly championship announcements

### Data Storage

- Use Redis for game state persistence
- Archive historical games for player statistics over time
- Implement efficient update patterns to minimize storage requirements

### Performance Optimization

- Implement debouncing for rapid cell claims
- Only update changed parts of the grid on state changes
- Use efficient rendering techniques for the grid display

## Engagement Features

### Leaderboards

- Daily top territory owners
- Weekly champions
- "Most Aggressive" award for most territory captures
- "Survivor" award for longest-held territories

### History Visualization

- Time-lapse replay of the day's territory changes
- Heat maps showing most contested areas
- Statistics on player activity patterns

### Community Input

- Allow upvote-based voting on daily challenge ideas
- Special events based on community suggestions
- "Bounty" system where players can put rewards on specific cells

## New Features

### Token System

- Players need 10 tokens to claim a territory
- Tokens can be earned by solving riddles and answering questions
- Each correct answer awards 10 tokens
- Tokens cannot be transferred between players

### Daily Competition

- Game resets daily at midnight UTC
- Player with most territories wins the daily competition
- Historical statistics are stored for the last 7 days
- Daily winners are highlighted in the leaderboard

### Historical Leaderboard

- Access to previous 7 days of competition results
- View daily winners and territory counts
- Track player performance over time
- Statistics include:
  - Territory count
  - Tokens earned
  - Territories claimed
  - Daily ranking

### Database Schema
