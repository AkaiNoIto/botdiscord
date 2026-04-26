"use client";

import { MessageSquare, Shield, Music, Gamepad2, Layers, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";

export default function LandingPage() {
  const { data: session } = useSession();
  const features = [
    { icon: <Music className="w-6 h-6" />, title: "Musique Premium", desc: "Streaming audio de haute qualité depuis plusieurs plateformes." },
    { icon: <Shield className="w-6 h-6" />, title: "Modération", desc: "Des outils avancés pour garder votre serveur sûr et propre." },
    { icon: <Gamepad2 className="w-6 h-6" />, title: "Jeux Interactifs", desc: "Morpion, Pierre-Feuille-Ciseaux et plus encore pour animer votre communauté." },
    { icon: <Layers className="w-6 h-6" />, title: "Système de Niveaux", desc: "Récompensez les membres actifs avec de l'XP et des rôles." },
    { icon: <MessageSquare className="w-6 h-6" />, title: "Auto-Mod", desc: "Filtrage intelligent par IA pour les spams et les mots interdits." },
    { icon: <ArrowRight className="w-6 h-6" />, title: "Tableau de Bord", desc: "Gérez tout depuis une interface web élégante." },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-discord/30">
      {/* Hero Section */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tighter flex items-center gap-3">
          <img src="/logo.png" className="w-10 h-10 rounded-xl shadow-lg shadow-discord/20" alt="Nexus Logo" />
          <span translate="no" className="notranslate">Nexus Door</span>
        </div>
        <div className="flex gap-8 items-center text-zinc-400 font-medium">
          <Link href="#features" className="hover:text-white transition-colors">Fonctionnalités</Link>
          {session ? (
            <Link href="/dashboard" className="px-5 py-2 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all">
              Tableau de Bord
            </Link>
          ) : (
            <button onClick={() => signIn("discord")} className="px-5 py-2 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all">
              Connexion
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          <h1 className="text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Un Seul Bot. <br /> Des Possibilités Infinies.
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Le bot Discord le plus complet pour votre communauté. Musique, Modération, Jeux et un Tableau de Bord élégant au même endroit.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link 
              href="https://discord.com/oauth2/authorize?client_id=1496111799706325043&permissions=8&integration_type=0&scope=bot+applications.commands"
              target="_blank"
              className="px-8 py-4 bg-discord rounded-2xl font-bold text-lg hover:scale-105 transition-transform flex items-center"
            >
              Ajouter à Discord
            </Link>
            {session ? (
              <Link href="/dashboard" className="px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-colors">
                Gérer le Bot
              </Link>
            ) : (
              <button 
                onClick={() => signIn("discord")}
                className="px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-colors"
              >
                Gérer le Bot
              </button>
            )}
          </div>
        </motion.div>

        {/* Features Grid */}
        <section id="features" className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl hover:border-discord/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 text-discord group-hover:bg-discord group-hover:text-white transition-all">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </section>
      </main>
      
      <footer className="border-t border-zinc-900 py-12 text-center text-zinc-600">
        <p>© 2026 <span translate="no" className="notranslate">Nexus Door</span> Bot. Créé avec passion pour les communautés.</p>
      </footer>
    </div>
  );
}
