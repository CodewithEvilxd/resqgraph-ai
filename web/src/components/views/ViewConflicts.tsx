'use client';

import { useState } from 'react';
import {
  BadgeAlert,
  CircleCheck,
  Radio,
  User,
  Shield,
  Check,
  Compass,
} from '@flux-icons/react';

interface ViewConflictsProps {
  evidenceList?: any[];
  incidents?: any[];
  onRefresh?: () => void;
}

export function ViewConflicts({
  evidenceList = [],
  incidents = [],
  onRefresh,
}: ViewConflictsProps) {
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolvedList, setResolvedList] = useState<{ [key: string]: { action: string; time: string } }>({});

  // Sample authoritative conflicting items for demonstration if evidence list is empty
  const defaultConflicts = [
    {
      id: 'conflict-fl-01',
      incidentCode: 'INC-2026-DEL-001',
      title: 'Water Level Inundation Discrepancy at Yamuna Rail Bridge',
      category: 'SENSOR_VS_CITIZEN',
      claimA: {
        source: 'IoT River Gauge Node FL-01',
        type: 'hardware',
        value: '3.82m Water Depth (Critical Surge Rate +0.82m/35min)',
        confidence: 0.99,
        authenticated: true,
      },
      claimB: {
        source: 'Citizen 911 Hotline Dispatch #883',
        type: 'citizen',
        value: 'Caller reports underpass is clear with less than 0.5m water',
        confidence: 0.42,
        authenticated: false,
      },
      status: 'UNRESOLVED',
      location: 'Old Yamuna Bridge Underpass, Delhi',
    },
    {
      id: 'conflict-ev-02',
      incidentCode: 'INC-2026-DEL-002',
      title: 'Casualty Count Contradiction at Mayur Vihar Substation',
      category: 'ESTIMATE_DISCREPANCY',
      claimA: {
        source: 'Drone Aerial Thermal Scan DR-04',
        type: 'drone',
        value: 'Zero trapped individuals detected in immediate thermal plume',
        confidence: 0.95,
        authenticated: true,
      },
      claimB: {
        source: 'Field Dispatch Audio Transcript',
        type: 'radio',
        value: 'Unverified report of 4 persons trapped inside market annex',
        confidence: 0.60,
        authenticated: false,
      },
      status: 'UNRESOLVED',
      location: 'Mayur Vihar Phase 1 Sector Market, Delhi',
    },
  ];

  const [activeConflicts, setActiveConflicts] = useState(defaultConflicts);

  const handleResolve = (conflictId: string, actionType: string) => {
    setResolvingId(conflictId);
    setTimeout(() => {
      setResolvedList((prev) => ({
        ...prev,
        [conflictId]: {
          action: actionType,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      }));
      setResolvingId(null);
      onRefresh?.();
    }, 350);
  };

  const handleReset = () => {
    setResolvedList({});
    setActiveConflicts(defaultConflicts);
  };

  const unresolvedCount = activeConflicts.filter((c) => !resolvedList[c.id]).length;

  return (
    <div className="space-y-5 font-sans">
      {/* 1. STATS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Flagged Contradictions
            </span>
            <span className={`w-2 h-2 rounded-full ${unresolvedCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          </div>
          <div className="text-2xl font-bold font-tactical text-slate-950 mt-1 tracking-wide">
            {unresolvedCount} <span className="text-xs font-mono font-normal text-slate-500">active</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-sans">
            Preserved as uncertainty
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Human Sign-Off Gate
            </span>
            <Shield className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-tactical text-purple-800 mt-1 tracking-wide">
            Mandatory
          </div>
          <div className="text-[11px] text-purple-700 mt-1 font-mono">
            Commander authority required
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Resolved Conflicts
            </span>
            <CircleCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-tactical text-emerald-700 mt-1 tracking-wide">
            {Object.keys(resolvedList).length} <span className="text-xs font-mono font-normal text-slate-500">audited</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Immutable log committed
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Cryptographic Proof
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-1.5 py-0.2 rounded">HMAC-SHA256</span>
          </div>
          <div className="text-2xl font-bold font-tactical text-blue-900 mt-1 tracking-wide">
            100%
          </div>
          <div className="text-[11px] text-blue-700 mt-1 font-mono">
            {evidenceList?.length || 6} feeds • {incidents?.length || 4} incident cordons
          </div>
        </div>
      </div>

      {/* 2. COMMAND HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-950 flex items-center space-x-2">
            <BadgeAlert className="w-4 h-4 text-amber-600" />
            <span>CONFLICT & UNCERTAINTY RESOLUTION MATRIX</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Strict isolation of contradictory evidence streams with mandatory human commander ground-truth sign-off
          </p>
        </div>

        <div className="flex items-center gap-2">
          {Object.keys(resolvedList).length > 0 && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
            >
              Reset Demo
            </button>
          )}

          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
              unresolvedCount > 0
                ? 'text-amber-800 bg-amber-50 border-amber-200'
                : 'text-emerald-800 bg-emerald-50 border-emerald-200'
            }`}
          >
            {unresolvedCount} Active Contradiction{unresolvedCount === 1 ? '' : 's'} Flagged
          </span>
        </div>
      </div>

      {/* 3. CONFLICT CARDS GRID */}
      <div className="space-y-4">
        {activeConflicts.map((c) => {
          const isResolved = !!resolvedList[c.id];
          const resolution = resolvedList[c.id];

          return (
            <div
              key={c.id}
              className={`bg-white border rounded-xl p-5 shadow-2xs space-y-4 transition-all ${
                isResolved ? 'border-emerald-200 bg-slate-50/50' : 'border-amber-200 hover:border-amber-300'
              }`}
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200 text-xs">
                    {c.incidentCode}
                  </span>
                  <h3 className="font-bold text-slate-950 font-syne text-sm">{c.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                    {c.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                      isResolved
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {isResolved ? 'RESOLVED BY COMMANDER' : 'UNCERTAINTY VISIBLE'}
                  </span>
                </div>
              </div>

              {/* Opposing Claims Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Claim A: Sensor / Authoritative */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-blue-900">
                      <Radio className="w-3.5 h-3.5 text-blue-600" />
                      <span>STREAM A: {c.claimA.source}</span>
                    </div>
                    {c.claimA.authenticated && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                        HMAC SIGNED
                      </span>
                    )}
                  </div>

                  <p className="text-slate-800 font-sans font-medium text-xs leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                    &ldquo;{c.claimA.value}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Hardware Sensor Confidence</span>
                    <strong className="text-emerald-700">{Math.round(c.claimA.confidence * 100)}%</strong>
                  </div>
                </div>

                {/* Claim B: Observational / Citizen */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <User className="w-3.5 h-3.5 text-amber-600" />
                      <span>STREAM B: {c.claimB.source}</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                      UNVERIFIED CALL
                    </span>
                  </div>

                  <p className="text-slate-800 font-sans font-medium text-xs leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                    &ldquo;{c.claimB.value}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Citizen Dispatch Confidence</span>
                    <strong className="text-amber-700">{Math.round(c.claimB.confidence * 100)}%</strong>
                  </div>
                </div>
              </div>

              {/* Action / Resolution Footer */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sector: {c.location}</span>
                </div>

                {isResolved ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-800 text-xs">
                    <CircleCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                      Decision Logged: <strong>{resolution.action}</strong> at {resolution.time}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleResolve(c.id, 'Verified Sensor Ground Truth')}
                      disabled={resolvingId === c.id}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors text-xs"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Accept Sensor Ground Truth (HMAC)</span>
                    </button>

                    <button
                      onClick={() => handleResolve(c.id, 'Recon Drone Dispatched for Corroboration')}
                      disabled={resolvingId === c.id}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors text-xs"
                    >
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      <span>Dispatch Drone Recon</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
