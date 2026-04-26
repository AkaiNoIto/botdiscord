"use client";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { LogOut, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function DashboardShell({ session, children }: { session: any, children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-zinc-300">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed md:sticky top-0 h-screen z-30 w-64 border-r border-zinc-900 bg-zinc-950 p-6 flex flex-col gap-8 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-white font-bold text-xl px-2 hover:scale-[1.02] transition-transform">
            <img src="/logo.png" className="w-8 h-8 rounded-lg shadow-lg shadow-indigo-500/20" alt="Logo" />
            <span translate="no" className="notranslate">Nexus</span>
          </Link>
          <button className="md:hidden text-zinc-400" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
        <div className="border-t border-zinc-900 pt-6 space-y-3 mt-auto">
          <div className="flex items-center gap-3 px-2">
            <img src={session?.user?.image ?? ""} alt="profile" className="w-9 h-9 rounded-full border border-zinc-800" />
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-white truncate">{session?.user?.name}</p>
              <p className="text-xs text-zinc-500 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm font-medium w-full"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center gap-4 p-4 border-b border-zinc-900 bg-zinc-950 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-zinc-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/" className="flex items-center gap-2 text-white font-bold">
            <img src="/logo.png" className="w-7 h-7 rounded-lg" alt="Logo" />
            <span>Nexus</span>
          </Link>
        </div>
        <main className="flex-1 p-4 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
