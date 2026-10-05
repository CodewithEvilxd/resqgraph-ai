'use client';

import { TriangleAlert, Users, Navigation, BadgeAlert, Cpu } from '@flux-icons/react';

interface MetricsProps {
  criticalCount: number;
  activeCount: number;
  deployedTeamsCount: number;
  closuresCount: number;
  pendingGatesCount: number;
  devicesCount: number;
}

export function MetricsBar({
  criticalCount,
  activeCount,
  deployedTeamsCount,
  closuresCount,
  pendingGatesCount,
  devicesCount,
}: MetricsProps) {
  const cards = [
    {
      label: 'Critical P1 Priority',
      value: criticalCount,
      icon: TriangleAlert,
      color: 'text-red-700',
      iconColor: 'text-red-600',
      border: 'border-red-200',
      bg: 'bg-red-50/40',
      sublabel: 'Threat to life cordons',
    },
    {
      label: 'Active Incidents',
      value: activeCount,
      icon: BadgeAlert,
      color: 'text-amber-800',
      iconColor: 'text-amber-600',
      border: 'border-amber-200',
      bg: 'bg-amber-50/40',
      sublabel: 'Verified operations',
    },
    {
      label: 'Deployed Units',
      value: deployedTeamsCount,
      icon: Users,
      color: 'text-blue-800',
      iconColor: 'text-blue-600',
      border: 'border-blue-200',
      bg: 'bg-blue-50/40',
      sublabel: 'NDRF & DFS units',
    },
    {
      label: 'Hazard Corridors',
      value: closuresCount,
      icon: Navigation,
      color: 'text-purple-800',
      iconColor: 'text-purple-600',
      border: 'border-purple-200',
      bg: 'bg-purple-50/40',
      sublabel: 'Dynamic detours active',
    },
    {
      label: 'Human Gates',
      value: pendingGatesCount,
      icon: TriangleAlert,
      color: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      border: 'border-yellow-200',
      bg: 'bg-yellow-50/40',
      sublabel: 'Commander sign-off',
    },
    {
      label: 'IoT Edge Nodes',
      value: devicesCount,
      icon: Cpu,
      color: 'text-emerald-800',
      iconColor: 'text-emerald-600',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/40',
      sublabel: 'HMAC-SHA256 verified',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-slate-50/60 border-b border-slate-200">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all"
          >
            <div className={`p-2 rounded-lg ${card.bg} border ${card.border} ${card.iconColor} shrink-0`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider truncate">
                {card.label}
              </div>
              <div className={`text-2xl font-bold font-mono tracking-tight ${card.color} leading-none mt-1`}>
                {card.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
