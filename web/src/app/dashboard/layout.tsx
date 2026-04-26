import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { LogOut } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-zinc-300">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950 p-6 flex flex-col gap-8 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-3 text-white font-bold text-xl px-2 hover:scale-[1.02] transition-transform">
            <img src="/logo.png" className="w-8 h-8 rounded-lg shadow-lg shadow-indigo-500/20" alt="Logo" />
            <span translate="no" className="notranslate">Nexus</span>
        </Link>

        <Sidebar />

        <div className="border-t border-zinc-900 pt-6 space-y-3">
            <div className="flex items-center gap-3 px-2">
                <img src={session.user?.image ?? ""} alt="profile" className="w-9 h-9 rounded-full border border-zinc-800" />
                <div className="overflow-hidden flex-1">
                    <p className="text-sm font-bold text-white truncate">{session.user?.name}</p>
                    <p className="text-xs text-zinc-500 truncate">Administrator</p>
                </div>
            </div>
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm font-medium w-full"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
