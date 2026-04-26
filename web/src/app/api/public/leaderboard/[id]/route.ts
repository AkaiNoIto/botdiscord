import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const economyPath = path.join(process.cwd(), "../src/data/economy.json");
const levelsPath = path.join(process.cwd(), "../src/data/levels.json");
const botStatusPath = path.join(process.cwd(), "../src/data/botStatus.json");

const readFile = (p: string) => {
    try {
        if (!fs.existsSync(p)) return {};
        return JSON.parse(fs.readFileSync(p, "utf8") || "{}");
    } catch { return {}; }
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: guildId } = await params;
    if (!guildId) return NextResponse.json({ error: "Missing guild ID" }, { status: 400 });
    const economy = readFile(economyPath);
    const levels = readFile(levelsPath);
    const botStatus = readFile(botStatusPath);
    if (!botStatus.guildIds?.includes(guildId)) {
        return NextResponse.json({ error: "Server not found or bot not present" }, { status: 404 });
    }
    const ecoLeaderboard = Object.entries(economy)
        .map(([id, data]: [string, any]) => ({ id, balance: (data as any).balance || 0 }))
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 10);
    const guildLevels = (levels as any)[guildId] || {};
    const lvlLeaderboard = Object.entries(guildLevels)
        .map(([id, data]: [string, any]) => ({ id, level: (data as any).level || 0, xp: (data as any).xp || 0 }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10);
    return NextResponse.json({ economy: ecoLeaderboard, levels: lvlLeaderboard });
}
