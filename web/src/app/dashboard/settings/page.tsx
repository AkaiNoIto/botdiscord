"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Save, Bell, ShieldCheck, Hash, ListTodo, Activity, TerminalSquare } from "lucide-react";

export default function SettingsPage() {
  const [guilds, setGuilds] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [badwords, setBadwords] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guildsRes, settingsRes, badwordsRes] = await Promise.all([
          fetch("/api/user/guilds"),
          fetch("/api/settings"),
          fetch("/api/badwords")
        ]);
        const guildsData = await guildsRes.json();
        const settingsData = await settingsRes.json();
        const badwordsData = await badwordsRes.json();

        if (Array.isArray(guildsData)) {
          setGuilds(guildsData);
        }
        setSettings(settingsData);
        setBadwords(badwordsData);
      } catch (e) {
        console.error("Failed to fetch data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateSetting = (guildId: string, key: string, value: any) => {
    setSettings({
      ...settings,
      [guildId]: {
        ...(settings[guildId] || {}),
        [key]: value
      }
    });
  };

  const handleAddBadword = (guildId: string, word: string) => {
    if (!word) return;
    const lowerWord = word.toLowerCase();
    const currentWords = badwords[guildId] || [];
    if (!currentWords.includes(lowerWord)) {
      setBadwords({
        ...badwords,
        [guildId]: [...currentWords, lowerWord]
      });
    }
  };

  const handleRemoveBadword = (guildId: string, word: string) => {
    const currentWords = badwords[guildId] || [];
    setBadwords({
      ...badwords,
      [guildId]: currentWords.filter((w: string) => w !== word)
    });
  };

  const handleSave = async (guildId: string) => {
    setSaving(true);
    const guildSettings = settings[guildId] || {};
    const updated = { ...settings, [guildId]: guildSettings };

    await Promise.all([
      fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) }),
      fetch("/api/badwords", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(badwords) })
    ]);
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-discord"></div>
    </div>
  );

  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h1 className="text-4xl font-black text-white mb-3">Configuration du Serveur</h1>
        <p className="text-zinc-500 text-lg">Gérez les serveurs où vous avez les permissions Administrateur.</p>
      </div>

      {guilds.length === 0 ? (
        <div className="p-20 bg-zinc-950 border border-dashed border-zinc-800 rounded-[3rem] text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-600">
            <ListTodo className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Aucun Serveur Gérable</h2>
          <p className="text-zinc-500 max-w-sm mx-auto">Soit vous n'êtes administrateur d'aucun serveur, soit le bot n'a pas encore été ajouté à vos serveurs.</p>
          <Link
            href="https://discord.com/oauth2/authorize?client_id=1496111799706325043&permissions=8&integration_type=0&scope=bot+applications.commands"
            target="_blank"
            className="inline-block px-6 py-3 bg-discord text-white rounded-xl font-bold hover:scale-105 transition-all"
          >
            Inviter le Bot sur un Serveur
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {guilds.map((guild: any) => {
            const guildId = guild.id;
            const guildSettings = settings[guildId] || {};
            const guildBadWords = badwords[guildId] || [];

            return (
              <div key={guildId} className="p-10 bg-zinc-950 border border-zinc-900 rounded-[3rem] space-y-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                  <ShieldCheck className="w-32 h-32 text-discord" />
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-5">
                    {guild.icon ? (
                      <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} className="w-16 h-16 rounded-2xl border border-zinc-800 shadow" alt="" />
                    ) : (
                      <div className="w-16 h-16 bg-discord/10 rounded-2xl flex items-center justify-center text-discord border border-discord/20 font-black text-xl shadow">
                        {guild.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-black text-white">{guild.name}</h2>
                      <p className="text-zinc-500 font-medium tracking-wide">ID: {guildId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSave(guildId)}
                    disabled={saving}
                    className="flex items-center gap-3 px-8 py-4 bg-discord text-white rounded-2xl font-black hover:scale-[1.05] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-discord/20"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? "Enregistrement..." : "Appliquer les Changements"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">

                  {/* Column 1 */}
                  <div className="space-y-10">
                    {/* Welcome Module */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-zinc-500 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-zinc-900 pb-3">
                        <Bell className="w-4 h-4 text-discord" /> Protocole de Bienvenue
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-600 uppercase ml-1">ID du Salon</label>
                          <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                              type="text"
                              value={guildSettings.welcomeChannel || ""}
                              onChange={(e) => handleUpdateSetting(guildId, 'welcomeChannel', e.target.value)}
                              className="w-full p-4 pl-12 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-discord outline-none transition-all text-white font-medium"
                              placeholder="ID du salon..."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-600 uppercase ml-1">Message Personnalisé</label>
                          <textarea
                            value={guildSettings.welcomeMessage || ""}
                            onChange={(e) => handleUpdateSetting(guildId, 'welcomeMessage', e.target.value)}
                            className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-discord outline-none transition-all text-white font-medium min-h-[100px]"
                            placeholder="Bienvenue {user} sur {guild} !"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Leave Module */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-zinc-500 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-zinc-900 pb-3">
                        <Bell className="w-4 h-4 text-red-400" /> Protocole de Depart
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-600 uppercase ml-1">ID du Salon</label>
                          <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                              type="text"
                              value={guildSettings.leaveChannel || ""}
                              onChange={(e) => handleUpdateSetting(guildId, "leaveChannel", e.target.value)}
                              className="w-full p-4 pl-12 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-red-400 outline-none transition-all text-white font-medium"
                              placeholder="ID du salon..."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-600 uppercase ml-1">Message de Depart</label>
                          <textarea
                            value={guildSettings.leaveMessage || ""}
                            onChange={(e) => handleUpdateSetting(guildId, "leaveMessage", e.target.value)}
                            className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-red-400 outline-none transition-all text-white font-medium min-h-[100px]"
                            placeholder="{user} a quitte le serveur..."
                          />
                        </div>
                      </div>
                    </div>
                    {/* Support Module */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-blue-500 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-zinc-900 pb-3">
                        <Bell className="w-4 h-4" /> Protocole de Support
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-600 uppercase ml-1">ID Catégorie Tickets</label>
                          <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                              type="text"
                              value={guildSettings.ticketCategory || ""}
                              onChange={(e) => handleUpdateSetting(guildId, 'ticketCategory', e.target.value)}
                              className="w-full p-4 pl-12 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-blue-500 outline-none transition-all text-white font-medium"
                              placeholder="ID de la catégorie..."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-600 uppercase ml-1">ID Rôle Support (Autorisé à répondre)</label>
                          <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                              type="text"
                              value={guildSettings.ticketAdminRole || ""}
                              onChange={(e) => handleUpdateSetting(guildId, 'ticketAdminRole', e.target.value)}
                              className="w-full p-4 pl-12 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-blue-500 outline-none transition-all text-white font-medium"
                              placeholder="ID du rôle..."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-600 uppercase ml-1">ID Salon des Logs (Transcriptions)</label>
                          <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                              type="text"
                              value={guildSettings.ticketLogChannel || ""}
                              onChange={(e) => handleUpdateSetting(guildId, 'ticketLogChannel', e.target.value)}
                              className="w-full p-4 pl-12 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-blue-500 outline-none transition-all text-white font-medium"
                              placeholder="ID du salon..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Module */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-red-500 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-zinc-900 pb-3">
                        <ShieldCheck className="w-4 h-4" /> Protocole de Sécurité
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 bg-zinc-900/50 rounded-2xl border border-zinc-900 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white">Activer l'Auto-Mod (Filtre de mots)</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={guildSettings.autoModEnabled === true}
                            onChange={(e) => handleUpdateSetting(guildId, 'autoModEnabled', e.target.checked)}
                            className="w-6 h-6 accent-red-500 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Economy Module */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-amber-500 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-zinc-900 pb-3">
                        <Activity className="w-4 h-4" /> Économie Passive
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-600 uppercase ml-1">Coins par Message (1m cooldown)</label>
                          <div className="relative">
                            <input
                              type="number" min="0"
                              value={guildSettings.coinsPerMessage || 0}
                              onChange={(e) => handleUpdateSetting(guildId, 'coinsPerMessage', parseInt(e.target.value) || 0)}
                              className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-amber-500 outline-none transition-all text-amber-500 font-bold"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-600 uppercase ml-1">Coins par Minute en Vocal</label>
                          <div className="relative">
                            <input
                              type="number" min="0"
                              value={guildSettings.coinsPerVoiceMinute || 0}
                              onChange={(e) => handleUpdateSetting(guildId, 'coinsPerVoiceMinute', parseInt(e.target.value) || 0)}
                              className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-amber-500 outline-none transition-all text-amber-500 font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-10">
                    {/* Moderation & Systems */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-red-500 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-zinc-900 pb-3">
                        <ShieldCheck className="w-4 h-4" /> Contrôle des Systèmes
                      </h3>
                      <div className="space-y-4">

                        {/* Advanced Logs Hub */}
                        <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-4">
                          <h4 className="text-xs font-bold text-zinc-500 uppercase">Hub de Logs Avancé</h4>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase ml-1">Messages Envoyés</label>
                            <input type="text" value={guildSettings.logMsgSend || ""} onChange={(e) => handleUpdateSetting(guildId, 'logMsgSend', e.target.value)} className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-red-500 text-sm outline-none text-white font-medium" placeholder="ID du salon..." />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase ml-1">Messages Modifiés</label>
                            <input type="text" value={guildSettings.logMsgEdit || ""} onChange={(e) => handleUpdateSetting(guildId, 'logMsgEdit', e.target.value)} className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-red-500 text-sm outline-none text-white font-medium" placeholder="ID du salon..." />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase ml-1">Messages Supprimés</label>
                            <input type="text" value={guildSettings.logMsgDelete || ""} onChange={(e) => handleUpdateSetting(guildId, 'logMsgDelete', e.target.value)} className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-red-500 text-sm outline-none text-white font-medium" placeholder="ID du salon..." />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase ml-1">Logs Vocaux (Connexion/Déconnexion)</label>
                            <input type="text" value={guildSettings.logVoice || ""} onChange={(e) => handleUpdateSetting(guildId, 'logVoice', e.target.value)} className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-red-500 text-sm outline-none text-white font-medium" placeholder="ID du salon..." />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 pt-2">
                          <div className="flex items-center justify-between p-5 bg-zinc-900/50 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-colors">
                            <div className="flex items-center gap-3">
                              <Activity className="w-5 h-5 text-red-500" />
                              <span className="font-bold text-white">Protocole Auto-Mod</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={guildSettings.autoModEnabled || false}
                              onChange={(e) => handleUpdateSetting(guildId, 'autoModEnabled', e.target.checked)}
                              className="w-6 h-6 accent-red-500 rounded-lg cursor-pointer"
                            />
                          </div>

                          {/* Auto mod bad words editor */}
                          <div className="space-y-2 p-5 bg-zinc-900/20 rounded-2xl border border-zinc-900/50">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Liste des Mots Interdits</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {guildBadWords.map((word: string) => (
                                <span key={word} className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                  {word}
                                  <button onClick={() => handleRemoveBadword(guildId, word)} className="hover:text-white">&times;</button>
                                </span>
                              ))}
                              {guildBadWords.length === 0 && <span className="text-xs text-zinc-600 italic">Aucun mot interdit.</span>}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                id={`bw_${guildId}`}
                                placeholder="Taper un mot..."
                                className="flex-1 bg-zinc-900 border border-zinc-800 p-2 rounded-xl text-sm focus:border-red-500 outline-none"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddBadword(guildId, e.currentTarget.value);
                                    e.currentTarget.value = "";
                                  }
                                }}
                              />
                              <button
                                onClick={() => {
                                  const inp = document.getElementById(`bw_${guildId}`) as HTMLInputElement;
                                  if (inp) {
                                    handleAddBadword(guildId, inp.value);
                                    inp.value = "";
                                  }
                                }}
                                className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-xl font-bold text-sm transition-all"
                              >Ajouter</button>
                            </div>
                          </div>

                          {/* Leveling Protocol */}
                          <div className="space-y-6 pt-10 border-t border-zinc-900">
                            <h3 className="text-xs font-black text-indigo-500 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-zinc-900 pb-3">
                              <Activity className="w-4 h-4" /> Protocole de Niveaux
                            </h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-5 bg-zinc-900/50 rounded-2xl border border-zinc-900 transition-colors">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-white">Activer le Systeme XP</span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={guildSettings.levelingEnabled !== false}
                                  onChange={(e) => handleUpdateSetting(guildId, 'levelingEnabled', e.target.checked)}
                                  className="w-6 h-6 accent-indigo-500 rounded-lg cursor-pointer"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-600 uppercase ml-1">ID Salon Annonces de Niveaux</label>
                                <div className="relative">
                                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                  <input
                                    type="text"
                                    value={guildSettings.levelUpChannel || ""}
                                    onChange={(e) => handleUpdateSetting(guildId, 'levelUpChannel', e.target.value)}
                                    className="w-full p-4 pl-12 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-indigo-500 outline-none transition-all text-white font-medium"
                                    placeholder="Laisser vide pour salon actuel..."
                                  />
                                </div>
                              </div>
                              <div className="space-y-2 p-5 bg-zinc-900/20 rounded-2xl border border-zinc-900/50">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Roles autorises a gagner de l XP</label>
                                <p className="text-xs text-zinc-600">Laisser vide = tout le monde. Ajouter des roles pour restreindre.</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {(guildSettings.levelXPRoles || []).map((roleId: string) => (
                                    <span key={roleId} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                      {roleId}
                                      <button onClick={() => handleUpdateSetting(guildId, 'levelXPRoles', (guildSettings.levelXPRoles || []).filter((r: string) => r !== roleId))} className="hover:text-white">&times;</button>
                                    </span>
                                  ))}
                                  {(guildSettings.levelXPRoles || []).length === 0 && <span className="text-xs text-zinc-600 italic">Tout le monde (aucun filtre).</span>}
                                </div>
                                <div className="flex gap-2">
                                  <input type="text" id={"xprole_" + guildId} placeholder="ID du role..." className="flex-1 bg-zinc-900 border border-zinc-800 p-2 rounded-xl text-sm focus:border-indigo-500 outline-none" />
                                  <button onClick={() => { const inp = document.getElementById("xprole_" + guildId) as HTMLInputElement; if (inp && inp.value.trim()) { const current = guildSettings.levelXPRoles || []; if (!current.includes(inp.value.trim())) { handleUpdateSetting(guildId, 'levelXPRoles', [...current, inp.value.trim()]); } inp.value = ""; } }} className="bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400 px-4 py-2 rounded-xl font-bold text-sm transition-all">Ajouter</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ad System Protocol */}
                      <div className="space-y-6 pt-10 border-t border-zinc-900">
                        <h3 className="text-xs font-black text-yellow-500 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-zinc-900 pb-3">
                          <TerminalSquare className="w-4 h-4" /> Protocole Publicitaire
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-600 uppercase ml-1">ID Salon Pub</label>
                            <div className="relative">
                              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                              <input
                                type="text"
                                value={guildSettings.adChannelId || ""}
                                onChange={(e) => handleUpdateSetting(guildId, 'adChannelId', e.target.value)}
                                className="w-full p-3 pl-12 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-yellow-500 outline-none text-white text-sm"
                                placeholder="ID du salon..."
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-600 uppercase ml-1">ID Rôle Pub</label>
                            <div className="relative">
                              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                              <input
                                type="text"
                                value={guildSettings.adRoleId || ""}
                                onChange={(e) => handleUpdateSetting(guildId, 'adRoleId', e.target.value)}
                                className="w-full p-3 pl-12 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-yellow-500 outline-none text-white text-sm"
                                placeholder="ID du rôle..."
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-600 uppercase ml-1">Prix Initial (Coins)</label>
                            <input
                              type="number"
                              value={guildSettings.adInitialPrice || 0}
                              onChange={(e) => handleUpdateSetting(guildId, 'adInitialPrice', parseInt(e.target.value))}
                              className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-yellow-500 outline-none text-white text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-600 uppercase ml-1">Prix Recharge (Coins)</label>
                            <input
                              type="number"
                              value={guildSettings.adRechargePrice || 0}
                              onChange={(e) => handleUpdateSetting(guildId, 'adRechargePrice', parseInt(e.target.value))}
                              className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-yellow-500 outline-none text-white text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                  </div>
                </div>
  );
})}
        </div >
      )}
    </div >
  );
}


