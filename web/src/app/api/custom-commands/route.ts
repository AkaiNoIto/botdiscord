import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB, CustomCommands } from "@/lib/mongodb";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const docs = await CustomCommands.find({});
    const result: any = {};
    docs.forEach((d: any) => {
        result[d.guildId] = {};
        d.commands.forEach((val: any, key: string) => result[d.guildId][key] = { text: val.text, image: val.image });
    });
    return NextResponse.json(result);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const payload = await req.json();
        if (typeof payload !== "object" || Array.isArray(payload)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        await connectDB();
        for (const [guildId, commands] of Object.entries(payload)) {
            await CustomCommands.findOneAndUpdate({ guildId }, { commands }, { upsert: true });
        }
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
