import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB, Stats, Economy } from "@/lib/mongodb";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        await connectDB();
        const statsDoc = await Stats.findOne({});
        const history = statsDoc?.history || [];
        const economy = await Economy.find({});
        const totalCoins = economy.reduce((sum: number, e: any) => sum + (e.balance || 0), 0);
        return NextResponse.json({
            totalCoins,
            totalUsers: history.length > 0 ? history[history.length - 1].members : 0,
            activeServers: 1,
            history
        });
    } catch (e) {
        return NextResponse.json({ history: [], totalCoins: 0, totalUsers: 0, activeServers: 0 });
    }
}
