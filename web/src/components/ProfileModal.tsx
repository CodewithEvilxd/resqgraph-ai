'use client';

import { useState } from 'react';
import {
  User,
  Shield,
  Key,
  Bell,
  Clock,
  X,
  Lock,
} from '@flux-icons/react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: string;
}

export function ProfileModal({ isOpen, onClose, currentRole }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'sessions' | 'security' | 'notifications'>('profile');
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [radioAlerts, setRadioAlerts] = useState(true);
  const [criticalSms, setCriticalSms] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 font-mono text-xs">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
              RS
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Col. Rajiv Sharma</div>
              <div className="text-[10px] text-slate-500">Chief Emergency Incident Commander</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 border-b border-slate-200 flex space-x-4 bg-white text-[11px]">
          {(
            [
              { id: 'profile', label: 'Identity & Role', icon: User },
              { id: 'sessions', label: 'Active Sessions', icon: Clock },
              { id: 'security', label: 'Security & MFA', icon: Lock },
              { id: 'notifications', label: 'Preferences', icon: Bell },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 flex items-center space-x-1.5 border-b-2 font-bold transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Organization</span>
                  <span className="font-bold text-slate-900">Delhi Disaster Management (DEMA)</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Operational Role</span>
                  <span className="font-bold text-slate-900 capitalize">{currentRole}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">Cryptographic Clearance</span>
                <div className="text-slate-800 flex items-center space-x-1.5 font-bold">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Level 1 Tactical Commander (HMAC Ingestion + Dispatch Authorization)</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">Sector Jurisdiction</span>
                <div className="text-slate-800">
                  National Capital Region (NCR) • Sectors 01 to 08 (Yamuna Corridor, Central, Outer North)
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-emerald-50/30 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">Primary EOC Desktop Console</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-bold">
                      CURRENT
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans">
                    IP: 10.142.4.18 • Fastify Session RFC-7519 JWT • Secure Cookie
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Expires in 7h 42m • Verified TLS 1.3
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">Tactical Ruggedized Tablet (Field Sync)</div>
                  <div className="text-[11px] text-slate-500 font-sans">
                    Device UID: TAB-NCR-09 • Last Active: 45 min ago
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Signed offline buffer • 0 pending conflicts
                  </div>
                </div>
                <button className="text-red-600 hover:text-red-800 text-[10px] font-bold cursor-pointer">
                  Revoke
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <div className="font-bold text-slate-900">Multi-Factor Authentication (MFA)</div>
                  <div className="text-[11px] text-slate-500 font-sans">Hardware FIDO2 Security Key + Authenticator</div>
                </div>
                <button
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  className={`px-3 py-1 rounded font-bold cursor-pointer ${
                    mfaEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {mfaEnabled ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <div className="font-bold text-slate-900">API Key &amp; Token Rotation</div>
                  <div className="text-[11px] text-slate-500 font-sans">Last rotated 4 days ago</div>
                </div>
                <button className="px-3 py-1 bg-slate-900 text-white rounded font-bold cursor-pointer">
                  Rotate
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900">VHF Radio Voice Patch Dispatch</div>
                  <div className="text-[11px] text-slate-500 font-sans">Synthesize voice order for high priority incidents</div>
                </div>
                <input
                  type="checkbox"
                  checked={radioAlerts}
                  onChange={(e) => setRadioAlerts(e.target.checked)}
                  className="rounded text-slate-900"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900">Critical Priority SMS Override</div>
                  <div className="text-[11px] text-slate-500 font-sans">Bypass do-not-disturb for P1 Critical incidents</div>
                </div>
                <input
                  type="checkbox"
                  checked={criticalSms}
                  onChange={(e) => setCriticalSms(e.target.checked)}
                  className="rounded text-slate-900"
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-slate-500 text-[10px]">
            <Key className="w-3.5 h-3.5 text-slate-400" />
            <span>Authenticated Session • Level 1 Clear</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
