import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const economyPath = path.join(process.cwd(), '../src/data/economy.json');
const levelsPath = path.join(process.cwd(), '../src/data/levels.json');
const botStatusPath = path.join(process.cwd(), '../src/data/botStatus.json');

const readFile = (p: string) => {
    try {
        if (!fs.existsSync(p)) return {};
        return JSON.parse(fs.readFileSync(p, 'utf8') || '{}');
    } catch { return {}; }
};

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const guildId = params.id;
    if (!guildId) return NextResponse.json({ error: "Missing guild ID" }, { status: 400 });

    const economy = readFile(economyPath);
    const levels = readFile(levelsPath);
    const botStatus = readFile(botStatusPath);

    // Verify the bot is actually in this guild (basic privacy check)
    if (!botStatus.guildIds?.includes(guildId)) {
        return NextResponse.json({ error: "Server not found or bot not present" }, { status: 404 });
    }

    // Economy Leaderboard (Global in bot currently, but let's filter to this guild if we ever separate it, 
    // Wait, economy.json in the bot is currently `{ userId: { balance } }`, meaning it's global for the bot!
    // If it's global, we just return the top players.
    // However, levels is `{ guildId: { userId: ... } }`.
    
    // Process Economy
    const ecoLeaderboard = Object.entries(economy)
        .map(([id, data]: [string, any]) => ({ id, balance: data.balance || 0 }))
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 10);

    // Process Levels (Specific to this guild)
    const guildLevels = levels[guildId] || {};
    const lvlLeaderboard = Object.entries(guildLevels)
        .map(([id, data]: [string, any]) => ({ id, level: data.level || 0, xp: data.xp || 0 }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10);

    return NextResponse.json({
        economy: ecoLeaderboard,
        levels: lvlLeaderboard
    });
}
