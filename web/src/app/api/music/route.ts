import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const INTERNAL_MUSIC_API = "http://localhost:3001/api/music";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get('guildId');

    if (!guildId) return NextResponse.json({ error: "Missing guildId" }, { status: 400 });

    try {
        const response = await fetch(`${INTERNAL_MUSIC_API}?guildId=${guildId}`, {
            cache: 'no-store'
        });
        const data = await response.json();
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: "Bot offline or Music API unreachable" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get('guildId');

    if (!guildId) return NextResponse.json({ error: "Missing guildId" }, { status: 400 });

    try {
        const body = await req.json();
        
        const response = await fetch(`${INTERNAL_MUSIC_API}?guildId=${guildId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: "Bot offline or Music API unreachable" }, { status: 500 });
    }
}
