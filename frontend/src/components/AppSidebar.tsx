"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "◉" },
  { href: "/investigations", label: "Investigations", icon: "⚑" },
  { href: "/works", label: "Works", icon: "▤" },
  { href: "/detection", label: "Detection", icon: "◎" },
  { href: "/map", label: "Map", icon: "◈" },
  { href: "/audit", label: "Audit Trail", icon: "≡" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-white border-r border-slate-200 sticky top-0">
      {/* Brand */}
      <div className="p-5 border-b border-slate-200">
        <Link href="/" className="block">
          <span className="font-heading text-base font-bold text-slate-950 tracking-tight">ArthaSentinel</span>
          <p className="font-mono text-[9px] tracking-widest text-slate-400 uppercase mt-0.5">SCRUTINY ENGINE V2.4</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-800 border border-blue-200/60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="text-xs w-4 text-center opacity-60">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        {/* Data Status */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Engine Online · Synthetic</span>
        </div>
        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600">KR</div>
          <div>
            <div className="text-xs font-medium text-slate-800">K. Ramanathan</div>
            <div className="text-[10px] text-slate-400">Senior Investigator</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#FAF9F5]">
      <AppSidebar />
      <main className="flex-1 min-h-screen">{children}</main>
    </div>
  );
}
