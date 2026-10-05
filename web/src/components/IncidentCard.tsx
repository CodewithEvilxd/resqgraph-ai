'use client';

import { Flame, Droplet, Building, OctagonAlert, Activity, MapPin, Users, FileText } from '@flux-icons/react';

interface IncidentCardProps {
  incident: any;
  isSelected: boolean;
  onSelect: (incident: any) => void;
}

export function IncidentCard({ incident, isSelected, onSelect }: IncidentCardProps) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'P1_CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'P2_HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200 font-semibold';
      case 'P3_MEDIUM':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'reported':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'verified':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'dispatched':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'active':
        return 'bg-red-50 text-red-700 border-red-200 font-semibold';
      case 'contained':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getHazardIcon = (type: string) => {
    switch (type) {
      case 'fire':
        return <Flame className="w-4 h-4 text-red-600" />;
      case 'flood':
        return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'building_collapse':
        return <Building className="w-4 h-4 text-amber-600" />;
      case 'gas_leak':
      case 'hazmat_leak':
        return <OctagonAlert className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div
      onClick={() => onSelect(incident)}
      className={`p-3.5 rounded-lg border transition-all cursor-pointer select-none text-left mb-2.5 ${
        isSelected
          ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500/30 shadow-sm'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-2xs'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-slate-100 border border-slate-200">
            {getHazardIcon(incident.hazardType)}
          </div>
          <span className="font-mono text-xs font-bold text-slate-900 tracking-wider">
            {incident.code}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${getPriorityStyle(incident.priority)}`}>
            {incident.priority.replace('P1_', 'P1: ').replace('P2_', 'P2: ').replace('P3_', 'P3: ').replace('P4_', 'P4: ')}
          </span>
          <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${getStatusStyle(incident.status)}`}>
            {incident.status}
          </span>
        </div>
      </div>

      <h4 className="text-xs font-semibold text-slate-900 line-clamp-1 mb-1">
        {incident.title}
      </h4>

      <p className="text-[11px] text-slate-600 line-clamp-2 mb-2 leading-relaxed">
        {incident.description}
      </p>

      <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
        <div className="flex items-center space-x-1 truncate max-w-[170px]">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{incident.location?.address || `${incident.location?.latitude.toFixed(3)}, ${incident.location?.longitude.toFixed(3)}`}</span>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {incident.affectedPeopleEstimate > 0 && (
            <span className="flex items-center space-x-0.5 text-amber-700 font-semibold">
              <Users className="w-3 h-3" />
              <span>{incident.affectedPeopleEstimate}</span>
            </span>
          )}
          <span className="flex items-center space-x-0.5 text-slate-600">
            <FileText className="w-3 h-3" />
            <span>{incident.evidenceCount || 0}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
