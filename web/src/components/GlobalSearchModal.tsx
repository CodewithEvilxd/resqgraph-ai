'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  TriangleAlert,
  FileText,
  Layers,
  Users,
  Radio,
  ArrowRight,
  Droplet,
  Flame,
  MapPin,
} from '@flux-icons/react';
import { NavViewId } from './Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: any[];
  reports: any[];
  evidenceList: any[];
  responders: any[];
  teams: any[];
  resources: any[];
  devices: any[];
  onSelectIncident: (inc: any) => void;
  onNavigateView: (view: NavViewId) => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  incidents,
  reports,
  evidenceList,
  responders,
  teams,
  resources,
  devices,
  onSelectIncident,
  onNavigateView,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'incidents' | 'reports' | 'evidence' | 'units'>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matches: Array<{
      id: string;
      category: 'incident' | 'report' | 'evidence' | 'unit' | 'device';
      title: string;
      subtitle: string;
      badge?: string;
      item: any;
      navTarget: NavViewId;
    }> = [];

    // Incidents
    if (activeCategory === 'all' || activeCategory === 'incidents') {
      incidents.forEach((inc) => {
        if (
          inc.code?.toLowerCase().includes(q) ||
          inc.title?.toLowerCase().includes(q) ||
          inc.hazardType?.toLowerCase().includes(q) ||
          inc.location?.address?.toLowerCase().includes(q)
        ) {
          matches.push({
            id: inc.id,
            category: 'incident',
            title: `${inc.code}: ${inc.title}`,
            subtitle: `${inc.hazardType.toUpperCase()} • ${inc.location?.address || 'NCR'}`,
            badge: inc.priority,
            item: inc,
            navTarget: 'incidents',
          });
        }
      });
    }

    // Reports
    if (activeCategory === 'all' || activeCategory === 'reports') {
      reports.forEach((rep) => {
        if (
          rep.rawContent?.toLowerCase().includes(q) ||
          rep.sourceType?.toLowerCase().includes(q) ||
          rep.location?.address?.toLowerCase().includes(q)
        ) {
          matches.push({
            id: rep.id,
            category: 'report',
            title: `Report: ${rep.rawContent?.slice(0, 50)}...`,
            subtitle: `Source: ${rep.sourceType} • Verification: ${rep.verificationStatus}`,
            badge: rep.verificationStatus,
            item: rep,
            navTarget: 'reports',
          });
        }
      });
    }

    // Evidence
    if (activeCategory === 'all' || activeCategory === 'evidence') {
      evidenceList.forEach((ev) => {
        const obsStr = (ev.observations || []).map((o: any) => o.label).join(' ');
        if (
          obsStr.toLowerCase().includes(q) ||
          ev.mediaType?.toLowerCase().includes(q) ||
          ev.sourceType?.toLowerCase().includes(q)
        ) {
          matches.push({
            id: ev.id,
            category: 'evidence',
            title: `Evidence: ${obsStr.slice(0, 45) || ev.mediaType}`,
            subtitle: `Type: ${ev.mediaType} • Confidence: ${Math.round(ev.extractionConfidence * 100)}%`,
            badge: ev.contradictionFlags?.length ? 'CONTRADICTION' : 'VERIFIED',
            item: ev,
            navTarget: 'evidence',
          });
        }
      });
    }

    // Teams & Responders
    if (activeCategory === 'all' || activeCategory === 'units') {
      teams.forEach((t) => {
        if (t.name?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q)) {
          matches.push({
            id: t.id,
            category: 'unit',
            title: `Team: ${t.name}`,
            subtitle: `${t.category.toUpperCase()} • ${t.memberCount} Members • Status: ${t.status}`,
            badge: t.status,
            item: t,
            navTarget: 'teams',
          });
        }
      });

      responders.forEach((r) => {
        if (r.badgeNumber?.toLowerCase().includes(q) || r.capabilities?.some((c: string) => c.toLowerCase().includes(q))) {
          matches.push({
            id: r.id,
            category: 'unit',
            title: `Responder: ${r.badgeNumber}`,
            subtitle: `Capabilities: ${r.capabilities.join(', ')} • Battery: ${r.batteryLevel}%`,
            badge: r.status,
            item: r,
            navTarget: 'responders',
          });
        }
      });

      resources.forEach((res) => {
        if (res.name?.toLowerCase().includes(q) || res.category?.toLowerCase().includes(q)) {
          matches.push({
            id: res.id,
            category: 'unit',
            title: `Resource: ${res.name}`,
            subtitle: `Qty: ${res.availableQuantity}/${res.quantity} Available • Status: ${res.isDeployable ? 'Deployable' : 'Maintenance'}`,
            badge: res.category,
            item: res,
            navTarget: 'resources',
          });
        }
      });

      devices.forEach((d) => {
        if (d.deviceId?.toLowerCase().includes(q) || d.deviceType?.toLowerCase().includes(q)) {
          matches.push({
            id: d.id,
            category: 'device',
            title: `IoT Node: ${d.deviceId}`,
            subtitle: `Type: ${d.deviceType} • Battery: ${d.batteryLevel}% • HMAC Active`,
            badge: d.status,
            item: d,
            navTarget: 'devices',
          });
        }
      });
    }

    return matches.slice(0, 15);
  }, [query, activeCategory, incidents, reports, evidenceList, responders, teams, resources, devices]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-20 p-4" onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col font-sans text-xs" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar with explicit Close button */}
        <div className="p-3.5 border-b border-slate-200 flex items-center space-x-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across incidents, reports, evidence, units, devices..."
            className="w-full bg-transparent text-sm font-sans font-medium text-slate-900 focus:outline-none placeholder:text-slate-400"
          />
          <div className="flex items-center space-x-2 shrink-0">
            {query && (
              <button 
                onClick={() => setQuery('')} 
                className="px-2 py-1 text-xs font-sans font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Clear input"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-slate-700 text-xs font-sans font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              title="Close Search (Esc)"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
              <kbd className="text-[9px] font-mono opacity-50">Esc</kbd>
            </button>
          </div>
        </div>

        {/* Filter Pills with Counts */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center space-x-2 bg-white text-[11px] overflow-x-auto">
          {[
            { id: 'all', label: 'All', count: incidents.length + reports.length + evidenceList.length + teams.length + responders.length },
            { id: 'incidents', label: 'Incidents', count: incidents.length },
            { id: 'reports', label: 'Reports', count: reports.length },
            { id: 'evidence', label: 'Evidence', count: evidenceList.length },
            { id: 'units', label: 'Units', count: teams.length + responders.length },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1 rounded ${activeCategory === cat.id ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>
                {cat.count}
              </span>
            </button>
          ))}
          <span className="text-slate-400 ml-auto text-[10px] font-mono shrink-0 pl-2">
            {searchResults.length} matches
          </span>
        </div>

        {/* Results Container with Interactive Quick Suggestions */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2">
          {query.trim() === '' ? (
            <div className="p-6 text-center space-y-4">
              <div className="space-y-1">
                <div className="font-bold text-slate-800 text-sm">Global Operational Search</div>
                <div className="text-xs text-slate-500">Instant search across active incidents, evidence items, field responders, and telemetry nodes.</div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Suggestions:</span>
                {[
                  { label: 'P1 Critical', q: 'P1', icon: TriangleAlert, color: 'text-red-600' },
                  { label: 'Flood Hazards', q: 'flood', icon: Droplet, color: 'text-blue-600' },
                  { label: 'Fire Response', q: 'fire', icon: Flame, color: 'text-amber-600' },
                  { label: 'Active Teams', q: 'team', icon: Users, color: 'text-emerald-600' },
                  { label: 'Sensor Nodes', q: 'node', icon: Radio, color: 'text-purple-600' },
                  { label: 'Ring Road', q: 'ring road', icon: MapPin, color: 'text-rose-600' },
                ].map((s) => {
                  const SIcon = s.icon;
                  return (
                    <button
                      key={s.q}
                      onClick={() => {
                        setQuery(s.q);
                      }}
                      className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-sans font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <SIcon className={`w-3.5 h-3.5 ${s.color}`} />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No operational records matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            searchResults.map((res) => (
              <div
                key={res.id}
                onClick={() => {
                  if (res.category === 'incident') {
                    onSelectIncident(res.item);
                  }
                  onNavigateView(res.navTarget);
                  onClose();
                }}
                className="p-3 hover:bg-slate-50 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 shrink-0">
                    {res.category === 'incident' && <TriangleAlert className="w-4 h-4 text-red-600" />}
                    {res.category === 'report' && <FileText className="w-4 h-4 text-blue-600" />}
                    {res.category === 'evidence' && <Layers className="w-4 h-4 text-indigo-600" />}
                    {res.category === 'unit' && <Users className="w-4 h-4 text-emerald-600" />}
                    {res.category === 'device' && <Radio className="w-4 h-4 text-purple-600" />}
                  </div>

                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{res.title}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{res.subtitle}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-4">
                  {res.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {res.badge}
                    </span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[10px] text-slate-500">
          <span>Navigate with arrow keys • Enter to select • Esc to dismiss</span>
          <span>ResQGraph AI Global Catalog</span>
        </div>
      </div>
    </div>
  );
}
