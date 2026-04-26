"use client";

import { useState, useEffect } from "react";
import { Ban, ShieldAlert, UserMinus, History, UserCheck, UserX, Plus, Trash2, Trophy, Star } from "lucide-react";

export default function ModerationDashboard() {
  const [data, setData] = useState<any>({ blacklist: [], whitelist: [], leaderboard: [], levelsBoard: [] });
  const [loading, setLoading] = useState(true);
  const [newId, setNewId] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "blacklist" | "whitelist" | "economy" | "levels">("overview");

  useEffect(() => {
    fetch("/api/moderation")
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  const handleListAction = async (action: string, userId: string) => {
    const res = await fetch("/api/moderation/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId })
    });
    const updated = await res.json();
    setData((prev: any) => ({ ...prev, blacklist: updated.lists.blacklist, whitelist: updated.lists.whitelist }));
    setNewId("");
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5865F2]"></div>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Aperçu", icon: <History className="w-4 h-4" /> },
    { id: "blacklist", label: "Liste Noire", icon: <Ban className="w-4 h-4" /> },
    { id: "whitelist", label: "Liste Blanche", icon: <UserCheck className="w-4 h-4" /> },
    { id: "economy", label: "Économie", icon: <Trophy className="w-4 h-4" /> },
    { id: "levels", label: "Niveaux", icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-4xl font-black text-white mb-3">Centre de Modération</h1>
        <p className="text-zinc-500 text-lg">Gérez la sécurité du serveur, les listes et les classements.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-zinc-950 border border-zinc-900 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id
                ? "bg-[#5865F2] text-white shadow-lg"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <History className="w-5 h-5 text-[#5865F2]" /> Stats du Serveur
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between p-4 bg-zinc-900/50 rounded-2xl">
                <span className="text-zinc-400">Utilisateurs Bannis</span>
                <span className="font-bold text-red-400">{data.blacklist.length}</span>
              </div>
              <div className="flex justify-between p-4 bg-zinc-900/50 rounded-2xl">
                <span className="text-zinc-400">Utilisateurs Autorisés</span>
                <span className="font-bold text-green-400">{data.whitelist.length}</span>
              </div>
              <div className="flex justify-between p-4 bg-zinc-900/50 rounded-2xl">
                <span className="text-zinc-400">Joueurs Économie</span>
                <span className="font-bold text-yellow-400">{data.leaderboard.length}</span>
              </div>
              <div className="flex justify-between p-4 bg-zinc-900/50 rounded-2xl">
                <span className="text-zinc-400">Joueurs Classés</span>
                <span className="font-bold text-blue-400">{data.levelsBoard.length}</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-[2.5rem] space-y-4 flex flex-col">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert className="w-6 h-6" />
              <h2 className="font-bold text-lg">Verrouillage d'Urgence</h2>
            </div>
            <p className="text-sm text-zinc-500 flex-1">Empêchez instantanément quiconque de rejoindre ou d'envoyer des messages.</p>
            <button className="px-6 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-500 transition-all w-fit">
              Activer le Lockdown
            </button>
          </div>
        </div>
      )}

      {/* Blacklist Tab */}
      {activeTab === "blacklist" && (
        <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Ban className="w-5 h-5 text-red-400" /> Liste Noire d'Utilisateurs
            <span className="ml-auto text-sm bg-red-500/10 text-red-400 px-3 py-1 rounded-full font-medium">{data.blacklist.length} utilisateurs</span>
          </h2>

          <div className="flex gap-3">
            <input
              value={newId}
              onChange={e => setNewId(e.target.value)}
              placeholder="ID Utilisateur Discord..."
              className="flex-1 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-red-500 outline-none text-white"
            />
            <button
              onClick={() => newId && handleListAction("blacklist_add", newId)}
              className="px-5 py-3 bg-red-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-red-500"
            >
              <Plus className="w-5 h-5" /> Ajouter
            </button>
          </div>

          <div className="space-y-3">
            {data.blacklist.length === 0 ? (
              <p className="text-zinc-600 text-center py-8">Aucun utilisateur sur liste noire.</p>
            ) : data.blacklist.map((id: string) => (
              <div key={id} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400">
                    <UserX className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-zinc-300">{id}</span>
                </div>
                <button onClick={() => handleListAction("blacklist_remove", id)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Whitelist Tab */}
      {activeTab === "whitelist" && (
        <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-green-400" /> Liste Blanche d'Utilisateurs
            <span className="ml-auto text-sm bg-green-500/10 text-green-400 px-3 py-1 rounded-full font-medium">{data.whitelist.length} utilisateurs</span>
          </h2>

          <div className="flex gap-3">
            <input
              value={newId}
              onChange={e => setNewId(e.target.value)}
              placeholder="ID Utilisateur Discord..."
              className="flex-1 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-green-500 outline-none text-white"
            />
            <button
              onClick={() => newId && handleListAction("whitelist_add", newId)}
              className="px-5 py-3 bg-green-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-green-500"
            >
              <Plus className="w-5 h-5" /> Ajouter
            </button>
          </div>

          <div className="space-y-3">
            {data.whitelist.length === 0 ? (
              <p className="text-zinc-600 text-center py-8">Aucun utilisateur sur liste blanche.</p>
            ) : data.whitelist.map((id: string) => (
              <div key={id} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-zinc-300">{id}</span>
                </div>
                <button onClick={() => handleListAction("whitelist_remove", id)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Economy Leaderboard Tab */}
      {activeTab === "economy" && (
        <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-400" /> Classement Économie
          </h2>
          <div className="space-y-3">
            {data.leaderboard.length === 0 ? (
              <p className="text-zinc-600 text-center py-8">Aucune donnée pour le moment.</p>
            ) : data.leaderboard.map((entry: any, i: number) => (
              <div key={entry.id} className={`flex items-center justify-between p-4 rounded-2xl border ${
                i === 0 ? "bg-yellow-500/5 border-yellow-500/20" :
                i === 1 ? "bg-zinc-400/5 border-zinc-400/20" :
                i === 2 ? "bg-amber-700/5 border-amber-700/20" :
                "bg-zinc-900/50 border-zinc-900"
              }`}>
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-black w-8 ${i === 0 ? "text-yellow-400" : i === 1 ? "text-zinc-400" : i === 2 ? "text-amber-600" : "text-zinc-600"}`}>
                    {i + 1}
                  </span>
                  <span className="font-mono text-zinc-400 text-sm">{entry.id}</span>
                </div>
                <span className="font-black text-white text-lg">{entry.balance.toLocaleString()} <span className="text-yellow-400 text-sm">coins</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Levels Leaderboard Tab */}
      {activeTab === "levels" && (
        <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Star className="w-5 h-5 text-blue-400" /> Classement des Niveaux
          </h2>
          <div className="space-y-3">
            {data.levelsBoard.length === 0 ? (
              <p className="text-zinc-600 text-center py-8">Aucune donnée pour le moment.</p>
            ) : data.levelsBoard.map((entry: any, i: number) => (
              <div key={entry.id} className={`flex items-center justify-between p-4 rounded-2xl border ${
                i === 0 ? "bg-blue-500/5 border-blue-500/20" : "bg-zinc-900/50 border-zinc-900"
              }`}>
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-black w-8 ${i === 0 ? "text-blue-400" : "text-zinc-600"}`}>{i + 1}</span>
                  <span className="font-mono text-zinc-400 text-sm">{entry.id}</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-white">Niveau {entry.level}</p>
                  <p className="text-xs text-zinc-500">{entry.xp} XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
