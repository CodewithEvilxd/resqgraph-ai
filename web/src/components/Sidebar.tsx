'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Home,
  LayoutDashboard,
  Map,
  TriangleAlert,
  FileText,
  Layers,
  SquareCheck,
  Bell,
  Users,
  UserCheck,
  Package,
  Navigation,
  Cpu,
  GitBranch,
  ChartNetwork,
  BadgeAlert,
  Radio,
  BarChart2,
  FileCheck,
  Activity,
  Smartphone,
  Shield,
  Lock,
  Settings,
  ChevronDown,
  ChevronRight,
  CircleCheck,
} from '@flux-icons/react';

const CORNER = 6;
const DASH =
  'repeating-linear-gradient(to top, transparent 0 2px, currentColor 2px 4px)';

export type NavViewId =
  | 'home'
  | 'command-center'
  | 'live-map'
  | 'incidents'
  | 'reports'
  | 'evidence'
  | 'assignments'
  | 'alerts'
  | 'teams'
  | 'responders'
  | 'resources'
  | 'routes'
  | 'ai-intelligence'
  | 'decision-trace'
  | 'related-incidents'
  | 'conflicts'
  | 'devices'
  | 'analytics'
  | 'audit-logs'
  | 'system-health'
  | 'field-sync'
  | 'admin-users'
  | 'admin-roles'
  | 'admin-settings';

interface SidebarProps {
  activeView: NavViewId;
  onViewChange: (view: NavViewId) => void;
  currentRole: string;
  onRoleChange: (role: string) => void;
  onlineDevicesCount: number;
  activeIncidentsCount: number;
  onProfileClick?: () => void;
}

interface NavItemDef {
  id: NavViewId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: {
    text: string;
    colorClass?: string;
  };
}

const Rail = ({
  from = 0,
  y,
  visible,
  color,
  dashed,
  className,
}: {
  from?: number;
  y: number | null;
  visible: boolean;
  color?: string;
  dashed: boolean;
  className?: string;
}) => {
  const reduced = useReducedMotion();
  const travel = reduced
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.7 };

  return (
    <motion.span
      aria-hidden
      initial={false}
      style={{ color }}
      animate={{ opacity: visible && y !== null ? 1 : 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.2 }}
      className={cn('pointer-events-none absolute inset-0', className)}
    >
      <motion.span
        initial={false}
        animate={{ top: from, height: Math.max(0, (y ?? 0) - CORNER - from) }}
        transition={travel}
        style={
          dashed
            ? { backgroundImage: DASH }
            : { backgroundColor: 'currentColor' }
        }
        className="absolute left-1 w-px"
      />
      <motion.svg
        initial={false}
        animate={{ top: (y ?? 0) - CORNER }}
        transition={travel}
        width="12"
        height="7"
        viewBox="0 0 12 7"
        fill="none"
        className="absolute left-1"
      >
        <path
          d="M0.5 0a6 6 0 0 0 6 6H12"
          stroke="currentColor"
          strokeDasharray={dashed ? '2 2' : undefined}
        />
      </motion.svg>
    </motion.span>
  );
};

function HookNavGroup({
  items,
  activeView,
  onViewChange,
  color = '#FC4C01',
  dashed = true,
}: {
  items: NavItemDef[];
  activeView: NavViewId;
  onViewChange: (view: NavViewId) => void;
  color?: string;
  dashed?: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [centers, setCenters] = useState<number[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);

  const activeIndex = items.findIndex((item) => item.id === activeView);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      setCenters(
        itemRefs.current.map((el) =>
          el ? el.offsetTop + el.offsetHeight / 2 : 0,
        ),
      );
    };

    const observer = new ResizeObserver(measure);
    observer.observe(list);
    measure();
    return () => observer.disconnect();
  }, [items.length]);

  const activeY = activeIndex < 0 ? null : (centers[activeIndex] ?? null);
  const hoverY = hoverIndex === null ? null : (centers[hoverIndex] ?? null);

  const hoverFrom =
    activeY !== null && hoverY !== null && hoverY <= activeY
      ? Math.max(0, hoverY - CORNER)
      : (activeY ?? 0);

  return (
    <div
      ref={listRef}
      onMouseLeave={() => setPointerInside(false)}
      className="relative flex flex-col gap-0.5"
    >
      <Rail
        from={hoverFrom}
        y={hoverY}
        visible={(pointerInside || focusInside) && hoverIndex !== activeIndex}
        dashed={dashed}
        className="text-slate-300"
      />
      <Rail
        y={activeY}
        visible={activeY !== null}
        color={color}
        dashed={dashed}
      />

      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const Icon = item.icon;
        const setRef = (el: HTMLElement | null) => {
          itemRefs.current[index] = el;
        };

        return (
          <button
            key={item.id}
            ref={setRef}
            type="button"
            onClick={() => onViewChange(item.id)}
            onMouseEnter={() => {
              setHoverIndex(index);
              setPointerInside(true);
            }}
            onFocus={() => {
              setHoverIndex(index);
              setFocusInside(true);
            }}
            onBlur={() => setFocusInside(false)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'w-full flex items-center justify-between rounded-lg py-1.5 pl-6 pr-2.5 text-left text-xs transition-colors duration-150 cursor-pointer group',
              isActive
                ? 'bg-slate-100 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium',
            )}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive
                    ? 'text-[#FC4C01]'
                    : 'text-slate-400 group-hover:text-slate-700',
                )}
              />
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge && (
              <span
                className={cn(
                  'text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 font-medium',
                  item.badge.colorClass || 'bg-slate-100 text-slate-600 border border-slate-200',
                )}
              >
                {item.badge.text}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Sidebar({
  activeView,
  onViewChange,
  currentRole,
  onRoleChange,
  onlineDevicesCount,
  activeIncidentsCount,
  onProfileClick,
}: SidebarProps) {
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [responseOpen, setResponseOpen] = useState(true);
  const [intelligenceOpen, setIntelligenceOpen] = useState(true);
  const [telemetryOpen, setTelemetryOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);

  // Group 0: Core Workspaces
  const coreItems: NavItemDef[] = [
    {
      id: 'home',
      label: 'Platform Overview',
      icon: Home,
    },
    {
      id: 'command-center',
      label: 'Command Center',
      icon: LayoutDashboard,
      badge:
        activeIncidentsCount > 0
          ? {
              text: String(activeIncidentsCount),
              colorClass: 'bg-red-500 text-white font-bold',
            }
          : undefined,
    },
    {
      id: 'live-map',
      label: 'Live Operations Map',
      icon: Map,
      badge: {
        text: 'GIS',
        colorClass: 'bg-blue-50 text-blue-700 border border-blue-200',
      },
    },
  ];

  // Group 1: Operations
  const operationItems: NavItemDef[] = [
    {
      id: 'incidents',
      label: 'Incidents Triage',
      icon: TriangleAlert,
      badge:
        activeIncidentsCount > 0
          ? {
              text: `${activeIncidentsCount} Active`,
              colorClass: 'bg-red-50 text-red-700 border border-red-200 font-bold',
            }
          : undefined,
    },
    {
      id: 'reports',
      label: 'Reports Feed',
      icon: FileText,
      badge: {
        text: 'Stream',
        colorClass: 'bg-slate-100 text-slate-600 border border-slate-200',
      },
    },
    {
      id: 'evidence',
      label: 'Evidence Vault',
      icon: Layers,
      badge: {
        text: 'SHA-256',
        colorClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      },
    },
    {
      id: 'assignments',
      label: 'Unit Assignments',
      icon: SquareCheck,
    },
    {
      id: 'alerts',
      label: 'Emergency Alerts',
      icon: Bell,
      badge: {
        text: 'CAP v1.2',
        colorClass: 'bg-amber-50 text-amber-700 border border-amber-200',
      },
    },
  ];

  // Group 2: Response Forces
  const responseItems: NavItemDef[] = [
    {
      id: 'teams',
      label: 'Emergency Teams',
      icon: Users,
    },
    {
      id: 'responders',
      label: 'Responders Roster',
      icon: UserCheck,
    },
    {
      id: 'resources',
      label: 'Equipment Depot',
      icon: Package,
    },
    {
      id: 'routes',
      label: 'Safe Routing',
      icon: Navigation,
      badge: {
        text: '<15ms',
        colorClass: 'bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold',
      },
    },
  ];

  // Group 3: Intelligence & AI
  const intelligenceItems: NavItemDef[] = [
    {
      id: 'ai-intelligence',
      label: 'Neural Threat Fusion',
      icon: Cpu,
    },
    {
      id: 'decision-trace',
      label: 'Decision Traces',
      icon: GitBranch,
      badge: {
        text: 'Human Gate',
        colorClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      },
    },
    {
      id: 'related-incidents',
      label: 'Incident Topology Graph',
      icon: ChartNetwork,
    },
    {
      id: 'conflicts',
      label: 'Conflicts & Uncertainty',
      icon: BadgeAlert,
    },
  ];

  // Group 4: Grid & Telemetry
  const telemetryItems: NavItemDef[] = [
    {
      id: 'devices',
      label: 'Edge IoT Mesh',
      icon: Radio,
      badge: {
        text: onlineDevicesCount > 0 ? `${onlineDevicesCount} HMAC` : 'HMAC',
        colorClass: 'bg-slate-100 text-slate-700 border border-slate-200',
      },
    },
    {
      id: 'analytics',
      label: 'Operational Analytics',
      icon: BarChart2,
    },
    {
      id: 'audit-logs',
      label: 'Merkle Audit Log',
      icon: FileCheck,
      badge: {
        text: 'SHA-256',
        colorClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      },
    },
    {
      id: 'system-health',
      label: 'System Diagnostics',
      icon: Activity,
    },
    {
      id: 'field-sync',
      label: 'Offline Field Sync',
      icon: Smartphone,
      badge: {
        text: 'CRDT',
        colorClass: 'bg-amber-50 text-amber-700 border border-amber-200',
      },
    },
  ];

  // Group 5: Administration
  const adminItems: NavItemDef[] = [
    {
      id: 'admin-users',
      label: 'Personnel Users',
      icon: Shield,
    },
    {
      id: 'admin-roles',
      label: 'Roles & RBAC',
      icon: Lock,
    },
    {
      id: 'admin-settings',
      label: 'Settings & API',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200/90 bg-white/95 backdrop-blur-md flex flex-col shrink-0 select-none h-screen sticky top-0 overflow-y-auto text-slate-800 shadow-xs">
      {/* 1. Brand Header */}
      <div className="p-3.5 border-b border-slate-200/80 flex items-center space-x-3 bg-slate-50/70">
        <div className="w-9 h-9 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0 p-1">
          <img
            src="/logo-128.png"
            alt="ResQGraph"
            width={36}
            height={36}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-1.5">
            <span className="text-sm font-extrabold tracking-tight text-slate-900 font-sans">
              ResQGraph AI
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider truncate">
            EOC Command Console
          </div>
        </div>
      </div>

      {/* 2. Operational Posture Ribbon */}
      <div className="px-3.5 py-1.5 border-b border-slate-200/70 bg-slate-50/40 flex items-center justify-between text-xs font-sans">
        <span className="text-slate-600 font-medium text-[11px] truncate flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>DEMA Sector 01</span>
        </span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[10px] font-mono shrink-0">
          DEFCON 2
        </span>
      </div>

      {/* 3. Master Hook Navigation Tree */}
      <div className="flex-1 px-3 py-3 space-y-4">
        {/* SECTION 0: CORE WORKSPACES */}
        <div className="space-y-1">
          <div className="px-1 text-[10px] font-sans uppercase font-bold tracking-wider text-slate-400">
            Workspaces
          </div>
          <HookNavGroup
            items={coreItems}
            activeView={activeView}
            onViewChange={onViewChange}
            color="#FC4C01"
            dashed={true}
          />
        </div>

        {/* SECTION 1: OPERATIONS */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setOperationsOpen(!operationsOpen)}
            className="w-full flex items-center justify-between px-1 py-1 text-[10px] font-sans uppercase font-bold tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>Operations</span>
              <span className="text-[9px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1 rounded">
                5
              </span>
            </span>
            {operationsOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {operationsOpen && (
            <HookNavGroup
              items={operationItems}
              activeView={activeView}
              onViewChange={onViewChange}
              color="#FC4C01"
              dashed={true}
            />
          )}
        </div>

        {/* SECTION 2: RESPONSE FORCES */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setResponseOpen(!responseOpen)}
            className="w-full flex items-center justify-between px-1 py-1 text-[10px] font-sans uppercase font-bold tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>Response Units</span>
              <span className="text-[9px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1 rounded">
                4
              </span>
            </span>
            {responseOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {responseOpen && (
            <HookNavGroup
              items={responseItems}
              activeView={activeView}
              onViewChange={onViewChange}
              color="#FC4C01"
              dashed={true}
            />
          )}
        </div>

        {/* SECTION 3: INTELLIGENCE & AI */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setIntelligenceOpen(!intelligenceOpen)}
            className="w-full flex items-center justify-between px-1 py-1 text-[10px] font-sans uppercase font-bold tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>Intelligence & AI</span>
              <span className="text-[9px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1 rounded">
                4
              </span>
            </span>
            {intelligenceOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {intelligenceOpen && (
            <HookNavGroup
              items={intelligenceItems}
              activeView={activeView}
              onViewChange={onViewChange}
              color="#FC4C01"
              dashed={true}
            />
          )}
        </div>

        {/* SECTION 4: GRID & TELEMETRY */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setTelemetryOpen(!telemetryOpen)}
            className="w-full flex items-center justify-between px-1 py-1 text-[10px] font-sans uppercase font-bold tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>Grid & Telemetry</span>
              <span className="text-[9px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1 rounded">
                5
              </span>
            </span>
            {telemetryOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {telemetryOpen && (
            <HookNavGroup
              items={telemetryItems}
              activeView={activeView}
              onViewChange={onViewChange}
              color="#FC4C01"
              dashed={true}
            />
          )}
        </div>

        {/* SECTION 5: ADMINISTRATION */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setAdminOpen(!adminOpen)}
            className="w-full flex items-center justify-between px-1 py-1 text-[10px] font-sans uppercase font-bold tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>Administration</span>
              <span className="text-[9px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1 rounded">
                3
              </span>
            </span>
            {adminOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {adminOpen && (
            <HookNavGroup
              items={adminItems}
              activeView={activeView}
              onViewChange={onViewChange}
              color="#FC4C01"
              dashed={true}
            />
          )}
        </div>
      </div>

      {/* 4. Commander Session & Security Control Footer */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/80 space-y-2 mt-auto">
        <div
          onClick={onProfileClick}
          className="flex items-center space-x-2.5 p-1.5 -m-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
          title="Open Operational Profile & Security Settings"
        >
          <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 group-hover:ring-2 group-hover:ring-orange-500/30 relative">
            <span>{currentRole.slice(0, 2).toUpperCase()}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-1 ring-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 truncate capitalize flex items-center justify-between">
              <span>{currentRole} Session</span>
              <CircleCheck className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="text-[10px] font-mono text-slate-500 truncate">
              Col. Rajiv Sharma (DEMA)
            </div>
          </div>
        </div>

        {/* Role Testing Dial */}
        <div className="flex items-center justify-between text-[11px] font-sans bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Role:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
          >
            <option value="commander" className="bg-white text-slate-900">Commander</option>
            <option value="dispatcher" className="bg-white text-slate-900">Dispatcher</option>
            <option value="responder" className="bg-white text-slate-900">Responder</option>
            <option value="citizen" className="bg-white text-slate-900">Citizen</option>
            <option value="admin" className="bg-white text-slate-900">Admin</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
