'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  CircleCheck,
  Shield,
  Activity,
  Droplet,
  Flame,
  Radio,
} from '@flux-icons/react';

interface ViewTeamsProps {
  teams: any[];
}

export function ViewTeams({ teams: initialTeams }: ViewTeamsProps) {
  const defaultTeams = [
    {
      id: 'team-01',
      name: 'NDRF Rapid Water Rescue Unit Alpha',
      category: 'water_rescue',
      memberCount: 8,
      status: 'deployed',
      base: 'Okhla Relief Staging Hub',
      leadOfficer: 'Inspector R. K. Verma',
      capabilities: ['motorized_inflatable_boat', 'swiftwater_swimmer', 'dewatering_pump_high_cap', 'trauma_first_responder'],
      equipment: '2x Zodiac Inflatable Boats, 4x 1500L/min Dewatering Pumps',
      assignedIncident: 'Kashmere Gate Submersion',
    },
    {
      id: 'team-02',
      name: 'Delhi Fire Service HazMat Tender 07',
      category: 'fire_hazmat',
      memberCount: 6,
      status: 'deployed',
      base: 'Connaught Place Fire Station',
      leadOfficer: 'Divisional Officer S. Sharma',
      capabilities: ['chemical_foam_suppression', 'toxic_gas_scrubbing', 'thermal_perimeter_scan', 'heavy_extrication'],
      equipment: '1x HazMat Tender (Foam-7), High-Volume Water Cannon',
      assignedIncident: 'Mayur Vihar Substation Fire',
    },
    {
      id: 'team-03',
      name: 'Civil Defense Drone Recon Squad Beta',
      category: 'recon_drone',
      memberCount: 4,
      status: 'available',
      base: 'ITO Emergency Operations Center',
      leadOfficer: 'Tech Officer A. Sengupta',
      capabilities: ['4k_flir_thermal_recon', 'spatial_orthophoto_mapping', 'mesh_packet_relay', 'night_vision_search'],
      equipment: '3x Matrice 300 RTK Drones, Dual FLIR H20T Thermal Payloads',
      assignedIncident: null,
    },
    {
      id: 'team-04',
      name: 'AIIMS Mobile Trauma & Mass Casualty Unit 02',
      category: 'medical_trauma',
      memberCount: 5,
      status: 'available',
      base: 'AIIMS Trauma Center Cordon Bay',
      leadOfficer: 'Dr. Priya Nair (Lead Surgeon)',
      capabilities: ['mobile_triage_bay', 'advanced_life_support', 'mass_casualty_stabilization', 'tele_telemetry'],
      equipment: '1x Custom Mobile Surgical Vehicle, 6x Critical Care Stretchers',
      assignedIncident: null,
    },
  ];

  const [teams, setTeams] = useState<any[]>(
    initialTeams && initialTeams.length > 0 ? initialTeams : defaultTeams
  );
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    if (initialTeams && initialTeams.length > 0) {
      setTeams(initialTeams);
    }
  }, [initialTeams]);

  const filtered = teams.filter((t) => {
    if (filterCategory === 'ALL') return true;
    return t.category === filterCategory;
  });

  const availableCount = teams.filter((t) => t.status === 'available').length;
  const deployedCount = teams.filter((t) => t.status === 'deployed').length;
  const totalPersonnel = teams.reduce((acc, t) => acc + (t.memberCount || 4), 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'water_rescue':
        return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'fire_hazmat':
        return <Flame className="w-4 h-4 text-orange-600" />;
      case 'recon_drone':
        return <Radio className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* 1. STATS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Total Tactical Units
            </span>
            <Shield className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-tactical text-slate-950 mt-1 tracking-wide">
            {teams.length} <span className="text-xs font-mono font-normal text-slate-500">teams</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-sans">
            Multi-agency disaster matrix
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Available for Dispatch
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-tactical text-emerald-700 mt-1 tracking-wide">
            {availableCount} <span className="text-xs font-mono font-normal text-emerald-600">ready</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Staged in response hubs
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Active Engagements
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-tactical text-blue-700 mt-1 tracking-wide">
            {deployedCount} <span className="text-xs font-mono font-normal text-blue-600">deployed</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-sans">
            Operating in incident cordons
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-wider">
              Field Personnel
            </span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-tactical text-slate-950 mt-1 tracking-wide">
            {totalPersonnel} <span className="text-xs font-mono font-normal text-slate-500">officers</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Trained tactical responders
          </div>
        </div>
      </div>

      {/* 2. COMMAND HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-2xs font-sans">
        <div>
          <h2 className="text-base font-bold text-slate-950 font-mono flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>DISASTER RESPONSE TACTICAL UNITS DIRECTORY</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Specialized multi-agency response teams (NDRF, Delhi Fire Service, Medical Trauma, Civil Defense Drone Squads)
          </p>
        </div>

        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Agency Interoperability: Level 1
        </span>
      </div>

      {/* 3. CATEGORY TABS */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 border border-slate-200 rounded-xl shadow-2xs text-xs font-mono">
        <span className="text-slate-400 text-[11px]">Specialization:</span>
        {[
          { id: 'ALL', label: `All Units (${teams.length})` },
          { id: 'water_rescue', label: 'Flood & Water Rescue' },
          { id: 'fire_hazmat', label: 'Fire & HazMat' },
          { id: 'recon_drone', label: 'Aerial Recon & FLIR' },
          { id: 'medical_trauma', label: 'Medical Trauma' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
              filterCategory === cat.id
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 4. TEAMS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => {
          const isDeployed = t.status === 'deployed';

          return (
            <div
              key={t.id}
              className={`bg-white border rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between transition-all ${
                isDeployed ? 'border-blue-200 hover:border-blue-300' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3.5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                      {getCategoryIcon(t.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-950 font-syne text-sm">{t.name}</h3>
                      <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                        Lead: {t.leadOfficer}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                      isDeployed
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Crew Size:</span>
                    <span className="font-bold text-slate-900 text-[11px]">{t.memberCount} Certified Personnel</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Staging Base:</span>
                    <span className="font-bold text-slate-900 text-[11px] truncate block">{t.base}</span>
                  </div>
                </div>

                {/* Primary Gear & Equipment */}
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Equipment:</span>
                  <p className="text-slate-800 font-sans text-xs">{t.equipment}</p>
                </div>

                {/* Capabilities Chips */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Certified Capabilities:</span>
                  <div className="flex flex-wrap gap-1">
                    {(t.capabilities || []).map((cap: string) => (
                      <span
                        key={cap}
                        className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium"
                      >
                        {cap.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.assignedIncident ? `Active: ${t.assignedIncident}` : 'Standing By for Dispatch'}</span>
                </span>

                <span className="text-emerald-700 font-bold flex items-center space-x-1">
                  <CircleCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>GPS Telemetry Active</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
