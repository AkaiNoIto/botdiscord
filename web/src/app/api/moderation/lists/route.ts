import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import fs from 'fs';
import path from 'path';

const listsPath = path.join(process.cwd(), '../src/data/lists.json');

const readFile = (p: string) => {
    try {
        if (!fs.existsSync(p)) return { blacklist: [], whitelist: [] };
        return JSON.parse(fs.readFileSync(p, 'utf8') || '{"blacklist":[],"whitelist":[]}');
    } catch { return { blacklist: [], whitelist: [] }; }
};

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, userId } = await req.json();
    const lists = readFile(listsPath);

    if (action === 'blacklist_add' && !lists.blacklist.includes(userId)) {
        lists.blacklist.push(userId);
    } else if (action === 'blacklist_remove') {
        lists.blacklist = lists.blacklist.filter((id: string) => id !== userId);
    } else if (action === 'whitelist_add' && !lists.whitelist.includes(userId)) {
        lists.whitelist.push(userId);
    } else if (action === 'whitelist_remove') {
        lists.whitelist = lists.whitelist.filter((id: string) => id !== userId);
    }

    fs.writeFileSync(listsPath, JSON.stringify(lists, null, 4));
    return NextResponse.json({ success: true, lists });
}
