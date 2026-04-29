import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB, BotStatus } from "@/lib/mongodb";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accessToken = (session as any).accessToken;
    if (!accessToken) return NextResponse.json({ error: "No access token. Please sign out and log in again." }, { status: 401 });

    try {
        const response = await fetch("https://discord.com/api/users/@me/guilds", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!response.ok) return NextResponse.json({ error: "Discord API error" }, { status: response.status });

        const userGuilds = await response.json();

        await connectDB();
        const botStatus = await BotStatus.findOne({});
        const botGuildIds: string[] = botStatus?.guildIds || [];

        const manageableGuilds = userGuilds.filter((guild: any) => {
            const isAdmin = (BigInt(guild.permissions) & BigInt(0x8)) === BigInt(0x8);
            return isAdmin && botGuildIds.includes(guild.id);
        });

        return NextResponse.json(manageableGuilds);
    } catch (e: any) {
        console.error("Error in /api/user/guilds:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
