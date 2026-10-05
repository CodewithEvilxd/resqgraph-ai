'use client';

import { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Activity,
  Layers,
  Send,
  Navigation,
  Clock,
  MapPin,
  RefreshCw,
  Cpu,
  TriangleAlert,
  CircleCheck,
} from '@flux-icons/react';
import { api } from '../lib/api';

interface IncidentDetailModalProps {
  incident: any;
  onClose: () => void;
  onIncidentUpdated: () => void;
  userRole?: string;
}

export function IncidentDetailModal({
  incident,
  onClose,
  onIncidentUpdated,
}: IncidentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'fusion' | 'risk' | 'graph' | 'traces' | 'routing' | 'dispatch'>('fusion');
  const [loading, setLoading] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<any | null>(null);
  const [graphData, setGraphData] = useState<any | null>(null);
  const [traces, setTraces] = useState<any[]>([]);
  const [routeData, setRouteData] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [operatorNotes, setOperatorNotes] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [risk, graph, traceList, recs] = await Promise.all([
        api.getIncidentRisk(incident.id).catch(() => null),
        api.getIncidentGraph(incident.id).catch(() => null),
        api.getDecisionTraces(incident.id).catch(() => []),
        api.getRecommendations(incident.id).catch(() => []),
      ]);

      setRiskAssessment(risk);
      setGraphData(graph);
      setTraces(traceList);
      setRecommendations(recs);

      // Auto calculate response route from nearest station
      const origin = { latitude: 28.630, longitude: 77.245, address: 'ITO Emergency Center' };
      const route = await api.calculateRoute(origin, incident.location, true).catch(() => null);
      setRouteData(route);
    } catch (err: any) {
      setStatusMessage(`Error loading incident data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [incident.id]);

  // Handle status transition
  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);
      await api.updateIncidentStatus(incident.id, newStatus, `Operator transition to ${newStatus}`);
      setStatusMessage(`Status transitioned to '${newStatus}'`);
      onIncidentUpdated();
    } catch (err: any) {
      setStatusMessage(`Status transition failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Run Evidence Fusion
  const handleRunFusion = async () => {
    try {
      setLoading(true);
      await api.fuseEvidence(incident.id);
      setStatusMessage('Evidence fusion executed successfully');
      loadData();
    } catch (err: any) {
      setStatusMessage(`Fusion failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Human Review of Decision Trace
  const handleReviewTrace = async (traceId: string, isApproved: boolean) => {
    try {
      setLoading(true);
      await api.reviewDecisionTrace(traceId, isApproved, operatorNotes || (isApproved ? 'Approved by commander' : 'Overridden with tactical priority'));
      setStatusMessage(`Decision trace ${isApproved ? 'approved' : 'overridden'}`);
      setOperatorNotes('');
      loadData();
    } catch (err: any) {
      setStatusMessage(`Review submission failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Dispatch Team
  const handleDispatchTeam = async (teamId: string) => {
    try {
      setLoading(true);
      await api.dispatchTeam(incident.id, teamId, operatorNotes || 'Immediate emergency dispatch authorized');
      setStatusMessage('Team successfully dispatched to scene');
      onIncidentUpdated();
      loadData();
    } catch (err: any) {
      setStatusMessage(`Dispatch failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const contradictions = graphData?.edges.filter((e: any) => e.relation === 'contradicts') || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {incident.code}
              </span>
              <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded border bg-red-50 text-red-700 border-red-200">
                {incident.priority}
              </span>
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded border bg-slate-100 text-slate-700 border-slate-200">
                Status: {incident.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">{incident.title}</h2>
            <div className="flex items-center space-x-4 text-xs text-slate-500 font-mono">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{incident.location?.address || `${incident.location?.latitude}, ${incident.location?.longitude}`}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(incident.createdAt).toLocaleTimeString()}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Transition Control Bar */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-600 font-mono text-[11px] font-medium">Workflow Controls:</div>
          <div className="flex items-center space-x-1.5">
            {['verified', 'dispatched', 'active', 'contained', 'resolved', 'closed'].map((st) => (
              <button
                key={st}
                disabled={incident.status === st || loading}
                onClick={() => handleStatusChange(st)}
                className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase font-semibold transition-all ${
                  incident.status === st
                    ? 'bg-slate-900 text-white cursor-default'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-500 hover:text-slate-900 shadow-2xs'
                }`}
              >
                Mark {st}
              </button>
            ))}
          </div>
        </div>

        {/* Global Alert / Status Message */}
        {statusMessage && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 text-xs font-mono text-blue-900 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-slate-500 hover:text-slate-800">
              Dismiss
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-mono overflow-x-auto">
          {[
            { id: 'fusion', label: 'Evidence Fusion', icon: Activity, badge: contradictions.length > 0 ? `${contradictions.length} Conflict` : undefined },
            { id: 'risk', label: 'Risk Intelligence', icon: ShieldCheck },
            { id: 'graph', label: 'Incident Graph', icon: Layers },
            { id: 'traces', label: 'Decision Traces & Gate', icon: Cpu, badge: traces.length },
            { id: 'routing', label: 'Tactical Routing', icon: Navigation },
            { id: 'dispatch', label: 'Team Allocation', icon: Send, badge: recommendations.length },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 font-medium transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'border-slate-900 text-slate-950 bg-white font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 border border-red-200 font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-mono">
          {/* TAB 1: Evidence Fusion */}
          {activeTab === 'fusion' && (
            <div className="space-y-4">
              {/* Contradiction Warning Banner */}
              {contradictions.length > 0 && (
                <div className="p-3.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-950 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold">
                    <TriangleAlert className="w-4 h-4 text-amber-600" />
                    <span>CONTRADICTORY EVIDENCE DETECTED (HUMAN VERIFICATION REQUIRED)</span>
                  </div>
                  <p className="text-amber-900 text-[11px] leading-relaxed">
                    Evidence fusion identified conflicting ground observations regarding accessibility. Uncertainty score has been heightened.
                  </p>
                  <div className="bg-white/80 p-2.5 rounded border border-amber-200 text-[11px] space-y-1">
                    {contradictions.map((c: any, i: number) => (
                      <div key={i} className="text-amber-900">
                        Conflict on factor: <span className="font-semibold text-slate-900">{c.label}</span> between Evidence <span className="underline">{c.source.slice(0, 8)}</span> and <span className="underline">{c.target.slice(0, 8)}</span>.
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold uppercase text-[11px]">Linked Evidence Items ({graphData?.summary?.totalEvidence || 0})</span>
                <button
                  onClick={handleRunFusion}
                  disabled={loading}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-mono flex items-center space-x-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Execute Evidence Fusion</span>
                </button>
              </div>

              {/* Evidence Node Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {graphData?.nodes?.filter((n: any) => n.type === 'evidence').map((ev: any) => (
                  <div key={ev.id} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-900">{ev.label}</span>
                      <span className={`px-1.5 py-0.2 rounded border ${ev.status === 'verified' ? 'text-emerald-700 border-emerald-200 bg-emerald-50' : 'text-amber-700 border-amber-200 bg-amber-50'}`}>
                        {ev.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-sans">
                      Source: <span className="font-mono text-slate-800">{ev.metadata?.sourceType}</span> | Confidence: <span className="font-mono text-slate-800">{(ev.metadata?.extractionConfidence * 100 || 80).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Multi-Factor Risk Assessment */}
          {activeTab === 'risk' && (
            <div className="space-y-4">
              {riskAssessment ? (
                <div className="space-y-4">
                  {/* Score Card */}
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase text-slate-500 font-bold">Composite Risk Score</div>
                      <div className="text-3xl font-bold font-mono text-red-700 mt-1">
                        {riskAssessment.compositeRiskScore} / 100
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Risk Tier: <span className="text-slate-900 font-bold">{riskAssessment.riskTier}</span> | Recommended: <span className="text-slate-900 font-bold">{riskAssessment.recommendedPriority}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase text-slate-500 font-bold">Uncertainty Metric</div>
                      <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
                        {(riskAssessment.uncertaintyScore * 100).toFixed(0)}%
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Unresolved evidence weight</div>
                    </div>
                  </div>

                  {/* Factor Breakdown */}
                  <div className="space-y-2">
                    <div className="text-[11px] uppercase font-bold text-slate-600">Multi-Factor Score Weights</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {riskAssessment.factors.map((factor: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900 capitalize">{factor.name.replace(/_/g, ' ')}</span>
                            <span className="text-blue-700 font-bold">{factor.score} pts (wt: {(factor.weight * 100).toFixed(0)}%)</span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-sans leading-relaxed">{factor.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 py-8 text-center">Calculating risk metrics...</div>
              )}
            </div>
          )}

          {/* TAB 3: Incident Knowledge Graph */}
          {activeTab === 'graph' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Reports</div>
                  <div className="text-base font-bold text-slate-900">{graphData?.summary?.totalReports || 0}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Evidence</div>
                  <div className="text-base font-bold text-slate-900">{graphData?.summary?.totalEvidence || 0}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Responders</div>
                  <div className="text-base font-bold text-slate-900">{graphData?.summary?.totalResponders || 0}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Contradictions</div>
                  <div className="text-base font-bold text-red-700">{graphData?.summary?.contradictionCount || 0}</div>
                </div>
              </div>

              {/* Topology Nodes List */}
              <div className="space-y-2">
                <div className="text-[11px] uppercase font-bold text-slate-600">Connected Entity Topology ({graphData?.nodes?.length || 0} Nodes, {graphData?.edges?.length || 0} Edges)</div>
                <div className="max-h-60 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {graphData?.nodes?.map((node: any) => (
                    <div key={node.id} className="flex items-center justify-between p-2 rounded bg-white border border-slate-200 text-[11px] shadow-2xs">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.2 rounded uppercase font-bold text-[9px] bg-slate-100 text-slate-700 border border-slate-200">
                          {node.type}
                        </span>
                        <span className="text-slate-800 font-sans">{node.label}</span>
                      </div>
                      {node.severity && (
                        <span className="text-[10px] font-mono text-amber-700 font-bold">{node.severity}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Decision Traces & Human-in-the-Loop Gate */}
          {activeTab === 'traces' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <div className="text-[11px] font-bold text-slate-800 uppercase">Operator Rationale / Override Reason</div>
                <input
                  type="text"
                  placeholder="Enter confirmation reason or tactical override notes..."
                  value={operatorNotes}
                  onChange={(e) => setOperatorNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-slate-800"
                />
              </div>

              {traces.length > 0 ? (
                <div className="space-y-3">
                  {traces.map((trace) => (
                    <div key={trace.id} className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-blue-700 uppercase text-[10px]">{trace.recommendationType}</span>
                          <span className="text-slate-500 text-[10px]">by {trace.provider} ({trace.model})</span>
                        </div>

                        {trace.isApprovedByHuman !== undefined ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${trace.isApprovedByHuman ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {trace.isApprovedByHuman ? 'Human Authorized' : 'Human Overridden'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-amber-50 text-amber-800 border-amber-200">
                            Pending Approval Gate
                          </span>
                        )}
                      </div>

                      <div className="text-slate-900 text-xs font-sans leading-relaxed">{trace.recommendedAction}</div>

                      {/* Factor citation breakdown */}
                      <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[10px] space-y-1">
                        <div className="text-slate-600">Cited Evidence References: {trace.citedEvidenceIds?.join(', ') || 'None'}</div>
                        <div className="text-slate-500">Confidence: {(trace.confidenceScore * 100).toFixed(0)}% | Uncertainty: {(trace.uncertaintyScore * 100).toFixed(0)}%</div>
                      </div>

                      {/* Human Gate Action Buttons */}
                      {trace.isApprovedByHuman === undefined && (
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            onClick={() => handleReviewTrace(trace.id, true)}
                            disabled={loading}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-mono text-[11px] font-semibold flex items-center space-x-1"
                          >
                            <CircleCheck className="w-3.5 h-3.5" />
                            <span>Authorize Action</span>
                          </button>
                          <button
                            onClick={() => handleReviewTrace(trace.id, false)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded font-mono text-[11px] font-semibold"
                          >
                            Override / Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 py-6 text-center">No AI decision traces recorded yet for this incident.</div>
              )}
            </div>
          )}

          {/* TAB 5: Tactical Routing & Detour */}
          {activeTab === 'routing' && (
            <div className="space-y-4">
              {routeData ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Route Feasibility</div>
                      <div className={`text-base font-bold mt-0.5 ${routeData.safety?.isPassable ? 'text-emerald-700' : 'text-red-700'}`}>
                        {routeData.safety?.isPassable ? 'Passable via Hazard Detour' : 'Impassable Direct'}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        Distance: {(routeData.distanceMeters / 1000).toFixed(2)} km | Est. Travel Time: {Math.round(routeData.estimatedDurationSeconds / 60)} min
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Safety Index</div>
                      <div className="text-2xl font-bold font-mono text-emerald-700">
                        {(routeData.safety?.safetyScore * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Warnings & Detour alerts */}
                  {routeData.safety?.warnings?.length > 0 && (
                    <div className="p-2.5 rounded border border-amber-200 bg-amber-50 text-amber-900 text-[11px] space-y-1">
                      <div className="font-bold flex items-center space-x-1 text-amber-800">
                        <TriangleAlert className="w-3.5 h-3.5" />
                        <span>Active En-Route Hazard Warnings:</span>
                      </div>
                      {routeData.safety.warnings.map((w: string, i: number) => (
                        <div key={i}>- {w}</div>
                      ))}
                    </div>
                  )}

                  {/* Waypoints */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] uppercase font-bold text-slate-600">Turn-by-Turn Waypoints</div>
                    {routeData.waypoints?.map((w: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-md bg-white border border-slate-200 flex items-center justify-between text-[11px] shadow-2xs">
                        <span className="text-slate-800 font-medium">Step {w.order}: {w.instruction}</span>
                        <span className="text-slate-500 font-mono">{w.latitude.toFixed(4)}, {w.longitude.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 py-6 text-center">Calculating tactical response route...</div>
              )}
            </div>
          )}

          {/* TAB 6: Team Allocation & Dispatch */}
          {activeTab === 'dispatch' && (
            <div className="space-y-4">
              <div className="text-[11px] uppercase font-bold text-slate-600">Available Teams & Capability Recommendations</div>
              <div className="space-y-2">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-2xs">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs">{rec.teamName}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${rec.currentStatus === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                          {rec.currentStatus}
                        </span>
                        <span className="text-blue-700 font-mono text-[10px] font-semibold">
                          Match: {(rec.capabilityMatchScore * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-sans">
                        {rec.reasons.join(' | ')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Required Gear: {rec.requiredEquipment?.join(', ')}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDispatchTeam(rec.teamId)}
                      disabled={loading || rec.currentStatus !== 'available'}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded font-mono text-[11px] font-semibold shrink-0 transition-colors shadow-2xs"
                    >
                      Authorize Dispatch
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
