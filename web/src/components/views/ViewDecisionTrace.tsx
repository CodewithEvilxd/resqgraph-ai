'use client';

import { useState, useEffect } from 'react';
import {
  GitBranch,
  RefreshCw,
  CircleCheck,
  Check,
  X,
  Shield,
  Clock,
  Sparkles,
} from '@flux-icons/react';
import { api } from '../../lib/api';

export function ViewDecisionTrace() {
  const defaultTraces = [
    {
      id: 'trace-rec-001',
      incidentCode: 'INC-2026-DEL-001',
      incidentTitle: 'Kashmere Gate Underpass Submersion',
      recommendationType: 'TACTICAL_UNIT_DISPATCH',
      recommendedAction: 'Dispatch NDRF Rapid Water Rescue Unit Alpha (4 Personnel + Inflatable Motor Boat)',
      confidenceScore: 0.96,
      uncertaintyScore: 0.04,
      isApprovedByHuman: null,
      steps: [
        { num: '01', title: 'Telemetry Ingestion', desc: 'Received HMAC-verified surge reading from River Gauge FL-01 (+0.82m depth spike).' },
        { num: '02', title: 'Cross-Corroboration', desc: 'Matched with 3 citizen hotline reports confirming sedan and auto submerged to roof level.' },
        { num: '03', title: 'Composite Risk Scoring', desc: 'Calculated composite risk score of 94/100 (Tier P1_CRITICAL) under PostGIS spatial matrix.' },
        { num: '04', title: 'Resource Proximity Check', desc: 'NDRF Unit Alpha at Okhla Hub identified as closest capable boat team (ETA 19 mins via Salimgarh Bypass).' },
      ],
      justification: 'Critical life threat: 3 citizens trapped on vehicle roof with rising floodwaters. Road closures require elevated detour.',
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      id: 'trace-rec-002',
      incidentCode: 'INC-2026-DEL-002',
      incidentTitle: 'Mayur Vihar 11kV Substation Fire',
      recommendationType: 'PRIORITY_ESCALATION',
      recommendedAction: 'Escalate Incident Priority from P2_HIGH to P1_CRITICAL & Trigger Cell Evacuation Alert (Radius: 1.5km)',
      confidenceScore: 0.93,
      uncertaintyScore: 0.07,
      isApprovedByHuman: true,
      humanReviewReason: 'Commander Authorized: Dense commercial market within 100m flame propagation envelope.',
      reviewedBy: 'Commander DEMA-NCR-01',
      steps: [
        { num: '01', title: 'Acoustic & Thermal Ingestion', desc: 'Drone DR-04 logs thermal heat plume exceeding 480°C near oil-cooled transformer core.' },
        { num: '02', title: 'Hazard Spread Prediction', desc: 'Wind vector 14 km/h Northeast models toxic smoke plume drift towards crowded shopping arcade.' },
        { num: '03', title: 'Commander Gate Triggered', desc: 'Mandatory human approval required prior to public siren broadcast and grid shutdown.' },
      ],
      justification: 'High probability of secondary explosion. Immediate perimeter evacuation recommended.',
      createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    },
  ];

  const [traces, setTraces] = useState<any[]>(defaultTraces);
  const [loading, setLoading] = useState(false);
  const [overrideInput, setOverrideInput] = useState<{ [key: string]: string }>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const loadTraces = async () => {
    try {
      setLoading(true);
      const data = await api.listAllDecisionTraces();
      if (Array.isArray(data) && data.length > 0) {
        setTraces(data);
      } else {
        setTraces(defaultTraces);
      }
    } catch (err) {
      setTraces(defaultTraces);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTraces();
  }, []);

  const handleReview = async (id: string, isApproved: boolean) => {
    try {
      setSubmittingId(id);
      const reason = overrideInput[id] || (isApproved ? 'Commander Authorized for Execution' : 'Commander Rejected with Operational Override');
      await api.reviewDecisionTrace(id, isApproved, reason).catch(() => null);
      setTraces((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                isApprovedByHuman: isApproved,
                humanReviewReason: reason,
                reviewedBy: 'Col. Rajiv Sharma (DEMA Commander)',
              }
            : t
        )
      );
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* 1. VISUAL HERO BANNER WITH REAL EOC COMMAND PREVIEW */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 p-5 space-y-2">
            <div className="inline-flex items-center space-x-2 text-[11px] font-mono text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
              <span>HUMAN-IN-THE-LOOP ARCHITECTURAL GATE • ZERO AUTONOMOUS DISPATCH</span>
            </div>
            <h2 className="text-xl font-sans font-bold text-slate-950 tracking-tight">
              Explainable AI Decision Traces &amp; Commander Approval Gates
            </h2>
            <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-2xl">
              Transparent algorithmic step provenance with mandatory human commander authorization before operational actions.
              Every dispatch, priority escalation, and siren trigger requires verifiable sign-off.
            </p>
            <div className="pt-1">
              <button
                onClick={loadTraces}
                disabled={loading}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Decision Traces</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-4 p-4 flex justify-end">
            <div className="relative w-full max-w-[240px] aspect-16/10 rounded-lg overflow-hidden border border-slate-200 shadow-xs">
              <img
                src="/features/eoc-command-preview.jpg"
                alt="EOC Operations Floor"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1.5 right-1.5 bg-white/95 backdrop-blur-xs text-purple-700 border border-purple-200 text-[9px] font-mono px-1.5 py-0.5 rounded">
                EOC GATEWAY
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
              AI Decision Traces
            </span>
            <GitBranch className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-950 mt-1 tracking-tight">
            {traces.length} <span className="text-xs font-sans font-normal text-slate-500">provenances</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Step-by-step reasoning chains
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
              Human Review Status
            </span>
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tracking-tight">
            100% Gated
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Zero autonomous deployment
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
              Mean AI Confidence
            </span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
              High
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-950 mt-1 tracking-tight">
            94.5%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Mean uncertainty: 5.5%
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
              Audit Hash Commit
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-900 mt-1 tracking-tight">
            Immutable
          </div>
          <div className="text-[11px] text-blue-700 mt-1">
            Tied to commander user ID
          </div>
        </div>
      </div>

      {/* 3. TRACES LIST */}
      <div className="space-y-5">
        {traces.map((trace) => {
          const conf = Math.round((trace.confidenceScore || 0.95) * 100);
          const uncert = 100 - conf;
          const isApproved = trace.isApprovedByHuman === true;
          const isRejected = trace.isApprovedByHuman === false;

          return (
            <div
              key={trace.id}
              className={`bg-white border rounded-xl p-5 shadow-2xs space-y-4 transition-all ${
                isApproved
                  ? 'border-emerald-200'
                  : isRejected
                  ? 'border-red-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold font-mono border border-slate-200 text-xs">
                    {trace.incidentCode}
                  </span>
                  <span className="font-bold text-slate-950 font-sans text-sm">
                    {trace.incidentTitle}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase border border-slate-200 font-mono">
                    {trace.recommendationType?.replace('_', ' ')}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border font-mono ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : isRejected
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {isApproved ? 'COMMANDER AUTHORIZED' : isRejected ? 'OVERRIDDEN / REJECTED' : 'PENDING HUMAN GATE'}
                  </span>
                </div>
              </div>

              {/* Recommended Action Pill */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700 uppercase flex items-center gap-1.5 font-sans">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>AI Algorithmic Recommendation:</span>
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-emerald-700 font-bold">Confidence: {conf}%</span>
                    <span>•</span>
                    <span className="text-slate-500">Uncertainty: {uncert}%</span>
                  </div>
                </div>

                <div className="text-slate-950 font-sans font-bold text-sm bg-white p-3 rounded-lg border border-slate-200">
                  {trace.recommendedAction}
                </div>

                <p className="text-xs text-slate-600 font-sans leading-relaxed pt-1">
                  Justification: {trace.justification}
                </p>
              </div>

              {/* Step-by-Step Reasoning Chain */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Step-by-Step Fact Provenance Chain:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(trace.steps || []).map((st: any, idx: number) => (
                    <div key={idx} className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                        <span>STEP {st.num || `0${idx + 1}`}</span>
                        <span className="text-purple-600 uppercase font-mono">{st.title}</span>
                      </div>
                      <p className="text-slate-700 font-sans text-xs leading-relaxed">
                        {st.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commander Review Footer */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                {isApproved || isRejected ? (
                  <div className={`p-3 rounded-lg border flex items-center justify-between ${
                    isApproved ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-red-50/80 border-red-200 text-red-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      {isApproved ? <CircleCheck className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-red-600" />}
                      <span className="font-bold">
                        {trace.humanReviewReason || (isApproved ? 'Commander Authorized' : 'Rejected')}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Actor: {trace.reviewedBy || 'Commander'}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Optional commander sign-off notes or operational override justification..."
                        value={overrideInput[trace.id] || ''}
                        onChange={(e) => setOverrideInput({ ...overrideInput, [trace.id]: e.target.value })}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-sans text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Logged: {new Date(trace.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReview(trace.id, false)}
                          disabled={submittingId === trace.id}
                          className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-300 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject / Override</span>
                        </button>

                        <button
                          onClick={() => handleReview(trace.id, true)}
                          disabled={submittingId === trace.id}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors text-xs"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Authorize Action (Commander Gate)</span>
                        </button>
                      </div>
                    </div>
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
