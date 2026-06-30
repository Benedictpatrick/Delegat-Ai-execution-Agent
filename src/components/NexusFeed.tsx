"use client";

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Terminal, FileText, Calendar, Mail, CheckCircle2, AlertTriangle, PlayCircle, Cpu } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface NexusFeedProps {
  items: any[];
}

export function NexusFeed({ items }: NexusFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const getIcon = (type: string) => {
    switch (type) {
      case 'doc_created': return <FileText className="w-3.5 h-3.5 text-info" />
      case 'calendar_booked': return <Calendar className="w-3.5 h-3.5 text-info" />
      case 'gmail_draft': return <Mail className="w-3.5 h-3.5 text-info" />
      case 'commitment_decomposed': return <CheckCircle2 className="w-3.5 h-3.5 text-success" />
      case 'error': return <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
      case 'system': return <Cpu className="w-3.5 h-3.5 text-primary" />
      default: return <PlayCircle className="w-3.5 h-3.5 text-muted-foreground" />
    }
  }

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-destructive/30'
      case 'system': return 'border-primary/30'
      case 'commitment_decomposed': return 'border-success/30'
      default: return 'border-info/30'
    }
  }

  return (
    <Card className="h-full bg-card/80 backdrop-blur-xl border-border/50 overflow-hidden flex flex-col glow-border min-h-[400px]">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="text-sm font-mono flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="tracking-wider uppercase text-xs">Agent Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-primary/70 font-mono">LIVE</span>
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent 
        ref={scrollRef}
        className="p-0 flex-1 overflow-y-auto"
      >
        <div className="p-4 space-y-4 font-mono text-xs">
          {items.length === 0 ? (
            <div className="text-muted-foreground/50 text-center py-12 flex flex-col items-center gap-3">
              <Cpu className="w-8 h-8 animate-pulse" />
              <p className="text-xs tracking-wider uppercase">Awaiting agent signals...</p>
              <p className="text-[10px] text-muted-foreground/30">Submit a commitment to activate</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {items.map((item, i) => (
                <motion.div
                  key={item.id || i}
                  initial={{ opacity: 0, x: -15, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="flex gap-3 relative group"
                >
                  <div className="flex flex-col items-center mt-0.5">
                    <div className={`p-1.5 rounded-md bg-card border ${getStatusColor(item.type)} group-hover:border-primary/40 transition-colors`}>
                      {getIcon(item.type)}
                    </div>
                    {i !== items.length - 1 && (
                      <div className="w-[1px] h-full bg-gradient-to-b from-border/50 to-transparent my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span className="font-semibold text-foreground text-xs group-hover:text-primary transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap opacity-50">
                        {item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : 'now'}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed break-words">
                      {item.details}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
