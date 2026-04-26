"use client";

import { useState, useEffect } from "react";
import { Play, Pause, SkipForward, Square, Volume2, Music, ListTodo, Activity } from "lucide-react";

export default function MusicPlayerPage() {
  const [guilds, setGuilds] = useState<any[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch manageable guilds
  useEffect(() => {
    const fetchGuilds = async () => {
        try {
            const res = await fetch("/api/user/guilds");
            const data = await res.json();
            if (Array.isArray(data)) {
                setGuilds(data);
                if (data.length > 0) setSelectedGuild(data[0].id);
            }
        } catch (e) {}
        setLoading(false);
    };
    fetchGuilds();
  }, []);

  // Poll music data every second
  useEffect(() => {
    if (!selectedGuild) return;
    
    const fetchMusic = async () => {
        try {
            const res = await fetch(`/api/music?guildId=${selectedGuild}`);
            if (res.ok) {
                const data = await res.json();
                setPlayerState(data);
            }
        } catch (e) {}
    };

    fetchMusic(); // Initial fetch
    const interval = setInterval(fetchMusic, 1500); // Poll every 1.5s
    
    return () => clearInterval(interval);
  }, [selectedGuild]);

  const controlPlayer = async (action: string, extraData: any = {}) => {
      if (!selectedGuild) return;
      
      // Optimistic upates
      if (action === 'pause') setPlayerState({...playerState, playing: false});
      if (action === 'resume') setPlayerState({...playerState, playing: true});
      if (action === 'volume') setPlayerState({...playerState, volume: extraData.volume});

      await fetch(`/api/music?guildId=${selectedGuild}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...extraData })
      });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-discord"></div>
    </div>
  );

  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h1 className="text-4xl font-black text-white mb-3">Lecteur Web</h1>
        <p className="text-zinc-500 text-lg">Watch and control what current music is playing in your servers in real-time.</p>
      </div>

      {guilds.length === 0 ? (
        <div className="p-20 bg-zinc-950 border border-dashed border-zinc-800 rounded-[3rem] text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-600">
                <ListTodo className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">No Manageable Guilds</h2>
            <p className="text-zinc-500 max-w-sm mx-auto">Please add <span translate="no" className="notranslate">Nexus Door</span> to a server.</p>
        </div>
      ) : (
        <div className="space-y-8">
            {/* Guild Selector */}
            <div className="flex flex-wrap gap-3">
                {guilds.map((g) => (
                    <button 
                        key={g.id}
                        onClick={() => setSelectedGuild(g.id)}
                        className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold transition-all ${selectedGuild === g.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                    >
                        {g.icon ? (
                            <img src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`} className="w-6 h-6 rounded-lg" alt="" />
                        ) : (
                            <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center text-[10px]">
                                {g.name.charAt(0)}
                            </div>
                        )}
                        {g.name}
                    </button>
                ))}
            </div>

            {/* The Player */}
            <div className="bg-zinc-950 border border-zinc-900 overflow-hidden rounded-[3rem] relative">
                
                {/* Background blur from thumbnail */}
                {playerState?.track?.thumbnail && (
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <img src={playerState.track.thumbnail} className="w-full h-full object-cover blur-3xl" alt="" />
                    </div>
                )}
                
                <div className="p-10 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
                    {/* Thumbnail */}
                    <div className="col-span-1 rounded-3xl overflow-hidden aspect-square border-2 border-zinc-900 bg-zinc-900 shadow-xl flex items-center justify-center relative group">
                        {playerState?.track?.thumbnail ? (
                            <img src={playerState.track.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover" />
                        ) : (
                            <Music className="w-20 h-20 text-zinc-800" />
                        )}
                        {!playerState?.track && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
                                <span className="font-bold text-zinc-500 tracking-widest uppercase text-xs">Nothing is playing</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Controls & Details */}
                    <div className="col-span-1 md:col-span-2 space-y-8">
                        <div>
                            {playerState?.track ? (
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-white leading-tight line-clamp-2">
                                        {playerState.track.title}
                                    </h2>
                                    <p className="text-zinc-400 font-medium text-lg">{playerState.track.author}</p>
                                </div>
                            ) : (
                                <h2 className="text-2xl font-black text-zinc-600">No active queue on this server</h2>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-3">
                            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-linear"
                                    style={{ width: `${playerState?.track ? (playerState.progress / (parseDuration(playerState.track.duration) * 1000)) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-zinc-500 font-mono tracking-wider">
                                <span>{formatTime(playerState?.progress || 0)}</span>
                                <span>{playerState?.track?.duration || "0:00"}</span>
                            </div>
                        </div>

                        {/* Buttons & Volume */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 border-t border-zinc-900">
                            
                            {/* Actions */}
                            <div className="flex items-center gap-4">
                                <button 
                                    disabled={!playerState?.track}
                                    onClick={() => controlPlayer(playerState?.playing ? 'pause' : 'resume')}
                                    className="w-14 h-14 bg-white text-zinc-950 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-600 shadow-xl"
                                >
                                    {playerState?.playing ? <Pause className="fill-current w-6 h-6" /> : <Play className="fill-current ml-1 w-6 h-6" />}
                                </button>

                                <button 
                                    disabled={!playerState?.track}
                                    onClick={() => controlPlayer('skip')}
                                    className="w-12 h-12 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    <SkipForward className="fill-current w-5 h-5" />
                                </button>
                                
                                <button 
                                    disabled={!playerState?.track}
                                    onClick={() => controlPlayer('stop')}
                                    className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white active:scale-95 transition-all disabled:opacity-50 disabled:bg-zinc-900"
                                >
                                    <Square className="fill-current w-4 h-4" />
                                </button>
                            </div>

                            {/* Volume Slider */}
                            <div className="flex-1 flex items-center gap-4 bg-zinc-900/50 p-4 rounded-3xl w-full">
                                <Volume2 className="w-5 h-5 text-zinc-500" />
                                <input 
                                    type="range" 
                                    min="0" max="100" 
                                    disabled={!playerState?.track}
                                    value={playerState?.volume || 50}
                                    onChange={(e) => controlPlayer('volume', { volume: parseInt(e.target.value) })}
                                    className="w-full accent-indigo-500 disabled:opacity-50 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
                                />
                                <span className="text-xs font-bold text-zinc-500 w-8">{playerState?.volume || 50}%</span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm font-bold text-zinc-600 bg-zinc-950 inline-flex p-4 rounded-2xl border border-zinc-900">
               <Activity className="w-4 h-4 text-green-500" /> API Synchronized (Live polling via <span translate="no" className="notranslate">nexus-core</span>)
            </div>
        </div>
      )}
    </div>
  );
}

// Helpers
function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function parseDuration(duration: string) {
    if (!duration) return 0;
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
}
