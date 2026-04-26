"use client";

import { useEffect, useState } from "react";
import { Trophy, Star, Server, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PublicLeaderboard({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/public/leaderboard/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Server not found or bot not present");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-discord"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-center p-6">
        <Server className="w-20 h-20 text-zinc-800 mb-6" />
        <h1 className="text-3xl font-black text-white mb-2">Non trouvé</h1>
        <p className="text-zinc-500 mb-8">{error}</p>
        <Link href="/" className="px-6 py-3 bg-discord text-white font-bold rounded-2xl hover:scale-105 transition-transform">
          Retour à <span translate="no" className="notranslate">Nexus</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 font-bold text-sm">
              <ArrowLeft className="w-4 h-4" /> Retour à <span translate="no" className="notranslate">Nexus</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-4">
              <Server className="w-10 h-10 text-discord" /> Classement Public
            </h1>
            <p className="text-zinc-500 text-lg mt-2 font-medium tracking-wide">ID du Serveur : {params.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Economy Leaderboard */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-8 md:p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-8">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Économie Globale
            </h2>
            
            <div className="space-y-4">
              {data.economy.length === 0 ? (
                <p className="text-center text-zinc-600 py-10 font-bold">Aucune donnée économique disponible.</p>
              ) : (
                data.economy.map((user: any, index: number) => (
                  <div key={user.id} className={`flex items-center justify-between p-5 rounded-3xl border transition-all hover:scale-[1.02] ${
                    index === 0 ? "bg-yellow-500/10 border-yellow-500/20 shadow-lg shadow-yellow-500/5" :
                    index === 1 ? "bg-zinc-400/5 border-zinc-400/20" :
                    index === 2 ? "bg-amber-700/5 border-amber-700/20" :
                    "bg-zinc-900/50 border-zinc-800"
                  }`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                        index === 0 ? "bg-yellow-500 text-black" :
                        index === 1 ? "bg-zinc-400 text-black" :
                        index === 2 ? "bg-amber-600 text-black" :
                        "bg-zinc-800 text-zinc-400"
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-mono text-zinc-300 font-bold">{user.id}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-white">{user.balance.toLocaleString()}</span>
                      <span className="text-yellow-500 text-sm font-bold ml-1">¢</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Level Leaderboard */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-8 md:p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-8">
              <Star className="w-8 h-8 text-discord" />
              Membres Actifs
            </h2>
            
            <div className="space-y-4">
              {data.levels.length === 0 ? (
                <p className="text-center text-zinc-600 py-10 font-bold">Aucune donnée de niveau disponible pour ce serveur.</p>
              ) : (
                data.levels.map((user: any, index: number) => (
                  <div key={user.id} className={`flex items-center justify-between p-5 rounded-3xl border transition-all hover:scale-[1.02] ${
                    index === 0 ? "bg-discord/10 border-discord/30 shadow-lg shadow-discord/5" :
                    "bg-zinc-900/50 border-zinc-800"
                  }`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                        index === 0 ? "bg-discord text-white shadow-lg shadow-discord/50" :
                        "bg-zinc-800 text-zinc-400"
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-mono text-zinc-300 font-bold">{user.id}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-white">Lvl {user.level}</div>
                      <div className="text-discord text-xs font-bold uppercase tracking-wider">{user.xp.toLocaleString()} XP</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
