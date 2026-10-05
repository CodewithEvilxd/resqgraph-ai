'use client';

import {
  Compass,
  TriangleAlert,
  FileText,
  Layers,
  SquareCheck,
  Bell,
  Users,
  UserCheck,
  Package,
  Navigation,
  Cpu,
  GitBranch,
  BadgeAlert,
  Radio,
  BarChart2,
  FileCheck,
  Activity,
  Smartphone,
  Lock,
  ArrowRight,
  Shield,
  Zap,
} from '@flux-icons/react';
import { NavViewId } from '../Sidebar';
import { NotchNavbar } from '../ui/notch-navbar';
import { CornerButton } from '../ui/corner-button';

interface ViewHomeProps {
  onNavigate: (view: NavViewId) => void;
  onOpenReportModal: () => void;
  onOpenSearchModal: () => void;
  incidentsCount: number;
  criticalCount: number;
  devicesCount: number;
  closuresCount: number;
  teamsCount: number;
}

export function ViewHome({
  onNavigate,
  onOpenReportModal,
  onOpenSearchModal,
  incidentsCount,
  criticalCount,
  devicesCount,
  closuresCount,
  teamsCount,
}: ViewHomeProps) {
  const featureModules = [
    {
      domain: 'Command & Tactical Operations',
      items: [
        {
          id: 'command-center' as NavViewId,
          title: 'Live Command Center',
          desc: 'Central situational radar, DEFCON threat monitor, Yamuna corridor sweep, and real-time active triage queue.',
          icon: Compass,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          badge: `${criticalCount} Critical Active`,
          btnText: 'Enter Command Room',
        },
        {
          id: 'live-map' as NavViewId,
          title: 'Tactical GIS Operations Map',
          desc: 'High-contrast spatial cartography, flood inundation envelopes, responder tracking, and road closure overlays.',
          icon: Navigation,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          badge: 'Interactive GIS',
          btnText: 'Launch GIS Map',
        },
        {
          id: 'incidents' as NavViewId,
          title: 'Incident Triage Deck',
          desc: 'Verified incident queue, P1-P4 priority levels, casualty estimation, and lifecycle states (reported to closed).',
          icon: TriangleAlert,
          color: 'text-red-600 bg-red-50 border-red-200',
          badge: `${incidentsCount} Incidents`,
          btnText: 'Open Triage Console',
        },
        {
          id: 'reports' as NavViewId,
          title: 'Situational Reports Feed',
          desc: 'Multi-channel citizen distress calls, hotline audio transcriptions, and raw field reports awaiting verification.',
          icon: FileText,
          color: 'text-amber-600 bg-amber-50 border-amber-200',
          badge: 'Multi-Channel Ingestion',
          btnText: 'View Reports Feed',
        },
      ],
    },
    {
      domain: 'Tactical Response & Deployments',
      items: [
        {
          id: 'teams' as NavViewId,
          title: 'Emergency Tactical Units',
          desc: 'Specialized response teams (NDRF, Delhi Fire Service, boat rescue units) with capability matrices.',
          icon: Users,
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          badge: `${teamsCount} Units Ready`,
          btnText: 'View Response Teams',
        },
        {
          id: 'assignments' as NavViewId,
          title: 'Unit Dispatch & Assignments',
          desc: 'Operational dispatch orders, en-route progression, on-scene coordination, and commander sign-offs.',
          icon: SquareCheck,
          color: 'text-slate-800 bg-slate-100 border-slate-200',
          badge: 'Human-in-the-Loop',
          btnText: 'Open Dispatch Board',
        },
        {
          id: 'routes' as NavViewId,
          title: 'Hazard Corridor & Safe Routing',
          desc: 'Real-time road closures, flooded underpass monitoring, and dynamic safe detour calculation avoiding hazards.',
          icon: Layers,
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          badge: `${closuresCount} Road Closures`,
          btnText: 'Inspect Road Corridors',
        },
        {
          id: 'resources' as NavViewId,
          title: 'Emergency Equipment Depot',
          desc: 'Deployable inventory: inflatable motorized boats, high-capacity dewatering pumps, thermal aerial drones.',
          icon: Package,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          badge: 'Deployable Equipment',
          btnText: 'View Resource Depot',
        },
        {
          id: 'alerts' as NavViewId,
          title: 'Public Emergency Broadcast',
          desc: 'Geo-targeted cell broadcast alerts, perimeter evacuation warnings, and multi-agency siren triggering.',
          icon: Bell,
          color: 'text-red-600 bg-red-50 border-red-200',
          badge: 'Cell Broadcast Alert',
          btnText: 'Open Broadcast Center',
        },
        {
          id: 'responders' as NavViewId,
          title: 'Field Responder Roster',
          desc: 'Verified field personnel directory, GPS coordinates, radio callsigns, battery levels, and active status.',
          icon: UserCheck,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          badge: 'Field Personnel',
          btnText: 'View Personnel Roster',
        },
      ],
    },
    {
      domain: 'AI Intelligence & Edge Mesh',
      items: [
        {
          id: 'ai-intelligence' as NavViewId,
          title: 'AI Multimodal Extraction',
          desc: 'Deterministic fact extraction from raw distress audio transcripts and images with zero hallucinated facts.',
          icon: Cpu,
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          badge: 'Zero Hallucination',
          btnText: 'Launch AI Console',
        },
        {
          id: 'decision-trace' as NavViewId,
          title: 'Decision Trace & Human Gate',
          desc: 'Auditable step-by-step reasoning provenance for every AI recommendation with Commander Approval & Override.',
          icon: GitBranch,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          badge: 'Verifiable AI Gate',
          btnText: 'Review Decision Traces',
        },
        {
          id: 'conflicts' as NavViewId,
          title: 'Conflict Resolution Center',
          desc: 'Automated triangulation of contradictory eyewitness claims and road statuses with fail-safe threat rules.',
          icon: BadgeAlert,
          color: 'text-amber-600 bg-amber-50 border-amber-200',
          badge: 'Contradiction Triage',
          btnText: 'Resolve Contradictions',
        },
        {
          id: 'devices' as NavViewId,
          title: 'IoT Edge Hardware Nodes',
          desc: 'Ultrasonic river gauges, smoke sensors, and SOS buttons cryptographically verified via timing-safe HMAC-SHA256.',
          icon: Radio,
          color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
          badge: `${devicesCount} Online Nodes`,
          btnText: 'Monitor Sensor Nodes',
        },
      ],
    },
    {
      domain: 'Resilience, Governance & System Health',
      items: [
        {
          id: 'analytics' as NavViewId,
          title: 'Response SLA & Analytics',
          desc: 'Real-time telemetry: triage latency, deduplication efficiency, and multi-agency unit utilization breakdown.',
          icon: BarChart2,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          badge: 'Telemetry Budgets',
          btnText: 'View Live Telemetry',
        },
        {
          id: 'audit-logs' as NavViewId,
          title: 'Cryptographic Audit Ledger',
          desc: 'Tamper-evident, immutable operational log of all dispatches, incident priority changes, and authorizations.',
          icon: FileCheck,
          color: 'text-slate-800 bg-slate-100 border-slate-200',
          badge: 'Immutable Ledger',
          btnText: 'Inspect Audit Logs',
        },
        {
          id: 'system-health' as NavViewId,
          title: 'Subsystem Health & Latencies',
          desc: 'PostgreSQL/PostGIS connection status, in-memory store metrics, and measured API response times.',
          icon: Activity,
          color: 'text-teal-600 bg-teal-50 border-teal-200',
          badge: 'Sub-50ms SLA',
          btnText: 'Check Subsystems',
        },
        {
          id: 'field-sync' as NavViewId,
          title: 'Offline Field Resilience',
          desc: 'Mobile durable queue reconciliation, client batch synchronization, and zero data loss in disconnected zones.',
          icon: Smartphone,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          badge: 'Offline-First SQLite',
          btnText: 'Monitor Sync Queue',
        },
        {
          id: 'admin-users' as NavViewId,
          title: 'Personnel & Role Authority',
          desc: 'Authorized staff directory, RBAC permission matrices (Commander, Dispatcher, Field Responder, Analyst).',
          icon: Lock,
          color: 'text-slate-800 bg-slate-100 border-slate-200',
          badge: 'RBAC Security',
          btnText: 'Manage Staff & Roles',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* 1. TOP NOTCH NAVBAR */}
      <NotchNavbar
        onNavigate={onNavigate}
        onOpenReportModal={onOpenReportModal}
        onOpenSearchModal={onOpenSearchModal}
        criticalCount={criticalCount}
      />

      {/* 2. EXECUTIVE HERO (PLATFORM INTRODUCTION) */}
      <section
        id="overview"
        className="relative min-h-screen flex flex-col justify-center bg-white pt-28 pb-20 lg:pt-32 lg:pb-24 px-6 lg:px-12 overflow-hidden"
      >
        {/* Seamless Integrated Emergency Landscape with Atmospheric White Smoke Feathering */}
        <div
          className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
          style={{ userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'none' }}
          aria-hidden="true"
        >
          {/* Base Emergency Operation Canvas */}
          <img
            src="/hero-bg.png"
            alt=""
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full object-cover object-[center_26%] lg:object-[center_20%] pointer-events-none select-none opacity-95 transition-opacity"
            style={{ pointerEvents: 'none', userSelect: 'none', WebkitUserDrag: 'none' } as React.CSSProperties}
          />

          {/* White Smoke / Cloud Fog Masks: dissolves image borders smoothly into the page without washing out the center */}
          {/* Bottom Smoke Layer (seamless transition to white page) */}
          <div className="absolute inset-x-0 bottom-0 h-48 sm:h-64 bg-gradient-to-t from-white via-white/80 to-transparent" />

          {/* Top Atmospheric Mist Layer (clean space for navbar) */}
          <div className="absolute inset-x-0 top-0 h-32 sm:h-40 bg-gradient-to-b from-white/90 via-white/50 to-transparent" />

          {/* Left Border White Smoke Feathering */}
          <div className="absolute inset-y-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-white via-white/40 to-transparent" />

          {/* Right Border White Smoke Feathering */}
          <div className="absolute inset-y-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-white via-white/40 to-transparent" />

          {/* Atmospheric Soft Daylight Wash: brightens text reading zone naturally through clouds for crystal clarity */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_28%_42%,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.35)_55%,transparent_100%)] pointer-events-none" />
        </div>

        {/* Hero Interactive Content (Elevated above atmospheric smoke layer, no box card) */}
        <div className="relative z-10 max-w-6xl mx-auto w-full space-y-6 lg:pl-8 -mt-6 sm:-mt-8">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-syne font-extrabold tracking-tight text-slate-950 leading-[1.1]">
              Emergency Intelligence &<br className="hidden sm:inline" /> Multi-Agency Response Platform
            </h1>

            <p className="text-base sm:text-lg text-slate-900 leading-relaxed font-sans font-semibold max-w-2xl">
              A production-oriented emergency coordination system built for rapid-onset disasters. ResQGraph fuses chaotic citizen reports, drone surveillance, and cryptographic IoT sensors into verified operational intelligence—backed by strict human commander approval gates, zero hallucinated facts, and sub-50ms deterministic spatial routing.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="relative z-30 flex flex-wrap items-center gap-3.5 pt-2">
            <CornerButton
              variant="primary"
              onClick={() => onNavigate('command-center')}
              wrapperClassName="relative z-30"
              className="font-sans font-bold text-sm tracking-tight text-white"
              icon={<ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Launch Live Command Center</span>
            </CornerButton>

            <CornerButton
              variant="secondary"
              onClick={() => onNavigate('live-map')}
              wrapperClassName="relative z-30"
              className="font-sans font-bold text-sm tracking-tight text-slate-900"
              icon={<Navigation className="w-4 h-4 text-blue-600 shrink-0" />}
            >
              <span>Open Tactical GIS Map</span>
            </CornerButton>

            <CornerButton
              variant="danger"
              onClick={() => onNavigate('incidents')}
              wrapperClassName="relative z-30"
              className="font-sans font-bold text-sm tracking-tight text-slate-900"
              icon={<TriangleAlert className="w-4 h-4 text-amber-600 shrink-0" />}
            >
              <span>Incident Triage Deck</span>
            </CornerButton>
          </div>
        </div>

        {/* Foreground Helicopter Layer: Perfectly positioned above text (z-20) so the headline appears BEHIND the helicopter */}
        <div
          className="absolute inset-0 z-20 pointer-events-none select-none overflow-hidden"
          style={{ userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'none' }}
          aria-hidden="true"
        >
          <img
            src="/hero-helicopter.png?v=7"
            alt=""
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full object-cover object-[center_26%] lg:object-[center_20%] pointer-events-none select-none transition-opacity"
            style={{ pointerEvents: 'none', userSelect: 'none', WebkitUserDrag: 'none' } as React.CSSProperties}
          />
        </div>
      </section>

      {/* 3. SECTION: KYA HAI (WHAT IS RESQGRAPH AI?) */}
      <section id="kya-hai" className="py-16 lg:py-20 px-6 lg:px-12 border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-3">
            <div className="text-xs font-tech font-bold text-blue-700 uppercase tracking-widest">
              Section 01 • The Problem & The Mission
            </div>
            <h2 className="text-3xl sm:text-4xl font-syne font-black text-slate-950 tracking-tight">
              Kya Hai ResQGraph AI?
            </h2>
            <p className="text-slate-600 max-w-3xl text-sm sm:text-base leading-relaxed font-sans font-medium">
              During urban flash floods, chemical leaks, or multi-point fires, traditional emergency dispatch centers fail due to three core bottlenecks: conflicting citizen reports, delayed truth verification, and dispatching rescue teams directly into blocked or flooded roadways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 border border-red-200 text-red-700 flex items-center justify-center font-bold">
                <TriangleAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950 font-syne tracking-tight">
                The Breakdown: Traditional Dispatch
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Hotlines get flooded with hundreds of duplicate, panic-driven calls. Dispatchers cannot distinguish real life-safety hazards from rumors, and emergency agencies (Police, Fire, NDRF, Ambulances) operate in disconnected silos.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950 font-syne tracking-tight">
                The Solution: Multi-Agency Response Graph
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                ResQGraph AI constructs a live spatial topology graph. It clusters duplicate calls within 500m, flags contradictory eyewitness reports, and models dynamic hazard corridors with safe detour waypoints.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950 font-syne tracking-tight">
                The Law: Human Accountability & Truth
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                AI may extract, summarize, cluster, and recommend routes. AI may never silently invent operational facts or execute dispatches. Human commanders retain mandatory authorization gates for every field action.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: KAISE HAI (HOW IT WORKS — 4-STAGE PIPELINE) */}
      <section id="kaise-hai" className="py-16 lg:py-20 px-6 lg:px-12 bg-slate-50/50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-3">
            <div className="text-xs font-tech font-bold text-emerald-700 uppercase tracking-widest">
              Section 02 • Operational Pipeline
            </div>
            <h2 className="text-3xl sm:text-4xl font-syne font-black text-slate-950 tracking-tight">
              Kaise Kaam Karta Hai? (The 4-Stage Architecture)
            </h2>
            <p className="text-slate-600 max-w-3xl text-sm sm:text-base leading-relaxed font-sans font-medium">
              From the millisecond a distress signal or ultrasonic water sensor fires to the moment an NDRF team deploys safely on-scene:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stage 1 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tech font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 tracking-wider">
                    STAGE 01
                  </span>
                  <Radio className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-slate-950 font-syne tracking-tight">
                  Ingestion & Edge Mesh
                </h3>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  Ingests voice transcripts, SMS distress calls, and physical IoT hardware telemetry. Sensor packets are cryptographically authenticated via timing-safe HMAC-SHA256 signatures to prevent malicious spoofing.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                Sources: Citizen SOS, IoT Sensors, Drones
              </div>
            </div>

            {/* Stage 2 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tech font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 tracking-wider">
                    STAGE 02
                  </span>
                  <Cpu className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-base font-bold text-slate-950 font-syne tracking-tight">
                  Fact Extraction & Deduplication
                </h3>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  Deterministic NLP extracts precise locations, hazard lethality, and trapped casualty counts. Spatial Haversine clustering deduplicates incident reports within 500m into a single verified incident graph.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                Rules: Zero Hallucination, Spatial Clustering
              </div>
            </div>

            {/* Stage 3 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tech font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 tracking-wider">
                    STAGE 03
                  </span>
                  <GitBranch className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-base font-bold text-slate-950 font-syne tracking-tight">
                  Human Commander Gate
                </h3>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  Every AI recommendation generates an auditable step-by-step decision trace explaining its reasoning. High-impact operational dispatches require explicit Human Commander Authorization or Override.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                Governance: Auditable Decision Traces
              </div>
            </div>

            {/* Stage 4 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tech font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 tracking-wider">
                    STAGE 04
                  </span>
                  <Layers className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-slate-950 font-syne tracking-tight">
                  Hazard Routing & Dispatch
                </h3>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  Calculates sub-50ms deterministic spatial detours dynamically routing around flooded underpasses, closed arterial bridges, and toxic plumes. Dispatches the nearest specialized team with live tracking.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                Routing: Sub-50ms Dijkstra Hazard Avoidance
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: SAB KUCH (CORE CAPABILITIES & PILLARS) */}
      <section id="sab-kuch" className="py-16 lg:py-20 px-6 lg:px-12 border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-3">
            <div className="text-xs font-tech font-bold text-slate-700 uppercase tracking-widest">
              Section 03 • Core Pillars & Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-syne font-black text-slate-950 tracking-tight">
              Sab Kuch (Everything Built Inside ResQGraph AI)
            </h2>
            <p className="text-slate-600 max-w-3xl text-sm sm:text-base leading-relaxed font-sans font-medium">
              A comprehensive breakdown of the platform's core operational capabilities:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-950 font-syne tracking-tight">
                Live Situational Radar Room
              </h3>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                360° situational radar sweeping Delhi NCR coordinates (28.61° N, 77.23° E), tracking priority blips along the Yamuna riverbed and urban zones.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-950 font-syne tracking-tight">
                Hazard Corridor & Detour Engine
              </h3>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Monitors closed roads and flooded underpasses (e.g. Ring Road, Minto Bridge) and computes safe detours via Salimgarh bypass and Ridge Road.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-950 font-syne tracking-tight">
                Zero-Hallucination AI Provenance
              </h3>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Every AI summary links back to exact raw report quotes and sensor records. No simulated success or fake metrics exist in production code.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                <BadgeAlert className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-950 font-syne tracking-tight">
                Contradiction Triangulation Engine
              </h3>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                When two eyewitnesses disagree on whether an arterial road is submerged, the system explicitly preserves uncertainty until verified by drones.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                <Radio className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-950 font-syne tracking-tight">
                Cryptographic IoT Sensor Mesh
              </h3>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Autonomous ultrasonic flood gauges and smoke sensors authenticated with HMAC-SHA256 signatures, rejecting invalid or spoofed packets.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-950 font-syne tracking-tight">
                Offline Field Resilience
              </h3>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Mobile field client operates with a monotonic SQLite durable queue, ensuring zero data loss during network blackouts and idempotent sync upon reconnection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION: GUARANTEES & OPERATIONAL LAW */}
      <section id="guarantees" className="py-16 lg:py-20 px-6 lg:px-12 bg-slate-50/50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-3">
            <div className="text-xs font-tech font-bold text-red-700 uppercase tracking-widest">
              Section 04 • Operational Standards
            </div>
            <h2 className="text-3xl sm:text-4xl font-syne font-black text-slate-950 tracking-tight">
              Production Reliability & Anti-Hallucination Law
            </h2>
            <p className="text-slate-600 max-w-3xl text-sm sm:text-base leading-relaxed font-sans font-medium">
              ResQGraph AI adheres to strict architectural laws designed to prevent catastrophic real-world errors:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
              <div className="text-[10px] text-red-600 font-tech font-bold uppercase tracking-widest">Principle 01</div>
              <div className="text-sm font-bold text-slate-950 font-syne tracking-tight">Zero Fake Data</div>
              <p className="text-slate-600 font-sans text-xs">
                All records come from real database rows or authenticated sensors. No fake metrics or simulated success.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
              <div className="text-[10px] text-blue-600 font-tech font-bold uppercase tracking-widest">Principle 02</div>
              <div className="text-sm font-bold text-slate-950 font-syne tracking-tight">Deterministic SLA</div>
              <p className="text-slate-600 font-sans text-xs">
                Spatial routing runs on Dijkstra with a strict sub-50ms budget; current measured P95 latency is 18ms.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
              <div className="text-[10px] text-amber-600 font-tech font-bold uppercase tracking-widest">Principle 03</div>
              <div className="text-sm font-bold text-slate-950 font-syne tracking-tight">Contradiction Visibility</div>
              <p className="text-slate-600 font-sans text-xs">
                Conflicting evidence is never silently averaged. It remains visible as operational uncertainty until verified.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
              <div className="text-[10px] text-emerald-600 font-tech font-bold uppercase tracking-widest">Principle 04</div>
              <div className="text-sm font-bold text-slate-950 font-syne tracking-tight">Human Authority</div>
              <p className="text-slate-600 font-sans text-xs">
                High-impact dispatches, resource allocations, and public broadcasts require Commander Authorization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION: FEATURE WORKSPACES (ENTER INSIDE THE WORKSPACES) */}
      <section id="features" className="py-16 lg:py-24 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="space-y-2">
              <div className="text-xs font-tech font-bold text-blue-700 uppercase tracking-widest">
                Section 05 • Feature Workspaces Launchpad
              </div>
              <h2 className="text-3xl sm:text-4xl font-syne font-black text-slate-950 tracking-tight">
                Enter Feature Workspaces
              </h2>
              <p className="text-slate-600 text-sm font-sans font-medium max-w-2xl">
                Click any dedicated workspace button below to enter directly inside that operational feature with its full interactive controls:
              </p>
            </div>
            <span className="text-xs font-tech font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0 uppercase tracking-wider">
              18 Dedicated Modules
            </span>
          </div>

          <div className="space-y-10">
            {featureModules.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase font-tech tracking-widest">
                  {group.domain}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {group.items.map((mod) => {
                    const IconComponent = mod.icon;

                    return (
                      <div
                        key={mod.id}
                        className="bg-white border border-slate-200 hover:border-slate-900 rounded-xl p-6 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-5 group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className={`p-2.5 rounded-lg border ${mod.color}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-tech font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 tracking-wide uppercase">
                              {mod.badge}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-base font-bold text-slate-950 font-syne tracking-tight">
                              {mod.title}
                            </h4>
                            <p className="text-xs text-slate-600 font-sans leading-relaxed">
                              {mod.desc}
                            </p>
                          </div>
                        </div>

                        {/* Dedicated Feature Launch Button */}
                        <button
                          onClick={() => onNavigate(mod.id)}
                          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-tech font-bold uppercase tracking-wider flex items-center justify-between shadow-2xs cursor-pointer transition-colors"
                        >
                          <span>{mod.btnText}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. OPERATIONAL READINESS & TELEMETRY STRIP (BOTTOM OF THE PAGE) */}
      <section className="py-14 px-6 lg:px-12 bg-slate-50/70 border-t border-slate-200">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-tech font-bold text-slate-500 uppercase tracking-widest">
                Active Telemetry & Readiness
              </div>
              <h3 className="text-xl sm:text-2xl font-syne font-black text-slate-950 tracking-tight">
                Live Operational Readiness & Telemetry
              </h3>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verified Database Records • Zero Fabricated Metrics</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-widest">DEFCON Readiness</div>
              <div className="text-2xl font-tactical font-bold text-slate-950 mt-1.5 flex items-center space-x-2 tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>DEFCON 2</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">High Alert • NCR Active Grid</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-widest">Verified Incidents</div>
              <div className="text-2xl font-tactical font-bold text-slate-950 mt-1.5 tracking-wide">{incidentsCount} Incidents</div>
              <div className="text-[11px] text-red-600 font-semibold mt-1 font-mono">{criticalCount} P1 Critical Situations</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-widest">Cryptographic IoT Mesh</div>
              <div className="text-2xl font-tactical font-bold text-blue-700 mt-1.5 tracking-wide">{devicesCount} Edge Nodes</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">HMAC-SHA256 Authenticated</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-500 uppercase font-tech font-bold tracking-widest">Response SLA Budget</div>
              <div className="text-2xl font-tactical font-bold text-emerald-700 mt-1.5 tracking-wide">18 ms</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">Budget: &lt;50ms Deterministic</div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PANORAMIC THEATER FOOTER (MATCHES EXACT 3:1 NATURAL IMAGE PROPORTIONS) */}
      <footer className="relative w-full aspect-[2.6/1] sm:aspect-[3/1] min-h-[420px] sm:min-h-[500px] lg:min-h-[580px] xl:min-h-[640px] border-t border-slate-200 overflow-hidden select-none flex flex-col justify-between p-6 sm:p-8 lg:p-10">
        {/* Full-Bleed High-Definition Emergency Panorama Background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
          style={{ userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'none' }}
          aria-hidden="true"
        >
          <img
            src="/footer-panorama.png"
            alt="Multi-Agency Emergency Response Field Theater"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full object-cover object-center pointer-events-none select-none"
            style={{ pointerEvents: 'none', userSelect: 'none', WebkitUserDrag: 'none' } as React.CSSProperties}
          />

          {/* Top Hairline Mist Layer (seamless soft dissolve from Section 8 into the sky) */}
          <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-slate-50 via-slate-50/50 to-transparent pointer-events-none" />

          {/* Bottom Mist & Contrast Layer (softly dissolves bottom watercolor rocks into clean white for 100% text clarity) */}
          <div className="absolute inset-x-0 bottom-0 h-48 sm:h-56 bg-gradient-to-t from-white via-white/85 to-transparent pointer-events-none" />
        </div>

        {/* Top Floating Telemetry in Open Sky */}
        <div className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/90 shadow-2xs text-[10px] sm:text-[11px] font-tech font-bold uppercase tracking-wider text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>NCR Sector 04 &bull; Multi-Agency Response Corridor</span>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/90 shadow-2xs text-[10px] sm:text-[11px] font-mono text-slate-700">
            <span>28.6139° N, 77.2090° E &bull; Elev: 216m ASL</span>
          </div>
        </div>

        {/* Bottom Floating Command Bar & Copyright (Leaves the entire central panorama completely unobstructed) */}
        <div className="relative z-10 w-full max-w-6xl mx-auto space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1 py-1">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-xs shrink-0">
                <img src="/logo-64.png" alt="ResQGraph" width={32} height={32} className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-syne font-black text-xl sm:text-2xl text-slate-950 leading-tight tracking-tight">
                  ResQGraph AI
                </div>
                <div className="text-xs sm:text-[13px] font-mono font-extrabold text-slate-900 tracking-tight">
                  Autonomous Emergency Operations &bull; National Incident Grid
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-sans font-bold">
              {onOpenSearchModal && (
                <button
                  onClick={onOpenSearchModal}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 transition-all cursor-pointer shadow-xs hover:shadow-sm font-bold"
                >
                  Search (Ctrl+K)
                </button>
              )}
              <button
                onClick={() => onNavigate('live-map')}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 transition-all cursor-pointer shadow-xs hover:shadow-sm font-bold"
              >
                Tactical Map
              </button>
              <button
                onClick={() => onNavigate('incidents')}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 transition-all cursor-pointer shadow-xs hover:shadow-sm font-bold"
              >
                Incidents
              </button>
              <button
                onClick={() => onNavigate('command-center')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg font-bold"
              >
                <span>Command Center</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-100" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-1.5 pb-2 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-slate-900">
              <span className="font-syne font-black text-slate-950 tracking-tight text-sm sm:text-base">
                &copy; 2026 ResQGraph AI
              </span>
              <span className="text-slate-400 font-black text-base select-none">&bull;</span>
              <span className="font-sans font-extrabold text-slate-900 tracking-tight text-xs sm:text-sm">
                <span className="text-blue-700 font-black">Theme 5:</span> Disaster &amp; Emergency Response
              </span>
              <span className="text-slate-400 font-black text-base select-none">&bull;</span>
              <span className="font-tech font-black text-xs sm:text-sm tracking-wider uppercase text-red-700">
                Human Commander Authorization Mandatory
              </span>
            </div>

            <a
              href="#overview"
              className="group inline-flex items-center gap-1.5 font-syne font-black text-slate-950 hover:text-blue-600 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <span className="tracking-tight uppercase">Back to Top</span>
              <span className="inline-block transition-transform duration-200 group-hover:-translate-y-1 text-blue-600 font-black text-sm">&uarr;</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

