"use client";

import { useState, useEffect } from "react";
import { Store, Plus, Save, Trash2, Tag, Info, ShieldAlert } from "lucide-react";

export default function ShopBuilderPage() {
  const [guilds, setGuilds] = useState<any[]>([]);
  const [shop, setShop] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guildsRes, shopRes] = await Promise.all([
          fetch("/api/user/guilds"),
          fetch("/api/shop"),
        ]);
        const guildsData = await guildsRes.json();
        const shopData = await shopRes.json();

        if (Array.isArray(guildsData)) {
          setGuilds(guildsData);
          if (guildsData.length > 0) {
            setSelectedGuildId(guildsData[0].id);
          }
        }
        setShop(shopData);
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
    await fetch("/api/shop", {
      method: "POST",
      body: JSON.stringify(shop),
    });
    setSaving(false);
  };

  const handleAddItem = () => {
    if (!selectedGuildId) return;
    const newId = `item_${Date.now().toString().slice(-4)}`;
    const currentItems = shop[selectedGuildId] || [];
    
    setShop({
      ...shop,
      [selectedGuildId]: [
        ...currentItems,
        { id: newId, name: "New Item", description: "", price: 0, emoji: "🛍️", roleId: "" }
      ]
    });
  };

  const handleUpdateItem = (itemId: string, field: string, value: any) => {
    if (!selectedGuildId) return;
    const currentItems = shop[selectedGuildId] || [];
    const updatedItems = currentItems.map((item: any) => 
       item.id === itemId ? { ...item, [field]: value } : item
    );

    setShop({
      ...shop,
      [selectedGuildId]: updatedItems
    });
  };

  const handleDeleteItem = (itemId: string) => {
    if (!selectedGuildId) return;
    const currentItems = shop[selectedGuildId] || [];
    const updatedItems = currentItems.filter((item: any) => item.id !== itemId);

    const newShop = {
        ...shop,
        [selectedGuildId]: updatedItems
    };
    
    setShop(newShop);
    
    // Auto-save on delete
    fetch("/api/shop", { method: "POST", body: JSON.stringify(newShop) });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );

  const currentGuildItems = selectedGuildId ? shop[selectedGuildId] || [] : [];

  return (
    <div className="space-y-10 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-3">Gestionnaire de Boutique</h1>
          <p className="text-zinc-500 text-lg">Create items users can buy with economy coins.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-amber-600 text-white rounded-2xl font-black hover:bg-amber-500 hover:scale-[1.05] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving..." : "Apply Changes"}
        </button>
      </div>

      {guilds.length === 0 ? (
        <div className="p-20 bg-zinc-950 border border-dashed border-zinc-800 rounded-[3rem] text-center space-y-4">
          <Store className="w-16 h-16 text-zinc-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">No Manageable Guilds</h2>
          <p className="text-zinc-500 max-w-sm mx-auto">
            Please invite the bot to a server where you have Administrator permissions first.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Server Selector */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-zinc-400 uppercase tracking-widest text-xs ml-2">Select Server</h3>
            <div className="space-y-2">
              {guilds.map((guild) => (
                <button
                  key={guild.id}
                  onClick={() => setSelectedGuildId(guild.id)}
                  className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all ${
                    selectedGuildId === guild.id
                      ? "bg-zinc-900 border border-amber-500/30 text-white"
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
                    <div className="w-8 h-8 bg-amber-500/20 text-amber-500 flex items-center justify-center rounded-lg font-bold">
                      {guild.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-bold truncate text-sm">{guild.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Shop Editor */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between p-6 bg-zinc-950 border border-zinc-900 rounded-[2rem]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Virtual Items</h2>
                  <p className="text-zinc-500 text-sm">Users can buy these with <code className="text-amber-500">/buy</code></p>
                </div>
              </div>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl transition-all"
              >
                <Plus className="w-4 h-4" /> New Item
              </button>
            </div>

            {currentGuildItems.length === 0 ? (
              <div className="p-16 text-center bg-zinc-950 rounded-[2rem] border border-dashed border-zinc-800">
                <p className="text-zinc-500 font-medium">No items in the shop yet.</p>
                <button
                  onClick={handleAddItem}
                  className="mt-4 text-amber-500 hover:underline font-bold"
                >
                  Create an item
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {currentGuildItems.map((item: any) => (
                   <div key={item.id} className="p-8 bg-zinc-950 border border-zinc-900 rounded-[2rem] space-y-6 group">
                      <div className="flex items-start justify-between">
                         <div className="flex items-center gap-4 flex-1">
                            <input 
                               type="text" 
                               value={item.emoji} 
                               onChange={(e) => handleUpdateItem(item.id, "emoji", e.target.value)}
                               className="w-16 h-16 text-center text-3xl bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-amber-500 outline-none transition-all"
                               placeholder="🛍️"
                            />
                            <div className="space-y-2 flex-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">Item Name</label>
                                <input 
                                    type="text" 
                                    value={item.name} 
                                    onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                                    className="w-full max-w-sm p-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-amber-500 outline-none transition-all text-white font-bold"
                                    placeholder="e.g. VIP Role"
                                />
                            </div>
                         </div>
                         <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-3 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                         >
                            <Trash2 className="w-5 h-5" />
                         </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-900/50">
                         <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                               <Tag className="w-4 h-4" /> Price (Coins)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.price}
                              onChange={(e) => handleUpdateItem(item.id, "price", parseInt(e.target.value) || 0)}
                              className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-amber-500 outline-none transition-all text-amber-500 font-black text-xl"
                            />
                         </div>
                         
                         <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                               <Store className="w-4 h-4" /> Stock Limit
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.stock !== undefined ? item.stock : ""}
                              onChange={(e) => handleUpdateItem(item.id, "stock", e.target.value === "" ? null : parseInt(e.target.value))}
                              className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-amber-500 outline-none transition-all text-white font-bold"
                              placeholder="Leave blank for infinite"
                            />
                         </div>

                         <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                               <ShieldAlert className="w-4 h-4" /> Discord Role ID (Optional)
                            </label>
                            <input
                              type="text"
                              value={item.roleId || ""}
                              onChange={(e) => handleUpdateItem(item.id, "roleId", e.target.value)}
                              className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-amber-500 outline-none transition-all text-zinc-300 font-mono text-sm"
                              placeholder="e.g. 123456789012345678"
                            />
                         </div>
                      </div>

                      <div className="space-y-3">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                              <Info className="w-4 h-4" /> Description
                          </label>
                          <textarea
                              value={item.description || ""}
                              onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                              className="w-full h-24 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:border-amber-500 outline-none transition-all text-zinc-300 resize-none"
                              placeholder="Describe what this item does..."
                          />
                      </div>
                   </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
