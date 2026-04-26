import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB, BadWords } from "@/lib/mongodb";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const docs = await BadWords.find({});
    const result: any = {};
    docs.forEach((d: any) => result[d.guildId] = d.words);
    return NextResponse.json(result);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const words = await req.json();
        await connectDB();
        for (const [guildId, w] of Object.entries(words) as [string, any][]) {
            await BadWords.findOneAndUpdate({ guildId }, { words: w }, { upsert: true });
        }
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
