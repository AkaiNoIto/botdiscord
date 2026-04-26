import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import fs from 'fs';
import path from 'path';

const statsPath = path.join(process.cwd(), '../src/data/stats.json');
const economyPath = path.join(process.cwd(), '../src/data/economy.json');

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Load history
        let history = [];
        if (fs.existsSync(statsPath)) {
            const statsData = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
            history = statsData.history || [];
        }

        // Load current live coins
        let totalCoins = 0;
        if (fs.existsSync(economyPath)) {
            const economy = JSON.parse(fs.readFileSync(economyPath, 'utf8'));
            Object.values(economy).forEach((guild: any) => {
                Object.values(guild).forEach((user: any) => {
                    totalCoins += (user.coins || 0);
                });
            });
        }

        // Return unified data
        return NextResponse.json({
            totalCoins,
            totalUsers: history.length > 0 ? history[history.length - 1].members : 0,
            activeServers: 1, // Placeholder
            history
        });
    } catch (e) {
        return NextResponse.json({ history: [], totalCoins: 0, totalUsers: 0, activeServers: 0 });
    }
}
