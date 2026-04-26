import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB, Lists } from "@/lib/mongodb";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { action, userId } = await req.json();
    await connectDB();
    const lists = await Lists.findOne({}) || { whitelist: [], blacklist: [] };
    if (action === "blacklist_add" && !lists.blacklist.includes(userId)) lists.blacklist.push(userId);
    else if (action === "blacklist_remove") lists.blacklist = lists.blacklist.filter((id: string) => id !== userId);
    else if (action === "whitelist_add" && !lists.whitelist.includes(userId)) lists.whitelist.push(userId);
    else if (action === "whitelist_remove") lists.whitelist = lists.whitelist.filter((id: string) => id !== userId);
    await Lists.findOneAndUpdate({}, { whitelist: lists.whitelist, blacklist: lists.blacklist }, { upsert: true });
    return NextResponse.json({ success: true, lists });
}
