import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import fs from 'fs';
import path from 'path';

const listsPath = path.join(process.cwd(), '../src/data/lists.json');
const economyPath = path.join(process.cwd(), '../src/data/economy.json');
const levelsPath = path.join(process.cwd(), '../src/data/levels.json');

const readFile = (p: string) => {
    try {
        if (!fs.existsSync(p)) return {};
        return JSON.parse(fs.readFileSync(p, 'utf8') || '{}');
    } catch { return {}; }
};

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const lists = readFile(listsPath);
    const economy = readFile(economyPath);
    const levels = readFile(levelsPath);

    // Build economy leaderboard
    const leaderboard = Object.entries(economy)
        .map(([id, data]: [string, any]) => ({ id, balance: data.balance || 0 }))
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 10);

    // Build levels leaderboard — levels.json is { guildId: { userId: { xp, level } } }
    const allUsers: any[] = [];
    for (const guildData of Object.values(levels) as any[]) {
        for (const [userId, userData] of Object.entries(guildData) as [string, any][]) {
            const existing = allUsers.find(u => u.id === userId);
            if (existing) {
                existing.xp = Math.max(existing.xp, userData.xp || 0);
                existing.level = Math.max(existing.level, userData.level || 0);
            } else {
                allUsers.push({ id: userId, level: userData.level || 0, xp: userData.xp || 0 });
            }
        }
    }
    const levelsBoard = allUsers.sort((a, b) => b.xp - a.xp).slice(0, 10);

    return NextResponse.json({
        blacklist: lists.blacklist || [],
        whitelist: lists.whitelist || [],
        leaderboard,
        levelsBoard
    });
}
