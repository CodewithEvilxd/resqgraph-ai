'use client';

import { Radio, LayoutDashboard, CirclePlus, Compass } from '@flux-icons/react';

interface NavbarProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  onlineCount: number;
  activeView: 'home' | 'operations' | 'report';
  onViewChange: (view: 'home' | 'operations' | 'report') => void;
  onNewReportClick?: () => void;
}

export function Navbar({
  currentRole,
  onRoleChange,
  onlineCount,
  activeView,
  onViewChange,
  onNewReportClick,
}: NavbarProps) {
  return (
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur px-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center space-x-6">
        {/* Logo and Brand */}
        <button
          onClick={() => onViewChange('home')}
          className="flex items-center space-x-2.5 text-slate-900 font-bold tracking-tight text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-2xs">
            <img src="/logo-128.png" alt="ResQGraph" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-slate-950 font-syne">
              ResQGraph
            </span>
            <span className="text-[10px] text-slate-500 font-normal uppercase tracking-wider">Disaster & Emergency Response</span>
          </div>
        </button>

        {/* View Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200">
          <button
            onClick={() => onViewChange('home')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              activeView === 'home'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => onViewChange('operations')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              activeView === 'operations'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </button>

          <button
            onClick={() => {
              if (onNewReportClick) onNewReportClick();
              else onViewChange('report');
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              activeView === 'report'
                ? 'bg-slate-900 text-white'
                : 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
            }`}
          >
            <CirclePlus className="w-3.5 h-3.5 text-red-600" />
            <span>File Report</span>
          </button>
        </nav>
      </div>

      <div className="flex items-center space-x-3">
        {/* Live Status indicator */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-600 font-mono bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-emerald-800">LIVE FEED</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">p95 &lt; 25ms</span>
        </div>

        {/* Telemetry Status */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-700 font-mono bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
          <Radio className="w-3.5 h-3.5 text-slate-600" />
          <span>{onlineCount} Nodes Active</span>
        </div>

        {/* Role Switcher for paired testing */}
        <div className="flex items-center space-x-1.5 text-xs bg-white border border-slate-300 rounded-md px-2 py-1 shadow-2xs">
          <span className="text-slate-500 font-medium">Role:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="bg-transparent text-slate-900 font-mono font-semibold focus:outline-none cursor-pointer"
          >
            <option value="commander">Commander</option>
            <option value="dispatcher">Dispatcher</option>
            <option value="responder">Responder</option>
            <option value="citizen">Citizen</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* User indicator */}
        <div className="flex items-center space-x-2 text-xs border-l border-slate-200 pl-3">
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-mono font-bold text-xs">
            {currentRole.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden xl:block text-left text-[11px] leading-tight">
            <div className="text-slate-900 font-semibold capitalize">{currentRole} Terminal</div>
            <div className="text-slate-500 font-mono">DEMA-NCR HQ</div>
          </div>
        </div>
      </div>
    </header>
  );
}
