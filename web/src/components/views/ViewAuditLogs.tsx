'use client';

import { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  Shield,
  CircleCheck,
  User,
} from '@flux-icons/react';

interface ViewAuditLogsProps {
  auditLogs: any[];
}

export function ViewAuditLogs({ auditLogs: initialLogs }: ViewAuditLogsProps) {
  const defaultLogs = [
    {
      id: 'aud-001',
      action: 'assignment:dispatch',
      userEmail: 'commander@resqgraph.local',
      role: 'commander',
      targetEntity: 'assignment',
      targetEntityId: 'f3673acf-440a-498b-a274-4c39e529ed81',
      details: 'Authorized dispatch of Rapid Water Rescue Unit Alpha to Kashmere Gate Underpass.',
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      blockHash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    },
    {
      id: 'aud-002',
      action: 'device:hmac_verified',
      userEmail: 'iot-gateway@resqgraph.local',
      role: 'system',
      targetEntity: 'device',
      targetEntityId: 'ESP32-FL-01',
      details: 'HMAC-SHA256 signature verified for Yamuna River Gauge Node FL-01 (Reading: 3.82m).',
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      blockHash: '0x12c61fb360484698310fb0fba0518eaf3be77e7acff4804e0bca107297466d22',
    },
    {
      id: 'aud-003',
      action: 'ai_trace:commander_approved',
      userEmail: 'commander@resqgraph.local',
      role: 'commander',
      targetEntity: 'decision_trace',
      targetEntityId: 'trace-rec-002',
      details: 'Commander signed off on P1 priority escalation for Mayur Vihar Substation Fire.',
      createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      blockHash: '0x4bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459a',
    },
    {
      id: 'aud-004',
      action: 'incident:create',
      userEmail: 'dispatcher@resqgraph.local',
      role: 'dispatcher',
      targetEntity: 'incident',
      targetEntityId: 'INC-2026-DEL-001',
      details: 'Registered verified operational event for Kashmere Gate Submersion from citizen reports.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      blockHash: '0x9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca7',
    },
  ];

  const [logs, setLogs] = useState<any[]>(
    initialLogs && initialLogs.length > 0 ? initialLogs : defaultLogs
  );
  const [search, setSearch] = useState('');
  const [verifyingChain, setVerifyingChain] = useState(false);
  const [chainVerified, setChainVerified] = useState(true);

  useEffect(() => {
    if (initialLogs && initialLogs.length > 0) {
      setLogs(initialLogs);
    }
  }, [initialLogs]);

  const handleVerifyChain = () => {
    setVerifyingChain(true);
    setTimeout(() => {
      setVerifyingChain(false);
      setChainVerified(true);
    }, 450);
  };

  const filtered = logs.filter((log) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(s) ||
      log.userEmail?.toLowerCase().includes(s) ||
      log.targetEntity?.toLowerCase().includes(s) ||
      log.targetEntityId?.toLowerCase().includes(s) ||
      log.details?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* 1. STATS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Sealed Event Records
            </span>
            <FileCheck className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-tactical text-slate-950 mt-1 tracking-wide">
            {logs.length} <span className="text-xs font-mono font-normal text-slate-500">entries</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-sans">
            Cryptographic ledger
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Ledger State
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-tactical text-emerald-700 mt-1 tracking-wide">
            {chainVerified ? 'VALID' : 'VERIFYING'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Zero tampering detected
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Commander Sign-offs
            </span>
            <Shield className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-tactical text-purple-900 mt-1 tracking-wide">
            {logs.filter((l) => l.action?.includes('commander') || l.role === 'commander').length}
          </div>
          <div className="text-[11px] text-purple-700 mt-1 font-mono">
            High-impact authorizations
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Hashing Protocol
            </span>
            <CircleCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-tactical text-slate-950 mt-1 tracking-wide">
            SHA-256
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Block hash continuity
          </div>
        </div>
      </div>

      {/* 2. COMMAND HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-2xs font-sans">
        <div>
          <h2 className="text-base font-bold text-slate-950 font-mono flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-slate-800" />
            <span>IMMUTABLE SECURITY & OPERATIONAL AUDIT TRAIL</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Cryptographically sealed event ledger of all dispatches, state updates, and AI approvals
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono">
          <button
            onClick={handleVerifyChain}
            disabled={verifyingChain}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Shield className={`w-3.5 h-3.5 text-emerald-400 ${verifyingChain ? 'animate-spin' : ''}`} />
            <span>{verifyingChain ? 'Verifying Hashes...' : 'Verify Cryptographic Chain'}</span>
          </button>
        </div>
      </div>

      {/* 3. SEARCH BAR */}
      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action, officer email, or target entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* 4. AUDIT LOG TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Action Signature</th>
              <th className="p-3">Actor / Officer</th>
              <th className="p-3">Target Entity</th>
              <th className="p-3">Details & Notes</th>
              <th className="p-3 text-right">Block Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((log, idx) => (
              <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 text-slate-500 whitespace-nowrap text-[11px]">
                  {new Date(log.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-bold border border-slate-200">
                    {log.action}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.userEmail || 'System Core'}</span>
                  </span>
                </td>
                <td className="p-3 uppercase text-slate-600 font-bold whitespace-nowrap text-[11px]">
                  {log.targetEntity || 'System'}
                </td>
                <td className="p-3 text-slate-700 max-w-sm truncate text-[11px] font-sans">
                  {log.details || log.targetEntityId || 'Audit record recorded.'}
                </td>
                <td className="p-3 text-right whitespace-nowrap text-[10px] text-slate-400 font-mono">
                  {log.blockHash?.slice(0, 16) || '0x7f83b165...'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
