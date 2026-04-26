"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Shield, TerminalSquare, Store, Music } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Aperçu", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/dashboard/settings", label: "Paramètres", icon: <Settings className="w-5 h-5" /> },
  { href: "/dashboard/moderation", label: "Modération", icon: <Shield className="w-5 h-5" /> },
  { href: "/dashboard/custom-commands", label: "Commandes", icon: <TerminalSquare className="w-5 h-5" /> },
  { href: "/dashboard/shop", label: "Boutique", icon: <Store className="w-5 h-5" /> },
  { href: "/dashboard/music", label: "Musique", icon: <Music className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1">
      {navLinks.map(link => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              isActive
                ? "bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/20"
                : "text-zinc-500 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
