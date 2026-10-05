'use client';

import { useState } from 'react';
import {
  FileText,
  Clock,
  MapPin,
  CirclePlus,
  User,
  Radio,
  Check,
  X,
  PhoneCall,
  Activity,
  Shield,
  ArrowRight,
} from '@flux-icons/react';
import { api } from '../../lib/api';

interface ViewReportsProps {
  reports: any[];
  onRefresh: () => void;
  onNewReportClick: () => void;
  onPromoteToIncident?: (report: any) => void;
}

export function ViewReports({
  reports,
  onRefresh,
  onNewReportClick,
  onPromoteToIncident,
}: ViewReportsProps) {
  const [filterType, setFilterType] = useState('ALL');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeVoicePlaying, setActiveVoicePlaying] = useState<string | null>(null);

  // Statistics
  const citizenCount = reports.filter((r) => r.sourceType === 'citizen').length;
  const deviceCount = reports.filter((r) => r.sourceType === 'device').length;
  const responderCount = reports.filter((r) => r.sourceType === 'responder').length;
  const voiceCount = reports.filter((r) => r.sourceType === 'voice').length;
  const verifiedCount = reports.filter((r) => r.isVerified).length;

  const handleVerify = async (reportId: string, currentStatus: boolean) => {
    try {
      setLoadingId(reportId);
      await api.verifyReport(reportId, !currentStatus);
      onRefresh();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update verification', err);
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = reports.filter((r) => {
    if (filterType === 'ALL') return true;
    return r.sourceType === filterType;
  });

  return (
    <div className="space-y-5 font-sans">
      {/* 1. CHANNEL TELEMETRY METRIC STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterType('ALL')}
          className={`text-left border p-4 rounded-xl shadow-2xs transition-all cursor-pointer ${
            filterType === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-400 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-semibold tracking-wider opacity-80">
              Total Ingested Stream
            </span>
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 tracking-tight">
            {reports.length} <span className="text-xs font-sans font-normal opacity-70">reports</span>
          </div>
          <div className="text-[11px] mt-1 opacity-80 font-sans">
            {verifiedCount} verified in incident graph
          </div>
        </button>

        <button
          onClick={() => setFilterType('citizen')}
          className={`text-left border p-4 rounded-xl shadow-2xs transition-all cursor-pointer ${
            filterType === 'citizen'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-700 uppercase font-semibold tracking-wider">
              Citizen 911 Hotline
            </span>
            <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900 mt-1 tracking-tight">
            {citizenCount} <span className="text-xs font-sans font-normal text-amber-600">calls</span>
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-sans">
            NLP fact extraction pipeline
          </div>
        </button>

        <button
          onClick={() => setFilterType('device')}
          className={`text-left border p-4 rounded-xl shadow-2xs transition-all cursor-pointer ${
            filterType === 'device'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400/30'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-blue-700 uppercase font-semibold tracking-wider">
              IoT Hardware Nodes
            </span>
            <Radio className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-900 mt-1 tracking-tight">
            {deviceCount} <span className="text-xs font-sans font-normal text-blue-600">pings</span>
          </div>
          <div className="text-[11px] text-blue-700 mt-1 font-mono">
            HMAC-SHA256 authenticated
          </div>
        </button>

        <button
          onClick={() => setFilterType('responder')}
          className={`text-left border p-4 rounded-xl shadow-2xs transition-all cursor-pointer ${
            filterType === 'responder'
              ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400/30'
              : 'bg-white border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-purple-700 uppercase font-semibold tracking-wider">
              Tactical Mesh Radio
            </span>
            <Shield className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-900 mt-1 tracking-tight">
            {responderCount} <span className="text-xs font-sans font-normal text-purple-600">field logs</span>
          </div>
          <div className="text-[11px] text-purple-700 mt-1 font-sans">
            Direct responder telemetry
          </div>
        </button>
      </div>

      {/* 2. COMMAND HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-950 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Incoming Multi-Channel Situational Reports Stream</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Distress calls, audio transcripts, and sensor pings queued for commander verification
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onNewReportClick}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm cursor-pointer transition-all"
          >
            <CirclePlus className="w-3.5 h-3.5 text-blue-400" />
            <span>Submit Field Report</span>
          </button>
        </div>
      </div>

      {/* 3. SOURCE CHANNEL FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 border border-slate-200 rounded-xl shadow-2xs text-xs font-sans">
        <span className="text-slate-500 font-semibold text-[11px] mr-1">Channel:</span>
        {[
          { id: 'ALL', label: `All (${reports.length})` },
          { id: 'citizen', label: `Citizen 911 (${citizenCount})` },
          { id: 'device', label: `IoT Nodes (${deviceCount})` },
          { id: 'responder', label: `Responders (${responderCount})` },
          { id: 'voice', label: `Audio Calls (${voiceCount})` },
          { id: 'drone', label: 'Drone Video (2)' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilterType(item.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              filterType === item.id
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 4. REPORTS STREAM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white p-12 border border-slate-200 rounded-xl text-center font-mono text-xs text-slate-500 shadow-2xs">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="font-bold text-slate-800 text-sm">No reports match selected channel filter</div>
            <p className="text-slate-400 mt-1">Switch to All or submit a new field report using the button above.</p>
          </div>
        ) : (
          filtered.map((report) => {
            const isVoice = report.sourceType === 'voice';
            const isDevice = report.sourceType === 'device';
            const isPlaying = activeVoicePlaying === report.id;

            return (
              <div
                key={report.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Header Badge */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="p-1 rounded bg-slate-100 text-slate-800 border border-slate-200 font-bold">
                        {isDevice ? (
                          <Radio className="w-3.5 h-3.5 text-blue-600" />
                        ) : isVoice ? (
                          <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-slate-700" />
                        )}
                      </span>
                      <span className="font-bold text-slate-900 uppercase">
                        {report.sourceType} {report.channel ? `• ${report.channel}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDevice && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                          HMAC VALIDATED
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          report.isVerified
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {report.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    </div>
                  </div>

                  {/* Audio / Voice Waveform Simulation */}
                  {isVoice && (
                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-amber-900">
                        <span className="font-bold flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-amber-600" />
                          <span>Distress Audio Telemetry (00:42)</span>
                        </span>
                        <span className="text-[10px] bg-amber-100 px-1.5 py-0.2 rounded font-bold">
                          Hindi (Delhi NCR) • 98.4% Confidence
                        </span>
                      </div>

                      {/* Interactive Simulated Soundwave Bars */}
                      <div
                        onClick={() => setActiveVoicePlaying(isPlaying ? null : report.id)}
                        className="flex items-center gap-1 h-7 cursor-pointer px-2 bg-white/70 rounded border border-amber-200/60"
                        title="Click to play simulated audio recording"
                      >
                        {[12, 24, 18, 28, 14, 22, 10, 26, 16, 28, 20, 14, 22, 12, 26, 18, 22, 14, 20, 26, 16, 24].map((h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all ${
                              isPlaying ? 'bg-amber-600 animate-pulse' : 'bg-amber-300 hover:bg-amber-400'
                            }`}
                            style={{ height: `${isPlaying ? Math.max(8, (h + (i % 3) * 6)) : h}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Report Narrative Text */}
                  <p className="text-xs text-slate-800 font-sans leading-relaxed font-medium">
                    {report.rawText || report.summary || 'Citizen report text awaiting extraction.'}
                  </p>

                  {/* Telemetry metadata block */}
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs font-mono space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{report.location?.address || 'NCR Spatial Coordinates Assigned'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(report.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ID: {report.id?.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs font-mono">
                  <button
                    onClick={() => handleVerify(report.id, report.isVerified)}
                    disabled={loadingId === report.id}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-[11px] cursor-pointer transition-colors shadow-2xs ${
                      report.isVerified
                        ? 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {report.isVerified ? (
                      <>
                        <X className="w-3 h-3 text-red-500" />
                        <span>Revoke Verification</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3 text-white" />
                        <span>Verify Report</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    {onPromoteToIncident && !report.incidentId && (
                      <button
                        onClick={() => onPromoteToIncident(report)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <span>Promote to Incident</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
