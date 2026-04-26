import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import fs from 'fs';
import path from 'path';

const commandsPath = path.join(process.cwd(), '../src/data/customCommands.json');

const readFile = (p: string) => {
    try {
        if (!fs.existsSync(p)) return {};
        return JSON.parse(fs.readFileSync(p, 'utf8') || '{}');
    } catch { return {}; }
};

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const commands = readFile(commandsPath);
    return NextResponse.json(commands);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const payload = await req.json();
        
        // Basic validation checking if payload is an object.
        if (typeof payload !== 'object' || Array.isArray(payload)) {
             return NextResponse.json({ error: "Invalid payload format." }, { status: 400 });
        }

        fs.writeFileSync(commandsPath, JSON.stringify(payload, null, 4));
        return NextResponse.json({ success: true });
    } catch (e: any) {
         console.error("Error saving custom commands:", e);
         return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
