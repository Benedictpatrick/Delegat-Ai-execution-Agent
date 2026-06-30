import React from "react"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      {/* Icon */}
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Yellow: Top Left */}
        <path d="M 4.2 7.5 L 12 3" stroke="#FBBC04" strokeWidth="4.5" strokeLinecap="round" />
        
        {/* Red: Top Right */}
        <path d="M 12 3 L 19.8 7.5" stroke="#EA4335" strokeWidth="4.5" strokeLinecap="round" />
        
        {/* Blue: Right, Bottom Right, Bottom Left */}
        <path d="M 19.8 7.5 L 19.8 16.5 L 12 21 L 4.2 16.5" stroke="#4285F4" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Green: Left */}
        <path d="M 4.2 16.5 L 4.2 7.5" stroke="#34A853" strokeWidth="4.5" strokeLinecap="round" />
        
        {/* Light Blue Center Circle */}
        <circle cx="12" cy="12" r="3.5" fill="#AECBFA" />
      </svg>
      
      {/* Text — uses theme foreground so it works on dark bg */}
      <div className="flex flex-col justify-center">
        <span className="text-xl font-bold leading-none text-foreground tracking-tight">Delegat</span>
        <span className="text-[13px] font-medium leading-none text-muted-foreground mt-1">Workspace</span>
      </div>
    </div>
  )
}
