import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB, Shop } from "@/lib/mongodb";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const docs = await Shop.find({});
    const result: any = {};
    docs.forEach((d: any) => result[d.guildId] = d.items);
    return NextResponse.json(result);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const payload = await req.json();
        await connectDB();
        for (const [guildId, items] of Object.entries(payload) as [string, any][]) {
            await Shop.findOneAndUpdate({ guildId }, { items }, { upsert: true });
        }
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
