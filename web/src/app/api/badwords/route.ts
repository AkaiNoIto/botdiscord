import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import fs from 'fs';
import path from 'path';

const badwordsPath = path.join(process.cwd(), '../src/data/badwords.json');

const readFile = (p: string) => {
    try {
        if (!fs.existsSync(p)) return {};
        const data = fs.readFileSync(p, 'utf8');
        return data ? JSON.parse(data) : {};
    } catch { return {}; }
};

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const badWords = readFile(badwordsPath);
    return NextResponse.json(badWords);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const words = await req.json();
        if (typeof words !== 'object' || words === null || Array.isArray(words)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        fs.writeFileSync(badwordsPath, JSON.stringify(words, null, 4));
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
