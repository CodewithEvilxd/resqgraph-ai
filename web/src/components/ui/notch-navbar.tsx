"use client"
import { useState } from "react"
import { ArrowUpRight, Calendar, Zap, CreditCard, Menu, X, Shield, Layers, Search } from "@flux-icons/react"
import { cn } from "@/lib/utils"
import LogoIcon from '@/assets/logo/logo-icon'
import { motion, AnimatePresence } from "framer-motion"
import { NavViewId } from "../Sidebar"

// Helper component for navigation links: 100% stable, bold typography, no layout shift
const NavLink = ({ 
  href, 
  icon: Icon, 
  label, 
  onClick 
}: { 
  href: string; 
  icon: React.ComponentType<{ className?: string }>; 
  label: string;
  onClick?: () => void;
}) => (
  <a 
    href={href} 
    onClick={(e) => {
      e.preventDefault();
      if (onClick) {
        onClick();
      }
    }}
    className="group flex items-center gap-2 text-[13.5px] font-sans font-extrabold tracking-tight text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer py-1"
  >
    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-950 dark:group-hover:text-white transition-colors shrink-0" />
    <span>{label}</span>
  </a>
)

interface NotchNavbarProps {
  className?: string;
  logo?: React.ReactNode;
  onNavigate?: (view: NavViewId) => void;
  onOpenReportModal?: () => void;
  onOpenSearchModal?: () => void;
  criticalCount?: number;
}

export function NotchNavbar({ 
  className, 
  logo,
  onNavigate,
  onOpenReportModal,
  onOpenSearchModal,
  criticalCount = 0,
}: NotchNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Navigation items configuration
  const items = {
    left: [
      { label: "About", href: "#kya-hai", icon: Zap },
      { label: "How It Works", href: "#kaise-hai", icon: Layers },
      { label: "Architecture", href: "#sab-kuch", icon: Shield }
    ],
    right: [
      { label: "Reliability", href: "#guarantees", icon: Calendar },
      { label: "Workspaces", href: "#features", icon: CreditCard }
    ]
  }

  const handleScroll = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('#')) {
      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* Header completely flush against the absolute top of the page */}
      <header 
        className={cn("fixed top-0 inset-x-0 z-50 h-16 flex px-0 select-none pointer-events-auto", className)} 
      >
        
        {/* Left Side Bar - Flush with top and left screen boundary */}
        <div className="flex-1 h-10 bg-zinc-50 z-20 relative min-w-0">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <rect x="0" y="36.5" width="100%" height="3.5" fill="#000000" />
            <line x1="0" y1="39.5" x2="100%" y2="39.5" stroke="#000000" strokeWidth={1} />
            <line x1="0" y1="36.5" x2="100%" y2="36.5" stroke="#000000" strokeWidth={1} />
          </svg>
        </div>

        {/* Responsive Notch Container - 3 Slices */}
        <div className="flex h-16 relative z-10 shrink-0 -ml-px">
          
          {/* Left Slice (Corner) */}
          <div className="w-[50px] h-full relative shrink-0">
            {/* Glass Background */}
            <div className="absolute inset-0 bg-zinc-50" style={{ clipPath: "path('M0 0 H50 V64 C25 64 25 40 0 40 Z')" }} />
            {/* Outlines & Filled Pipe Interior */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 50 64">
              <path d="M0 36.5 C25 36.5 25 60.5 50 60.5 L50 63.5 C25 63.5 25 39.5 0 39.5 Z" fill="#000000" stroke="#000000" strokeWidth={1} />
            </svg>
          </div>

          {/* Center Slice (Flexible Content Area) */}
          <div className="flex-1 h-full relative min-w-0 -ml-px">
             {/* Background & Lines Layer */}
             <div className="absolute inset-0 bg-zinc-50">
                 <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                   <rect x="0" y="60.5" width="100%" height="3.5" fill="#000000" />
                   <line x1="0" y1="63.5" x2="100%" y2="63.5" stroke="#000000" strokeWidth={1} />
                   <line x1="0" y1="60.5" x2="100%" y2="60.5" stroke="#000000" strokeWidth={1} />
                 </svg>
             </div>

             {/* Content Layer */}
             <div className="relative w-full h-full flex items-end justify-between pb-2.5 px-4 md:px-8">
               
               {/* Desktop Left Nav */}
               <nav className="hidden md:flex gap-6 lg:gap-8 mb-0.5 shrink-0">
                {items.left.map(item => (
                  <NavLink key={item.label} {...item} onClick={() => handleScroll(item.href)} />
                ))}
              </nav>

              {/* Mobile Menu Button (Left) */}
              <button 
                className="md:hidden mb-1 p-1.5 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Logo (Center) — Prominent, clean branding without AI badge */}
              <div className="flex justify-center shrink-0 mx-2 md:mx-4 mb-0.5">
                {logo || (
                  <a 
                    href="#overview" 
                    onClick={(e) => { e.preventDefault(); handleScroll('#overview'); }}
                    className="flex items-center gap-2.5 sm:gap-3 relative group cursor-pointer"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
                      <LogoIcon className="w-full h-full object-contain" />
                    </div>
                    <span className="font-syne font-black text-xl sm:text-2xl tracking-tight text-slate-950 dark:text-white hidden sm:inline">
                      ResQGraph
                    </span>
                  </a>
                )}
              </div>

              {/* Desktop Right Nav */}
              <nav className="hidden md:flex gap-5 lg:gap-6 items-center shrink-0 mb-0.5">
                {items.right.map(item => (
                  <NavLink key={item.label} {...item} onClick={() => handleScroll(item.href)} />
                ))}
                
                <div className="flex gap-2.5 pl-3 lg:pl-4 border-l border-slate-200/90 dark:border-slate-800 shrink-0 items-center">
                  {onOpenSearchModal && (
                    <button
                      onClick={onOpenSearchModal}
                      className="hidden xl:flex items-center gap-2 h-8 px-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-sans font-bold transition-colors cursor-pointer shadow-2xs"
                      title="Search Platform (Ctrl+K)"
                    >
                      <Search className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
                      <span>Search</span>
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-400 shadow-2xs leading-none">
                        Ctrl+K
                      </kbd>
                    </button>
                  )}

                  {onNavigate ? (
                    <button 
                      onClick={() => onNavigate('command-center')}
                      className="flex items-center gap-2 h-8 px-4 text-xs font-sans font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow-xs whitespace-nowrap cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span>Command Center</span>
                      {criticalCount > 0 && (
                        <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-red-500 text-white rounded-full leading-none">
                          {criticalCount}
                        </span>
                      )}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
                    </button>
                  ) : (
                    <a href="#features" className="flex items-center h-8 px-4 text-xs font-sans font-extrabold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap">
                      Workspaces
                    </a>
                  )}
                </div>
              </nav>

              {/* Mobile Right Actions */}
              <div className="md:hidden flex items-center gap-2 mb-1">
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('command-center')}
                    className="px-2.5 py-1 text-[11px] font-sans font-bold bg-blue-600 text-white rounded-lg shadow-xs"
                  >
                    Command
                  </button>
                )}
              </div>

             </div>
          </div>

          {/* Right Slice (Corner) */}
          <div className="w-[50px] h-full relative shrink-0 -ml-px">
            {/* Glass Background */}
            <div className="absolute inset-0 bg-zinc-50" style={{ clipPath: "path('M0 0 H50 V40 C25 40 25 64 0 64 Z')" }} />
            {/* Outlines & Filled Pipe Interior */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 50 64">
              <path d="M0 60.5 C25 60.5 25 36.5 50 36.5 L50 39.5 C25 39.5 25 63.5 0 63.5 Z" fill="#000000" stroke="#000000" strokeWidth={1} />
            </svg>
          </div>

        </div>

        {/* Right Side Bar - Flush with top and right screen boundary */}
        <div className="flex-1 h-10 bg-zinc-50 z-20 relative min-w-0 -ml-px">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <rect x="0" y="36.5" width="100%" height="3.5" fill="#000000" />
            <line x1="0" y1="39.5" x2="100%" y2="39.5" stroke="#000000" strokeWidth={1} />
            <line x1="0" y1="36.5" x2="100%" y2="36.5" stroke="#000000" strokeWidth={1} />
          </svg>
        </div>

      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-zinc-50/98 dark:bg-slate-900/98 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-5 md:hidden shadow-xl"
          >
             <nav className="flex flex-col gap-2">
               {/* Combine all items */}
               {[...items.left, ...items.right].map(item => (
                 <a 
                   key={item.label} 
                   href={item.href}
                   className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                   onClick={() => handleScroll(item.href)}
                 >
                   <item.icon className="w-4 h-4 text-slate-500" />
                   <span className="font-sans font-extrabold text-sm text-slate-900 dark:text-slate-100">{item.label}</span>
                 </a>
               ))}
               <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
               <div className="flex flex-col gap-2">
                 {onOpenReportModal && (
                   <button 
                      onClick={() => { setIsMobileMenuOpen(false); onOpenReportModal(); }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors font-sans font-extrabold text-sm text-red-600 text-left cursor-pointer"
                   >
                     Declare Incident
                   </button>
                 )}
                 {onNavigate && (
                   <button 
                      onClick={() => { setIsMobileMenuOpen(false); onNavigate('command-center'); }}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-sans font-extrabold text-sm mt-2 cursor-pointer shadow-xs"
                   >
                     Launch Command Center
                   </button>
                 )}
               </div>
             </nav>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


