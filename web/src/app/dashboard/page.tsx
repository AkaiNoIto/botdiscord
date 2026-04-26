"use client";

import { useSession } from "next-auth/react";
import { Server, Users, Coins, ArrowRight, Settings, Shield, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import StatsCharts from "@/components/StatsCharts";

export default function DashboardOverview() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ activeServers: 0, totalUsers: 0, totalCoins: 0 });
  const [modData, setModData] = useState<any>({ blacklist: [], whitelist: [], leaderboard: [], levelsBoard: [] });

  useEffect(() => {
    fetch("/api/stats").then(res => res.json()).then(data => setStats(data));
    fetch("/api/moderation").then(res => res.json()).then(data => setModData(data));
  }, []);

  const statCards = [
    { label: "Serveurs Actifs", value: stats.activeServers || 0, icon: <Server className="w-5 h-5" />, color: "text-[#5865F2]", bg: "bg-[#5865F2]/10" },
    { label: "Membres Classés", value: stats.totalUsers || 0, icon: <Users className="w-5 h-5" />, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Économie Totale", value: (stats.totalCoins || 0).toLocaleString(), icon: <Coins className="w-5 h-5" />, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  const quickActions = [
    { label: "Paramètres", desc: "Bienvenue, logs, auto-mod", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" />, color: "from-[#5865F2]/10" },
    { label: "Modération", desc: "Blacklist, whitelist, bans", href: "/dashboard/moderation", icon: <Shield className="w-5 h-5" />, color: "from-red-500/10" },
    { label: "Classements", desc: "Économie & Niveaux", href: "/dashboard/moderation", icon: <Coins className="w-5 h-5" />, color: "from-yellow-500/10" },
  ];

  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          Bon retour, <span className="text-[#5865F2]">{session?.user?.name || "Utilisateur"}</span> !
        </h1>
        <p className="text-zinc-500 text-lg">Voici ce qu'il se passe sur vos serveurs en ce moment.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 hover:border-zinc-800 transition-all">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">{card.label}</p>
              <p className="text-3xl font-black text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-zinc-400 mb-4 uppercase tracking-widest text-sm">Gérer</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href}
              className={`p-6 bg-gradient-to-br ${action.color} to-transparent border border-zinc-900 rounded-3xl hover:border-zinc-700 transition-all group space-y-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 group-hover:text-white transition-colors">{action.icon}</span>
                <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <p className="font-bold text-white">{action.label}</p>
                <p className="text-xs text-zinc-600">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <StatsCharts />

      {/* Recent activity — Leaderboard preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-[2rem] space-y-5">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" /> Top Économie
          </h2>
          {modData.leaderboard.length === 0 ? (
            <p className="text-zinc-600 text-sm">Aucune donnée économique pour le moment.</p>
          ) : modData.leaderboard.slice(0, 5).map((e: any, i: number) => (
            <div key={e.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-black w-6 ${i === 0 ? "text-yellow-400" : "text-zinc-600"}`}>{i + 1}</span>
                <span className="text-zinc-400 font-mono text-xs truncate max-w-[140px]">{e.id}</span>
              </div>
              <span className="text-white font-bold text-sm">{e.balance.toLocaleString()} <span className="text-yellow-500">¢</span></span>
            </div>
          ))}
          <Link href="/dashboard/moderation" className="text-xs text-[#5865F2] hover:underline flex items-center gap-1">
            Classement complet <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-[2rem] space-y-5">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#5865F2]" /> Top Niveaux
          </h2>
          {modData.levelsBoard.length === 0 ? (
            <p className="text-zinc-600 text-sm">Aucune donnée de niveau pour le moment.</p>
          ) : modData.levelsBoard.slice(0, 5).map((e: any, i: number) => (
            <div key={e.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-black w-6 ${i === 0 ? "text-[#5865F2]" : "text-zinc-600"}`}>{i + 1}</span>
                <span className="text-zinc-400 font-mono text-xs truncate max-w-[140px]">{e.id}</span>
              </div>
              <span className="text-white font-bold text-sm">Lv. {e.level} <span className="text-zinc-600 text-xs">({e.xp} xp)</span></span>
            </div>
          ))}
          <Link href="/dashboard/moderation" className="text-xs text-[#5865F2] hover:underline flex items-center gap-1">
            Classement complet <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
