import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB, Settings } from "@/lib/mongodb";

export async function GET() {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const docs = await Settings.find({});
    const result: any = {};
    docs.forEach((d: any) => result[d.guildId] = {
            welcomeChannel: d.welcomeChannel,
            welcomeMessage: d.welcomeMessage,
            coinsPerMessage: d.coinsPerMessage,
            coinsPerVoiceMinute: d.coinsPerVoiceMinute,
            levelUpChannel: d.levelUpChannel,
            levelingEnabled: d.levelingEnabled,
            autoModEnabled: d.autoModEnabled,
            ticketCategory: d.ticketCategory,
            ticketAdminRole: d.ticketAdminRole,
            ticketLogChannel: d.ticketLogChannel,
            logMsgSend: d.logMsgSend,
            logMsgEdit: d.logMsgEdit,
            logMsgDelete: d.logMsgDelete,
            logVoice: d.logVoice,
            adChannelId: d.adChannelId,
            adRoleId: d.adRoleId,
            adInitialPrice: d.adInitialPrice,
            adRechargePrice: d.adRechargePrice
        });
    return NextResponse.json(result);
}

export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    await connectDB();
    for (const [guildId, val] of Object.entries(body) as [string, any][]) {
        await Settings.findOneAndUpdate({ guildId }, val, { upsert: true });
    }
    return NextResponse.json({ success: true });
}

