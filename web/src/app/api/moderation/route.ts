import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB, Lists, Economy, Level } from "@/lib/mongodb";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const lists = await Lists.findOne({}) || { whitelist: [], blacklist: [] };
    const economy = await Economy.find({});
    const levels = await Level.find({});
    const leaderboard = economy.map((e: any) => ({ id: e.userId, balance: e.balance })).sort((a: any, b: any) => b.balance - a.balance).slice(0, 10);
    const levelsBoard = levels.map((l: any) => ({ id: l.userId, level: l.level, xp: l.xp })).sort((a: any, b: any) => b.xp - a.xp).slice(0, 10);
    return NextResponse.json({ blacklist: lists.blacklist || [], whitelist: lists.whitelist || [], leaderboard, levelsBoard });
}
