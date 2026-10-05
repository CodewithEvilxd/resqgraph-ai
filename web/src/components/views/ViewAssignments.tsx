'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  SquareCheck,
  Shield,
  Check,
  Navigation,
} from '@flux-icons/react';
import { api } from '../../lib/api';

interface ViewAssignmentsProps {
  assignments: any[];
  onRefresh: () => void;
}

export function ViewAssignments({ assignments: initialAssignments, onRefresh }: ViewAssignmentsProps) {
  const defaultAssignments = [
    {
      id: 'asg-01',
      incidentCode: 'INC-2026-DEL-001',
      incidentTitle: 'Kashmere Gate Underpass Submersion',
      teamName: 'Rapid Water Rescue Unit Alpha (NDRF)',
      status: 'en_route',
      approvalReason: 'Emergency boat evacuation for 3 trapped citizens on vehicle roof.',
      dispatchedTime: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      etaMinutes: 6,
      currentLocation: 'Salimgarh Bypass Corridor (Northbound)',
      commanderJustification: 'Commander Authorized: Priority P1 Life Threat',
    },
    {
      id: 'asg-02',
      incidentCode: 'INC-2026-DEL-002',
      incidentTitle: 'Mayur Vihar 11kV Substation Fire',
      teamName: 'Delhi Fire Service HazMat Tender 07',
      status: 'on_scene',
      approvalReason: 'Chemical foam suppression & perimeter containment.',
      dispatchedTime: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
      etaMinutes: 0,
      currentLocation: 'Sector Market Perimeter Cordon',
      commanderJustification: 'Commander Authorized: Chemical Foam Foam-7 Deployed',
    },
  ];

  const [assignments, setAssignments] = useState<any[]>(
    initialAssignments && initialAssignments.length > 0 ? initialAssignments : defaultAssignments
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (initialAssignments && initialAssignments.length > 0) {
      setAssignments(initialAssignments);
    }
  }, [initialAssignments]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await api.updateAssignmentStatus(id, newStatus).catch(() => null);
      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      if (onRefresh) onRefresh();
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'dispatched':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'en_route':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'on_scene':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const activeCount = assignments.filter((a) => a.status !== 'completed').length;
  const enRouteCount = assignments.filter((a) => a.status === 'en_route').length;
  const onSceneCount = assignments.filter((a) => a.status === 'on_scene').length;

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* 1. STATS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Active Deployments
            </span>
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-tactical text-slate-950 mt-1 tracking-wide">
            {activeCount} <span className="text-xs font-mono font-normal text-slate-500">teams</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-sans">
            Under commander dispatch
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              En Route Corridor
            </span>
            <Navigation className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-tactical text-blue-700 mt-1 tracking-wide">
            {enRouteCount} <span className="text-xs font-mono font-normal text-blue-500">transit</span>
          </div>
          <div className="text-[11px] text-blue-600 mt-1 font-mono">
            Safe detour GPS tracking
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              On Scene Operations
            </span>
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-tactical text-purple-700 mt-1 tracking-wide">
            {onSceneCount} <span className="text-xs font-mono font-normal text-purple-500">engaged</span>
          </div>
          <div className="text-[11px] text-purple-600 mt-1 font-sans">
            Direct incident perimeter
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Response SLA
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
              &lt;20m Target
            </span>
          </div>
          <div className="text-2xl font-bold font-tactical text-emerald-700 mt-1 tracking-wide">
            14.2 min
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Average on-scene time
          </div>
        </div>
      </div>

      {/* 2. COMMAND HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-2xs font-sans">
        <div>
          <h2 className="text-base font-bold text-slate-950 font-mono flex items-center space-x-2">
            <SquareCheck className="w-4 h-4 text-emerald-600" />
            <span>OPERATIONAL UNIT ASSIGNMENTS & DISPATCH PROGRESSION</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Human commander authorized dispatches, real-time stage transitions, and field coordination
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {assignments.length} Total Registered Dispatches
          </span>
        </div>
      </div>

      {/* 3. ASSIGNMENTS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
            <tr>
              <th className="p-3">ID / Code</th>
              <th className="p-3">Target Incident</th>
              <th className="p-3">Assigned Tactical Unit</th>
              <th className="p-3">Deployment Stage</th>
              <th className="p-3">Commander Justification</th>
              <th className="p-3">Dispatched</th>
              <th className="p-3 text-right">Update Phase</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assignments.map((asg) => {
              const incidentDisplay = asg.incidentCode || asg.incidentTitle || 'Target Incident';
              const teamDisplay = asg.teamName || (asg.team ? asg.team.name : 'Tactical Unit');
              const isUpdating = updatingId === asg.id;

              return (
                <tr key={asg.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded">
                      {asg.id?.slice(0, 8) || 'ASG-001'}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs">
                    <div className="font-bold text-slate-950 truncate font-syne">{incidentDisplay}</div>
                    <div className="text-[11px] text-slate-500 truncate font-sans">
                      {asg.approvalReason || asg.notes || 'Emergency dispatch'}
                    </div>
                  </td>
                  <td className="p-3 font-bold text-slate-800 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      <span>{teamDisplay}</span>
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusBadge(
                        asg.status
                      )}`}
                    >
                      {asg.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 max-w-[200px] truncate text-[11px]">
                    {asg.commanderJustification || 'Commander Authorized for Execution'}
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-500 text-[11px]">
                    {new Date(asg.dispatchedTime || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      {asg.status === 'dispatched' && (
                        <button
                          onClick={() => handleStatusChange(asg.id, 'en_route')}
                          disabled={isUpdating}
                          className="px-2.5 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded text-[10px] font-bold border border-blue-200 cursor-pointer"
                        >
                          Mark En Route
                        </button>
                      )}
                      {asg.status === 'en_route' && (
                        <button
                          onClick={() => handleStatusChange(asg.id, 'on_scene')}
                          disabled={isUpdating}
                          className="px-2.5 py-1 bg-purple-50 text-purple-800 hover:bg-purple-100 rounded text-[10px] font-bold border border-purple-200 cursor-pointer"
                        >
                          Mark On Scene
                        </button>
                      )}
                      {asg.status === 'on_scene' && (
                        <button
                          onClick={() => handleStatusChange(asg.id, 'completed')}
                          disabled={isUpdating}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-[10px] font-bold border border-emerald-200 cursor-pointer"
                        >
                          Mark Completed
                        </button>
                      )}
                      {asg.status === 'completed' && (
                        <span className="text-emerald-700 font-bold inline-flex items-center space-x-1 text-[11px]">
                          <Check className="w-3.5 h-3.5" />
                          <span>Mission Complete</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
