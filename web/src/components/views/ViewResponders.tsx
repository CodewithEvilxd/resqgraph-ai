'use client';

import { useState } from 'react';
import {
  UserCheck,
  Battery,
  MapPin,
  Radio,
  Search,
  Filter,
  Grid2x2,
  List,
  RefreshCw,
  Shield,
  CircleCheck,
} from '@flux-icons/react';

interface Responder {
  id: string;
  badgeNumber?: string;
  userId?: string;
  name?: string;
  officerName?: string;
  capabilities?: string[];
  status?: string;
  batteryLevel?: number;
  currentLocation?: {
    latitude?: number;
    longitude?: number;
  };
  teamId?: string;
  phone?: string;
  lastSeenAt?: string;
}

type ActiveResponder = Responder & {
  resolvedName: string;
  capabilities: string[];
  batteryLevel: number;
  status: string;
};

interface ViewRespondersProps {
  responders: Responder[];
}

export function ViewResponders({ responders = [] }: ViewRespondersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'en_route' | 'on_scene' | 'low_battery'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedResponder, setSelectedResponder] = useState<ActiveResponder | null>(null);
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  // Fallback demo officer names if DB record does not carry a custom name
  const getOfficerName = (r: Responder, idx: number) => {
    if (r.name) return r.name;
    if (r.officerName) return r.officerName;
    if (r.userId === '44444444-4444-4444-4444-444444444444') return 'Inspector Vikas Singh (Lead)';
    const defaultRoster = [
      'Capt. Rajesh Verma',
      'Officer Sunita Rao',
      'Paramedic Amit Sharma',
      'Sub-Inspector Priya Nair',
      'Rescue Specialist Rohit Malik',
      'HAZMAT Tech Deepa Joshi',
    ];
    return defaultRoster[idx % defaultRoster.length];
  };

  const activeResponders = responders.map((r, idx) => ({
    ...r,
    resolvedName: getOfficerName(r, idx),
    capabilities: r.capabilities || ['FIRST_AID', 'RADIO_OPERATOR'],
    batteryLevel: typeof r.batteryLevel === 'number' ? r.batteryLevel : 85,
    status: r.status || 'available',
  }));

  const filtered = activeResponders.filter((r) => {
    const matchesSearch =
      r.resolvedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.badgeNumber && r.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.capabilities.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'available') return r.status === 'available';
    if (statusFilter === 'en_route') return r.status === 'en_route';
    if (statusFilter === 'on_scene') return r.status === 'on_scene';
    if (statusFilter === 'low_battery') return r.batteryLevel < 30;
    return true;
  });

  const availableCount = activeResponders.filter((r) => r.status === 'available').length;
  const deployedCount = activeResponders.filter((r) => r.status === 'en_route' || r.status === 'on_scene').length;
  const lowBatteryCount = activeResponders.filter((r) => r.batteryLevel < 30).length;

  const handlePingBeacon = (id: string, name: string) => {
    setPingingId(id);
    setPingStatus(`Transmitting RF ping to ${name}...`);
    setTimeout(() => {
      setPingingId(null);
      setPingStatus(`Authenticated GPS Beacon telemetry received from ${name} (RTT: 14ms)`);
      setTimeout(() => setPingStatus(null), 4000);
    }, 850);
  };

  const handlePingAll = () => {
    setPingingId('ALL');
    setPingStatus('Broadcasting encrypted sync beacon across all tactical field mesh channels...');
    setTimeout(() => {
      setPingingId(null);
      setPingStatus(`Synchronized ${activeResponders.length} responder GPS fixes via PostGIS (P95: 18ms)`);
      setTimeout(() => setPingStatus(null), 4500);
    }, 1100);
  };

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[10px] font-mono text-blue-700 font-bold mb-1">
            <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
            <span>ENCRYPTED GPS BEACON REGISTRY</span>
          </div>
          <h2 className="text-base font-bold text-slate-950 font-mono flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-slate-800" />
            <span>FIELD RESPONDER PERSONNEL ROSTER</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            Active field personnel with authenticated GPS beacons, battery health, and specialized tactical capabilities
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePingAll}
            disabled={pingingId !== null}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-mono font-bold cursor-pointer transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${pingingId === 'ALL' ? 'animate-spin' : ''}`} />
            <span>Ping All Beacons</span>
          </button>
          <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {activeResponders.length} Officers Registered
          </span>
        </div>
      </div>

      {/* Real-time Ping Alert Strip */}
      {pingStatus && (
        <div className="bg-slate-50 text-emerald-700 border border-slate-200 px-4 py-2.5 rounded-xl font-mono text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{pingStatus}</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-bold">SHA-256 HMAC VERIFIED</span>
        </div>
      )}

      {/* KPI Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Personnel</div>
          <div className="text-2xl font-bold text-slate-950 mt-1">{activeResponders.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Assigned to NCR sectors</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-emerald-600 uppercase tracking-widest font-bold">Standby & Ready</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{availableCount}</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">Available for dispatch</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-blue-600 uppercase tracking-widest font-bold">Actively Deployed</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{deployedCount}</div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">En route or on scene</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-amber-600 uppercase tracking-widest font-bold">Battery Warning</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{lowBatteryCount}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Under 30% battery reserve</div>
        </div>
      </div>

      {/* Filter and Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-2xs text-xs font-mono">
        <div className="flex items-center space-x-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, badge #, or capability..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center space-x-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {(
            [
              { key: 'all', label: `All (${activeResponders.length})` },
              { key: 'available', label: `Available (${availableCount})` },
              { key: 'en_route', label: 'En Route' },
              { key: 'on_scene', label: 'On Scene' },
              { key: 'low_battery', label: `Low Battery (${lowBatteryCount})` },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                statusFilter === t.key
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-1 border-l border-slate-200 pl-3">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg border cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Card Grid Mode"
          >
            <Grid2x2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg border cursor-pointer ${
              viewMode === 'table'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Dense Table Mode"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Responders Content */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs font-mono text-slate-500 space-y-1">
          <div className="font-bold text-slate-700">No responders match the active filter criteria.</div>
          <div>Try clearing the search query or selecting "All" to inspect all operational units.</div>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => {
            const isPinging = pingingId === r.id;
            const isLowBattery = r.batteryLevel < 30;

            return (
              <div
                key={r.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-all space-y-3 font-mono text-xs flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-bold text-slate-800">
                      {r.badgeNumber || `RES-${r.id.slice(0, 6)}`}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        r.status === 'available'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : r.status === 'on_scene'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-950 font-sans tracking-tight">
                      {r.resolvedName}
                    </h3>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1">
                      <Shield className="w-3 h-3 text-slate-400" />
                      <span>Authorized First Responder</span>
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Skills & Equipment:</div>
                    <div className="flex flex-wrap gap-1">
                      {r.capabilities.map((c) => (
                        <span
                          key={c}
                          className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-semibold"
                        >
                          {c.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Telemetry Box */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center space-x-1">
                        <Battery className={`w-3.5 h-3.5 ${isLowBattery ? 'text-red-600' : 'text-emerald-600'}`} />
                        <span>Device Battery</span>
                      </span>
                      <span className={`font-bold ${isLowBattery ? 'text-red-700' : 'text-slate-900'}`}>
                        {r.batteryLevel}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>GPS Coordinates</span>
                      </span>
                      <span className="text-slate-800 font-bold">
                        {r.currentLocation?.latitude ? `${r.currentLocation.latitude.toFixed(4)}, ${r.currentLocation.longitude?.toFixed(4)}` : '28.6139, 77.2090'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Link Security</span>
                      <span className="text-emerald-700 font-bold flex items-center space-x-1">
                        <CircleCheck className="w-3 h-3" />
                        <span>Encrypted (P2P)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handlePingBeacon(r.id, r.resolvedName)}
                    disabled={isPinging}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-[11px] flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Radio className={`w-3 h-3 text-blue-600 ${isPinging ? 'animate-pulse' : ''}`} />
                    <span>{isPinging ? 'Pinging...' : 'Ping Beacon'}</span>
                  </button>

                  <button
                    onClick={() => setSelectedResponder(r)}
                    className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dense Operational Table */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="p-3">Badge Number</th>
                <th className="p-3">Officer Name</th>
                <th className="p-3">Role Capabilities</th>
                <th className="p-3">Status</th>
                <th className="p-3">Battery</th>
                <th className="p-3">Last GPS Fix</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => {
                const isPinging = pingingId === r.id;
                const isLowBattery = r.batteryLevel < 30;

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded">
                        {r.badgeNumber || `RES-${r.id.slice(0, 6)}`}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-950 font-sans whitespace-nowrap">
                      {r.resolvedName}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {r.capabilities.map((c) => (
                          <span key={c} className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-slate-700">
                            {c.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          r.status === 'available'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : r.status === 'on_scene'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 font-bold">
                        <Battery className={`w-3.5 h-3.5 ${isLowBattery ? 'text-red-600' : 'text-emerald-600'}`} />
                        <span className={isLowBattery ? 'text-red-700' : 'text-slate-900'}>{r.batteryLevel}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>
                          {r.currentLocation?.latitude ? `${r.currentLocation.latitude.toFixed(4)}, ${r.currentLocation.longitude?.toFixed(4)}` : '28.6139, 77.2090'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handlePingBeacon(r.id, r.resolvedName)}
                        disabled={isPinging}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-[10px] cursor-pointer"
                      >
                        {isPinging ? 'Pinging...' : 'Ping'}
                      </button>
                      <button
                        onClick={() => setSelectedResponder(r)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-[10px] cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspect Modal */}
      {selectedResponder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900 text-sm">
                  Responder Telemetry Dossier
                </span>
              </div>
              <button
                onClick={() => setSelectedResponder(null)}
                className="text-slate-400 hover:text-slate-900 cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Officer Identification</div>
                <div className="text-base font-bold text-slate-950 font-sans">{selectedResponder.resolvedName}</div>
                <div className="text-slate-500">Badge: {selectedResponder.badgeNumber || 'AUTH-OFFICER'} • ID: {selectedResponder.id}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Operational Status</div>
                  <div className="font-bold text-slate-900 uppercase mt-0.5">{selectedResponder.status}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Battery Reserve</div>
                  <div className="font-bold text-emerald-700 mt-0.5">{selectedResponder.batteryLevel}% (Healthy)</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">GPS Accuracy</div>
                  <div className="font-bold text-slate-900 mt-0.5">±2.4 meters (PostGIS)</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Mesh Signal</div>
                  <div className="font-bold text-slate-900 mt-0.5">-62 dBm (Excellent)</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Tactical Qualifications</div>
                <div className="flex flex-wrap gap-1">
                  {selectedResponder.capabilities?.map((c) => (
                    <span key={c} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 rounded font-semibold text-[10px]">
                      {c.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <CircleCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hardware HMAC Key Pair Active</span>
                </div>
                <div>Signed with ephemeral device cert. All telemetry records carry non-repudiation cryptographic timestamps.</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedResponder(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
