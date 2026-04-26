"use client";

import { useState, useEffect } from "react";
import { TerminalSquare, Plus, Save, Trash2, Link as LinkIcon, MessageSquare, Image as ImageIcon } from "lucide-react";

export default function CustomCommandsPage() {
  const [guilds, setGuilds] = useState<any[]>([]);
  const [commands, setCommands] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guildsRes, cmdsRes] = await Promise.all([
          fetch("/api/user/guilds"),
          fetch("/api/custom-commands"),
        ]);
        const guildsData = await guildsRes.json();
        const cmdsData = await cmdsRes.json();

        if (Array.isArray(guildsData)) {
          setGuilds(guildsData);
          if (guildsData.length > 0) {
            setSelectedGuildId(guildsData[0].id);
          }
        }
        setCommands(cmdsData);
      } catch (e) {
        console.error("Failed to fetch data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/custom-commands", {
      method: "POST",
      body: JSON.stringify(commands),
    });
    setSaving(false);
    if (res.ok) {
      alert("✅ Configuration appliquée avec succès !");
    } else {
      alert("❌ Échec de l'enregistrement de la configuration.");
    }
  };

  const handleAddCommand = () => {
    if (!selectedGuildId) return;
    const newName = `cmd_${Date.now().toString().slice(-4)}`;
    setCommands((prev: any) => ({
      ...prev,
      [selectedGuildId]: {
        ...(prev[selectedGuildId] || {}),
        [newName]: { text: "", image: "" },
      },
    }));
  };

  const handleUpdateCommand = (cmdName: string, field: string, value: string) => {
    if (!selectedGuildId) return;
    setCommands((prev: any) => ({
      ...prev,
      [selectedGuildId]: {
        ...(prev[selectedGuildId] || {}),
        [cmdName]: {
          ...(prev[selectedGuildId]?.[cmdName] || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleDeleteCommand = async (cmdName: string) => {
    if (!selectedGuildId) return;
    const updatedGuildCmds = { ...commands[selectedGuildId] };
    delete updatedGuildCmds[cmdName];

    const newCommands = {
      ...commands,
      [selectedGuildId]: updatedGuildCmds,
    };

    setCommands(newCommands);

    // Auto-save immediately upon deletion
    await fetch("/api/custom-commands", {
      method: "POST",
      body: JSON.stringify(newCommands),
    });
  };

  const handleRenameCommand = (oldName: string, newName: string) => {
    if (!selectedGuildId || oldName === newName || !newName.trim()) return;
    const updatedGuildCmds = { ...commands[selectedGuildId] };
    updatedGuildCmds[newName] = updatedGuildCmds[oldName];
    delete updatedGuildCmds[oldName];

    setCommands((prev: any) => ({
      ...prev,
      [selectedGuildId]: updatedGuildCmds,
    }));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-discord"></div>
      </div>
    );

  const currentGuildCmds = selectedGuildId ? commands[selectedGuildId] || {} : {};

  return (
    <div className="space-y-10 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-3">Commandes Perso</h1>
          <p className="text-zinc-500 text-lg">Créez des réponses personnalisées du bot pour votre communauté.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-discord text-white rounded-2xl font-black hover:scale-[1.05] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-discord/20"
        >
          <Save className="w-5 h-5" />
          {saving ? "Enregistrement..." : "Appliquer les Changements"}
        </button>
      </div>

      {guilds.length === 0 ? (
        <div className="p-20 bg-zinc-950 border border-dashed border-zinc-800 rounded-[3rem] text-center space-y-4">
          <TerminalSquare className="w-16 h-16 text-zinc-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Aucun Serveur Gérable</h2>
          <p className="text-zinc-500 max-w-sm mx-auto">
            Veuillez d'abord inviter le bot sur un serveur où vous avez les permissions Administrateur.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Server Selector */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-zinc-400 uppercase tracking-widest text-xs ml-2">Choisir un Serveur</h3>
            <div className="space-y-2">
              {guilds.map((guild) => (
                <button
                  key={guild.id}
                  onClick={() => setSelectedGuildId(guild.id)}
                  className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all ${selectedGuildId === guild.id
                      ? "bg-zinc-900 border border-zinc-800 text-white"
                      : "text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300"
                    }`}
                >
                  {guild.icon ? (
                    <img
                      src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                      className="w-8 h-8 rounded-lg"
                      alt=""
                    />
                  ) : (
                    <div className="w-8 h-8 bg-discord/20 text-discord flex items-center justify-center rounded-lg font-bold">
                      {guild.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-bold truncate text-sm">{guild.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Commands Editor */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between p-6 bg-zinc-950 border border-zinc-900 rounded-[2rem]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-discord/10 rounded-xl flex items-center justify-center text-discord">
                  <TerminalSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Commandes du Serveur</h2>
                  <p className="text-zinc-500 text-sm">Prefixe : <code className="text-discord bg-discord/10 px-1 py-0.5 rounded">^^^</code></p>
                </div>
              </div>
              <button
                onClick={handleAddCommand}
                className="flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl transition-all"
              >
                <Plus className="w-4 h-4" /> Nouvelle Commande
              </button>
            </div>

            {Object.keys(currentGuildCmds).length === 0 ? (
              <div className="p-16 text-center bg-zinc-950 rounded-[2rem] border border-dashed border-zinc-800">
                <p className="text-zinc-500 font-medium">Aucune commande personnalisée pour le moment.</p>
                <button
                  onClick={handleAddCommand}
                  className="mt-4 text-discord hover:underline font-bold"
                >
                  Créez votre première commande
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(currentGuildCmds).map(([cmdName, cmdData]: [string, any]) => (
                  <CommandEditor
                    key={cmdName}
                    initialName={cmdName}
                    cmdData={cmdData}
                    onRename={(oldName, newName) => handleRenameCommand(oldName, newName)}
                    onUpdate={(field, value) => handleUpdateCommand(cmdName, field, value)}
                    onDelete={() => handleDeleteCommand(cmdName)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CommandEditor({ initialName, cmdData, onRename, onUpdate, onDelete }: { initialName: string, cmdData: any, onRename: (old: string, n: string) => void, onUpdate: (f: string, v: string) => void, onDelete: () => void }) {
  const [localName, setLocalName] = useState(initialName);

  const handleBlur = () => {
    const formattedName = localName.toLowerCase().replace(/\s+/g, '');
    setLocalName(formattedName);
    if (formattedName && formattedName !== initialName) {
      onRename(initialName, formattedName);
    } else if (!formattedName) {
      setLocalName(initialName); // Revert if empty
    }
  };

  return (
    <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-[2rem] space-y-6 group">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <TerminalSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleBlur}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-white font-bold tracking-wide focus:border-discord outline-none transition-all"
            placeholder="nomcommande"
          />
        </div>
        <button
          onClick={onDelete}
          className="p-3 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Réponse Texte
          </label>
          <textarea
            value={cmdData.text || ""}
            onChange={(e) => onUpdate("text", e.target.value)}
            className="w-full h-32 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-discord outline-none transition-all text-zinc-300 resize-none"
            placeholder="Que doit dire le bot ?"
          />
        </div>
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> URL de l'Image (Optionnel)
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              value={cmdData.image || ""}
              onChange={(e) => onUpdate("image", e.target.value)}
              className="w-full p-4 pl-12 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-discord outline-none transition-all text-zinc-300 text-sm"
              placeholder="https://exemple.com/image.png"
            />
          </div>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider ml-1">
            Astuce : Utilisez une URL complète (Discord link, Imgur) ou un chemin relatif.
          </p>
          {cmdData.image && (
            <div className="mt-4 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-video relative group/img">
              <img
                src={cmdData.image}
                alt="Aperçu"
                className="w-full h-full object-contain transition-all"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x225?text=Lien+Image+Invalide";
                }}
              />
              <div className="absolute top-3 left-3">
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white border border-white/10 uppercase tracking-widest">
                  Aperçu en Direct
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}