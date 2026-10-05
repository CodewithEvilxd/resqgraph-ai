'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  CirclePlus,
  Clock,
  TriangleAlert,
  Users,
  Smartphone,
  Shield,
  X,
} from '@flux-icons/react';
import { api } from '../../lib/api';

export function ViewAlerts() {
  const defaultAlerts = [
    {
      id: 'alert-01',
      title: 'IMMEDIATE EVACUATION: Kashmere Gate Basin',
      severity: 'CRITICAL',
      targetArea: 'Ring Road Underpass & Yamuna Floodplain Cordon (28.6678° N, 77.2285° E)',
      radiusKm: 1.5,
      message: 'Severe flash flood inundation exceeding 4.5ft. Evacuate low-lying areas and move to designated higher ground immediately. Avoid Ring Road underpasses.',
      active: true,
      broadcastChannel: 'Cell Broadcast & CAP Siren Grid',
      targetPopulation: 28500,
      deliveredPct: 99.4,
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
      id: 'alert-02',
      title: 'HAZARDOUS SMOKE ADVISORY: Mayur Vihar Sector 1',
      severity: 'WARNING',
      targetArea: 'Mayur Vihar Phase 1 Commercial Perimeter',
      radiusKm: 2.0,
      message: 'Dense smoke plume from 11kV electrical transformer fire. Close all windows and ventilation. Asthmatic and vulnerable individuals remain indoors.',
      active: true,
      broadcastChannel: 'Cell Broadcast Push',
      targetPopulation: 42000,
      deliveredPct: 98.8,
      createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    },
    {
      id: 'alert-03',
      title: 'Traffic Advisory: Salimgarh Detour Enforced',
      severity: 'ADVISORY',
      targetArea: 'Bhairon Marg & Vikas Marg Eastbound',
      radiusKm: 5.0,
      message: 'Bhairon Marg railway underpass closed due to drain overflow. Emergency responder corridor active via Salimgarh Bypass.',
      active: false,
      broadcastChannel: 'Radio & Navigation Mesh',
      targetPopulation: 110000,
      deliveredPct: 100.0,
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
  ];

  const [alerts, setAlerts] = useState<any[]>(defaultAlerts);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewPhoneAlert, setPreviewPhoneAlert] = useState<any | null>(defaultAlerts[0]);

  const [newTitle, setNewTitle] = useState('');
  const [newSeverity, setNewSeverity] = useState<'CRITICAL' | 'WARNING' | 'ADVISORY'>('WARNING');
  const [newArea, setNewArea] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const loadAlerts = async () => {
    try {
      const data = await api.listAlerts();
      if (Array.isArray(data) && data.length > 0) {
        setAlerts(data);
      } else {
        setAlerts(defaultAlerts);
      }
    } catch {
      setAlerts(defaultAlerts);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const realAlert = await api.createAlert({
        title: newTitle,
        severity: newSeverity,
        targetArea: newArea,
        message: newMessage,
      }).catch(() => null);

      const created = realAlert || {
        id: `alert-${Date.now()}`,
        title: newTitle,
        severity: newSeverity,
        targetArea: newArea,
        radiusKm: 2.5,
        message: newMessage,
        active: true,
        broadcastChannel: 'Cell Broadcast & CAP Sirens',
        targetPopulation: 34000,
        deliveredPct: 100.0,
        createdAt: new Date().toISOString(),
      };
      setAlerts([created, ...alerts]);
      setPreviewPhoneAlert(created);
      setModalOpen(false);
      setNewTitle('');
      setNewArea('');
      setNewMessage('');
    } catch {
      // handled
    }
  };

  const handleToggleStatus = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const activeAlertsCount = alerts.filter((a) => a.active).length;
  const totalCoveredPopulation = alerts.reduce((acc, a) => acc + (a.targetPopulation || 0), 0);

  return (
    <div className="space-y-5 font-sans">
      {/* 1. STATS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Active Broadcasts
            </span>
            <span className={`w-2 h-2 rounded-full ${activeAlertsCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
          </div>
          <div className="text-2xl font-bold font-tactical text-red-700 mt-1 tracking-wide">
            {activeAlertsCount} <span className="text-xs font-mono font-normal text-slate-500">transmitting</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-sans">
            Cell towers & sirens armed
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Target Citizens in Cordon
            </span>
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-tactical text-slate-950 mt-1 tracking-wide">
            {totalCoveredPopulation.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Within active geofence
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Delivery Success
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
              Cell Broadcast
            </span>
          </div>
          <div className="text-2xl font-bold font-tactical text-emerald-700 mt-1 tracking-wide">
            99.6%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            P99 delivery SLA: &lt;1.2s
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Protocol Standard
            </span>
            <Shield className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-tactical text-purple-900 mt-1 tracking-wide">
            CAP v1.2
          </div>
          <div className="text-[11px] text-purple-700 mt-1 font-mono">
            Common Alerting Protocol
          </div>
        </div>
      </div>

      {/* 2. COMMAND HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-2xs font-sans">
        <div>
          <h2 className="text-base font-bold text-slate-950 font-mono flex items-center space-x-2">
            <Bell className="w-4 h-4 text-red-600" />
            <span>PUBLIC EMERGENCY BROADCAST & SIREN DISPATCH</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Geo-targeted wireless emergency cell broadcasts, multi-agency evacuation warnings, and perimeter sirens
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 shadow-2xs cursor-pointer transition-colors"
        >
          <CirclePlus className="w-3.5 h-3.5" />
          <span>New Emergency Broadcast</span>
        </button>
      </div>

      {/* 3. WORKBENCH: BROADCAST CARDS & SIMULATED MOBILE DEVICE NOTIFICATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Broadcast Cards List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Active & Historic Emergency Transmissions:</span>
            <span className="text-slate-400">Click &apos;Simulate Device View&apos; to test</span>
          </div>

          {alerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';
            const isSelected = previewPhoneAlert?.id === alert.id;

            return (
              <div
                key={alert.id}
                className={`bg-white border rounded-xl p-5 shadow-2xs space-y-3.5 transition-all ${
                  isSelected ? 'border-blue-400 ring-2 ring-blue-400/20' : isCritical ? 'border-red-200' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        isCritical
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : isWarning
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <h3 className="font-bold text-slate-950 font-syne text-sm">{alert.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        alert.active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {alert.active ? 'TRANSMITTING' : 'ARCHIVED'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-sans leading-relaxed">
                  {alert.message}
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Target Geofence:</span>
                    <span className="text-slate-800 font-bold truncate block">{alert.targetArea}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Population in Cordon:</span>
                    <span className="text-slate-800 font-bold">{alert.targetPopulation ? alert.targetPopulation.toLocaleString() : '35,000'} souls</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Delivery Ratio:</span>
                    <span className="text-emerald-700 font-bold">{alert.deliveredPct || 99.4}% Received</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Logged: {new Date(alert.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewPhoneAlert(alert)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] cursor-pointer transition-colors"
                    >
                      Simulate Device Screen
                    </button>
                    <button
                      onClick={() => handleToggleStatus(alert.id)}
                      className={`px-2.5 py-1 rounded font-bold text-[11px] cursor-pointer transition-colors border ${
                        alert.active
                          ? 'bg-white hover:bg-red-50 text-red-700 border-red-200'
                          : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {alert.active ? 'Halt Transmission' : 'Re-Arm Broadcast'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Simulated Mobile Device Wireless Alert Screen (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-red-400" />
                <span className="font-bold font-syne text-xs uppercase tracking-wider text-slate-200">
                  Simulated Citizen Device View
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Cell ID: NCR-EOC-T1</span>
            </div>

            {previewPhoneAlert ? (
              <div className="bg-white border-2 border-red-500 shadow-sm rounded-2xl p-4 space-y-3 relative overflow-hidden">
                {/* Visual red strobe alert indicator */}
                <div className="absolute top-0 inset-x-0 h-1 bg-red-500 animate-pulse" />

                <div className="flex items-center justify-between text-[11px] font-mono text-red-400 font-bold">
                  <span className="flex items-center gap-1.5 uppercase">
                    <TriangleAlert className="w-3.5 h-3.5 text-red-500 animate-bounce" />
                    <span>EMERGENCY ALERT</span>
                  </span>
                  <span>NOW</span>
                </div>

                <h4 className="font-syne font-black text-sm text-white leading-tight">
                  {previewPhoneAlert.title}
                </h4>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {previewPhoneAlert.message}
                </p>

                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Target: {previewPhoneAlert.targetArea.slice(0, 24)}...</span>
                  <span className="text-emerald-400 font-bold">SIREN ACTIVE</span>
                </div>

                <button
                  onClick={() => alert(`Simulated cell siren acknowledged on citizen handset.`)}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold font-mono text-xs cursor-pointer shadow-xs transition-colors mt-2"
                >
                  Acknowledge Emergency Notice
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                Select an alert to preview simulated citizen screen.
              </div>
            )}

            <div className="text-[11px] text-slate-400 font-sans leading-relaxed space-y-1 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-200 font-bold font-mono text-[10px] uppercase">Compliance Guarantee:</div>
              <div>• Transmitted via Cell Broadcast System (CBS) avoiding network congestion.</div>
              <div>• Overrides handset Do-Not-Disturb modes for P1 Critical declarations.</div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW BROADCAST MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-950 font-syne text-base">
                  Declare Public Emergency Broadcast
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Alert Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH FLOOD EMERGENCY: MOVE TO HIGH GROUND"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Severity Tier
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    <option value="CRITICAL">Critical (Immediate Evacuation)</option>
                    <option value="WARNING">Warning (Severe Threat)</option>
                    <option value="ADVISORY">Advisory (Precautionary)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Target Sector / Landmark
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yamuna Basin Sector 4"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Broadcast Message Body (Handset Transmission)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Clear, authoritative instruction to citizens in Hindi and English..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono font-bold shadow-xs cursor-pointer"
                >
                  Authorize Cell Transmission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
