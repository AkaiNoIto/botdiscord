import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from "next-auth";

const settingsPath = path.join(process.cwd(), '../src/data/settings.json');

export async function GET() {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = JSON.parse(fs.readFileSync(settingsPath, 'utf8') || '{}');
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = JSON.parse(fs.readFileSync(settingsPath, 'utf8') || '{}');
    
    // Merge or set data
    const updatedData = { ...data, ...body };
    fs.writeFileSync(settingsPath, JSON.stringify(updatedData, null, 4));

    return NextResponse.json({ success: true });
}
