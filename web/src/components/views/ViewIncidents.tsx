'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  ChevronRight,
  TriangleAlert,
  CirclePlus,
  Grid2x2,
  List,
  MapPin,
  Users,
  Flame,
  Droplet,
  ArrowRight,
  Clock,
  Navigation,
} from '@flux-icons/react';

interface ViewIncidentsProps {
  incidents: any[];
  onSelectIncident: (incident: any) => void;
  onNewIncidentClick: () => void;
  onNavigateToMap?: (incident: any) => void;
}

export function ViewIncidents({
  incidents,
  onSelectIncident,
  onNewIncidentClick,
  onNavigateToMap,
}: ViewIncidentsProps) {
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // KPI Calculations
  const p1Count = incidents.filter((i) => i.priority === 'P1_CRITICAL').length;
  const p2Count = incidents.filter((i) => i.priority === 'P2_HIGH').length;
  const p3Count = incidents.filter((i) => i.priority === 'P3_MEDIUM').length;
  const totalCasualties = incidents.reduce((sum, i) => sum + (parseInt(i.affectedPeopleEstimate, 10) || 0), 0);
  const avgConfidence = incidents.length > 0
    ? Math.round((incidents.reduce((sum, i) => sum + (parseFloat(i.confidenceScore) || 0.85), 0) / incidents.length) * 100)
    : 92;

  const filtered = incidents.filter((inc) => {
    const matchesPri = filterPriority === 'ALL' || inc.priority === filterPriority;
    const matchesStat = filterStatus === 'ALL' || inc.status === filterStatus;
    const matchesSearch =
      !search ||
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.code.toLowerCase().includes(search.toLowerCase()) ||
      inc.description.toLowerCase().includes(search.toLowerCase()) ||
      (inc.location?.address && inc.location.address.toLowerCase().includes(search.toLowerCase()));

    return matchesPri && matchesStat && matchesSearch;
  });

  const getHazardIcon = (hazardType: string) => {
    const type = (hazardType || '').toLowerCase();
    if (type.includes('flood') || type.includes('water')) {
      return <Droplet className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (type.includes('fire')) {
      return <Flame className="w-3.5 h-3.5 text-orange-600" />;
    }
    return <TriangleAlert className="w-3.5 h-3.5 text-red-600" />;
  };

  return (
    <div className="space-y-5 font-sans">
      {/* 1. OPERATIONAL KPI METRIC BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => { setFilterPriority('ALL'); setFilterStatus('ALL'); }}
          className="text-left bg-white border border-slate-200 hover:border-slate-400 p-4 rounded-xl shadow-2xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Active Triage Load</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-950 mt-1 tracking-tight">
            {incidents.length} <span className="text-xs font-sans font-normal text-slate-500">incidents</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
            <span className="font-semibold text-red-600 font-mono">{p1Count} Critical</span>
            <span>•</span>
            <span className="text-slate-500 font-mono">{p2Count} High</span>
          </div>
        </button>

        <button
          onClick={() => setFilterPriority(filterPriority === 'P1_CRITICAL' ? 'ALL' : 'P1_CRITICAL')}
          className={`text-left border p-4 rounded-xl shadow-2xs transition-all cursor-pointer ${
            filterPriority === 'P1_CRITICAL'
              ? 'bg-red-50/80 border-red-300 ring-2 ring-red-400/30'
              : 'bg-white border-slate-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-red-700 uppercase font-semibold tracking-wider flex items-center gap-1">
              <TriangleAlert className="w-3 h-3 text-red-600" />
              <span>P1 Critical Threat</span>
            </span>
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-800">DEFCON 2</span>
          </div>
          <div className="text-2xl font-bold font-mono text-red-700 mt-1 tracking-tight">
            {p1Count} <span className="text-xs font-sans font-normal text-red-500">immediate</span>
          </div>
          <div className="text-[11px] text-red-600 mt-1 font-sans">
            Requires human commander sign-off
          </div>
        </button>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">AI Corroboration</span>
            <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">PostGIS Verified</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tracking-tight">
            {avgConfidence}%
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${avgConfidence}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Casualties in Cordon</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-950 mt-1 tracking-tight">
            {totalCasualties} <span className="text-xs font-sans font-normal text-slate-500">souls</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Evacuation corridors active
          </div>
        </div>
      </div>

      {/* 2. COMMAND HEADER & CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-950 flex items-center space-x-2">
            <TriangleAlert className="w-4 h-4 text-red-600" />
            <span>National Disaster Triage &amp; Verified Directory</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Fusing citizen 911 calls, responder radio reports, and cryptographic edge telemetry
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-950 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card Grid Mode"
            >
              <Grid2x2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-950 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Dense Table Mode"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Table</span>
            </button>
          </div>

          <button
            onClick={onNewIncidentClick}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 shadow-sm cursor-pointer transition-all"
          >
            <CirclePlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Incident</span>
          </button>
        </div>
      </div>

      {/* 3. FILTER AND SEARCH BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-2xs">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code, title, hazard, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 flex items-center space-x-1 text-[11px]">
            <Filter className="w-3 h-3" />
            <span>Priority:</span>
          </span>
          {[
            { id: 'ALL', label: `All (${incidents.length})` },
            { id: 'P1_CRITICAL', label: `P1 Critical (${p1Count})` },
            { id: 'P2_HIGH', label: `P2 High (${p2Count})` },
            { id: 'P3_MEDIUM', label: `P3 Medium (${p3Count})` },
          ].map((pri) => (
            <button
              key={pri.id}
              onClick={() => setFilterPriority(pri.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                filterPriority === pri.id
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {pri.label}
            </button>
          ))}

          <span className="text-slate-300 hidden lg:inline">|</span>

          <span className="text-slate-400 text-[11px] hidden sm:inline">Status:</span>
          {['ALL', 'active', 'verified', 'reported', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                filterStatus === st
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. MAIN VIEW CONTAINER: CARDS VS TABLE */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white p-12 border border-slate-200 rounded-xl text-center font-mono text-xs text-slate-500 shadow-2xs">
              <TriangleAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="font-bold text-slate-800 text-sm">No incidents match current operational filter</div>
              <p className="text-slate-400 mt-1">Try clearing the search query or priority filters above.</p>
            </div>
          ) : (
            filtered.map((inc) => {
              const isP1 = inc.priority === 'P1_CRITICAL';
              const isP2 = inc.priority === 'P2_HIGH';
              const confPct = Math.round((parseFloat(inc.confidenceScore) || 0.85) * 100);

              return (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className={`bg-white border rounded-xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                    isP1 ? 'border-red-200 hover:border-red-400' : isP2 ? 'border-orange-200 hover:border-orange-400' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Left severity indicator border strip */}
                  <div
                    className={`absolute inset-y-0 left-0 w-1.5 ${
                      isP1 ? 'bg-red-600' : isP2 ? 'bg-orange-500' : 'bg-slate-400'
                    }`}
                  />

                  <div className="space-y-3.5 pl-1.5">
                    {/* Top Row: Code, Priority, Hazard */}
                    <div className="flex items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-900 rounded font-bold">
                          {inc.code}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 capitalize">
                          {getHazardIcon(inc.hazardType)}
                          <span>{inc.hazardType.replace('_', ' ')}</span>
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase shrink-0 ${
                          isP1
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isP2
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {inc.priority.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-sans font-bold text-sm text-slate-950 group-hover:text-blue-900 transition-colors line-clamp-1">
                        {inc.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-sans mt-1 line-clamp-2 leading-relaxed">
                        {inc.description || 'Field assessment and priority response coordination underway.'}
                      </p>
                    </div>

                    {/* Location & Casualties Strip */}
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs font-sans space-y-1.5">
                      <div className="flex items-center gap-1.5 text-slate-700 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{inc.location?.address || 'NCR Incident Sector'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span><strong className="font-mono text-slate-800">{inc.affectedPeopleEstimate || 0}</strong> Estimated Affected</span>
                        </span>
                        <span className="uppercase font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-mono">
                          {inc.status}
                        </span>
                      </div>
                    </div>

                    {/* AI Confidence Meter */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>AI Corroboration Metric</span>
                        <span className="font-bold text-slate-800">{confPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            confPct >= 80 ? 'bg-emerald-500' : confPct >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${confPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono pl-1.5">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(inc.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {onNavigateToMap && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToMap(inc);
                          }}
                          className="px-2 py-0.5 text-slate-500 hover:text-blue-600 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 text-[10px]"
                          title="Plot on Cartography Map"
                        >
                          <Navigation className="w-3 h-3 text-blue-600" />
                          <span>Map</span>
                        </button>
                      )}
                      <span className="text-slate-900 font-bold group-hover:text-blue-600 flex items-center gap-1 text-[11px]">
                        <span>Triage Deck</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* DENSE TABLE MODE */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="p-3">Code / ID</th>
                <th className="p-3">Title & Summary</th>
                <th className="p-3">Hazard</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Location</th>
                <th className="p-3">Confidence</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No incidents found matching query.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded">
                        {inc.code}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="font-bold text-slate-950 truncate font-syne">{inc.title}</div>
                      <div className="text-[11px] text-slate-500 truncate font-sans">{inc.description}</div>
                    </td>
                    <td className="p-3 capitalize text-slate-700 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        {getHazardIcon(inc.hazardType)}
                        <span>{inc.hazardType.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          inc.priority === 'P1_CRITICAL'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : inc.priority === 'P2_HIGH'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {inc.priority.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          inc.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : inc.status === 'verified'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-[200px] truncate">
                      {inc.location?.address || `${inc.location?.latitude?.toFixed(3)}, ${inc.location?.longitude?.toFixed(3)}`}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full"
                            style={{ width: `${Math.round((inc.confidenceScore || 0.8) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">
                          {Math.round((inc.confidenceScore || 0.8) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <span className="text-slate-400 group-hover:text-slate-900 inline-flex items-center space-x-1 font-bold">
                        <span>Triage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
