import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import fs from 'fs';
import path from 'path';

const shopPath = path.join(process.cwd(), '../src/data/shop.json');

const readFile = (p: string) => {
    try {
        if (!fs.existsSync(p)) return {};
        return JSON.parse(fs.readFileSync(p, 'utf8') || '{}');
    } catch { return {}; }
};

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const shop = readFile(shopPath);
    return NextResponse.json(shop);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const payload = await req.json();
        
        if (typeof payload !== 'object' || Array.isArray(payload)) {
             return NextResponse.json({ error: "Invalid payload format." }, { status: 400 });
        }

        fs.writeFileSync(shopPath, JSON.stringify(payload, null, 4));
        return NextResponse.json({ success: true });
    } catch (e: any) {
         console.error("Error saving shop:", e);
         return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
