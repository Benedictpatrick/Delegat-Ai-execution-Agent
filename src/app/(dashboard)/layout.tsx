"use client";

import { LayoutDashboard, Activity, Cpu, Target, Book, Database, Webhook, ActivitySquare, ScrollText, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navGroups = [
    {
      title: "PRIMARY",
      items: [
        { name: "War Room", href: "/war-room", icon: LayoutDashboard },
        { name: "Nexus Feed", href: "/nexus-feed", icon: Activity },
      ]
    },
    {
      title: "AI OPERATIONS",
      items: [
        { name: "Agents", href: "/agents", icon: Cpu },
        { name: "Missions", href: "/missions", icon: Target },
        { name: "Knowledge", href: "/knowledge", icon: Book },
        { name: "Memory", href: "/memory", icon: Database },
        { name: "Integrations", href: "/integrations", icon: Webhook },
      ]
    },
    {
      title: "SYSTEM",
      items: [
        { name: "Telemetry", href: "/telemetry", icon: ActivitySquare },
        { name: "Logs", href: "/logs", icon: ScrollText },
        { name: "Settings", href: "/settings", icon: Settings },
      ]
    }
  ]

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col z-20">
        <div className="px-6 py-6">
          <Logo />
        </div>
        
        <div className="px-4 flex-1 overflow-y-auto space-y-6 mt-2">
          {navGroups.map((group, i) => (
            <div key={i}>
              <p className="text-[11px] font-semibold text-muted-foreground mb-2.5 uppercase tracking-wider px-3">
                {group.title}
              </p>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  // For the mockup, we force "War Room" to be active and styled differently
                  const isActive = item.name === "War Room"
                  return (
                    <Link 
                      key={item.name}
                      href={item.href} 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-[13px] rounded-lg transition-all duration-200",
                        isActive 
                          ? "bg-accent text-accent-foreground font-medium" 
                          : "text-muted-foreground font-medium hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
        
        {/* User Profile Footer */}
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center text-sm font-semibold">
              N
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-sm font-semibold text-foreground leading-tight">Nexus User</span>
              <span className="text-[11px] text-muted-foreground">nexus@delegat.ai</span>
            </div>
            <div className="w-4 h-4 text-muted-foreground">⋮</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-y-auto bg-muted/20">
        {children}
      </main>
    </div>
  )
}
