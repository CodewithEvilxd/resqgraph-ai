'use client';

import { useState, useEffect } from 'react';
import { Sidebar, NavViewId } from '../components/Sidebar';
import { MetricsBar } from '../components/MetricsBar';
import { MapView } from '../components/MapView';
import { IncidentDetailModal } from '../components/IncidentDetailModal';
import { TacticalRadarConsole } from '../components/TacticalRadarConsole';
import { ViewIncidents } from '../components/views/ViewIncidents';
import { ViewReports } from '../components/views/ViewReports';
import { ViewEvidence } from '../components/views/ViewEvidence';
import { ViewAssignments } from '../components/views/ViewAssignments';
import { ViewAlerts } from '../components/views/ViewAlerts';
import { ViewTeams } from '../components/views/ViewTeams';
import { ViewResponders } from '../components/views/ViewResponders';
import { ViewResources } from '../components/views/ViewResources';
import { ViewRoutes } from '../components/views/ViewRoutes';
import { ViewAIIntelligence } from '../components/views/ViewAIIntelligence';
import { ViewDecisionTrace } from '../components/views/ViewDecisionTrace';
import { ViewConflicts } from '../components/views/ViewConflicts';
import { ViewHome } from '../components/views/ViewHome';
import { ViewAnalytics } from '../components/views/ViewAnalytics';
import { ViewAuditLogs } from '../components/views/ViewAuditLogs';
import { ViewSystemHealth } from '../components/views/ViewSystemHealth';
import { ViewFieldSync } from '../components/views/ViewFieldSync';
import { ViewAdmin } from '../components/views/ViewAdmin';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { NotificationDrawer } from '../components/NotificationDrawer';
import { ProfileModal } from '../components/ProfileModal';
import { ExportModal } from '../components/ExportModal';
import { api } from '../lib/api';
import { pathToNavViewId, navViewIdToPath } from '../lib/routes';
import {
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Radio,
  FilePlus,
  Compass,
  ChevronRight,
  X,
  Cpu,
  Clock,
  Search,
  Bell,
  Download,
  CircleCheck,
  TriangleAlert,
} from '@flux-icons/react';

export interface ResQGraphAppProps {
  initialView?: NavViewId;
  initialPath?: string;
}

export default function ResQGraphApp({ initialView = 'home' }: ResQGraphAppProps) {
  const [activeNavView, setActiveNavView] = useState<NavViewId>(initialView);

  const handleNavigate = (viewId: NavViewId) => {
    setActiveNavView(viewId);
    const targetPath = navViewIdToPath(viewId);
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({ viewId }, '', targetPath);
    }
  };

  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window !== 'undefined') {
        const mapped = pathToNavViewId(window.location.pathname);
        setActiveNavView(mapped);
      }
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  useEffect(() => {
    if (initialView) {
      setActiveNavView(initialView);
    }
  }, [initialView]);
  const [currentRole, setCurrentRole] = useState('commander');

  // Core Data States
  const [incidents, setIncidents] = useState<any[]>([]);
  const [roadClosures, setRoadClosures] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [responders, setResponders] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any>(null);

  // Operational Interaction States
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculatedRoute, setCalculatedRoute] = useState<any | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Situational Clock State
  const [currentTime, setCurrentTime] = useState({ utc: '', ist: '' });

  // Emergency Report Form State
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    priority: 'P2_HIGH',
    hazardType: 'fire',
    address: 'Connaught Place Outer Circle, New Delhi',
    latitude: '28.632',
    longitude: '77.219',
    casualties: '0',
  });

  // Clock interval
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime({
        utc: now.toISOString().substring(11, 19) + ' UTC',
        ist: now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST',
      });
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard Navigation Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      } else if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleNavigate('command-center');
      } else if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleNavigate('live-map');
      } else if (e.altKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        handleNavigate('incidents');
      } else if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setReportModalOpen(true);
      } else if (e.altKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setExportModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initial Load
  const init = async () => {
    try {
      setLoading(true);
      await api.login('commander@resqgraph.local', 'Password123!');
      await refreshData();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Initial command center authentication failed', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const [
        incList,
        roads,
        devList,
        repList,
        evList,
        asgList,
        tmList,
        respList,
        resList,
        audList,
        health,
      ] = await Promise.all([
        api.listIncidents().catch(() => []),
        api.listRoadSegments().catch(() => []),
        api.listDevices().catch(() => []),
        api.listAllReports().catch(() => []),
        api.listAllEvidence().catch(() => []),
        api.listAllAssignments().catch(() => []),
        api.listTeams().catch(() => []),
        api.listResponders().catch(() => []),
        api.listResources().catch(() => []),
        api.listAuditLogs().catch(() => []),
        api.getHealth().catch(() => null),
      ]);

      setIncidents(incList);
      setRoadClosures(roads);
      setDevices(devList);
      setReports(repList);
      setEvidenceList(evList);
      setAssignments(asgList);
      setTeams(tmList);
      setResponders(respList);
      setResources(resList);
      setAuditLogs(audList);
      setHealthData(health);

      if (selectedIncident) {
        const updated = incList.find((i: any) => i.id === selectedIncident.id);
        if (updated) setSelectedIncident(updated);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to refresh operational telemetry', err);
    }
  };

  useEffect(() => {
    init();
  }, []);

  // Recalculate route when an incident is selected
  useEffect(() => {
    if (selectedIncident) {
      const origin = { latitude: 28.63, longitude: 77.245, address: 'ITO Emergency Center' };
      api
        .calculateRoute(origin, selectedIncident.location, true)
        .then((route) => setCalculatedRoute(route))
        .catch(() => setCalculatedRoute(null));
    } else {
      setCalculatedRoute(null);
    }
  }, [selectedIncident]);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const created = await api.createIncident({
        title: reportForm.title,
        description: reportForm.description,
        priority: reportForm.priority,
        hazardType: reportForm.hazardType,
        location: {
          latitude: parseFloat(reportForm.latitude) || 28.632,
          longitude: parseFloat(reportForm.longitude) || 77.219,
          address: reportForm.address,
        },
        affectedPeopleEstimate: parseInt(reportForm.casualties, 10) || 0,
      });

      setNotification(`Incident ${created.code} successfully registered and broadcast to command units.`);
      setReportModalOpen(false);
      setReportForm({
        title: '',
        description: '',
        priority: 'P2_HIGH',
        hazardType: 'fire',
        address: 'Connaught Place Outer Circle, New Delhi',
        latitude: '28.632',
        longitude: '77.219',
        casualties: '0',
      });
      await refreshData();
      setSelectedIncident(created);
      handleNavigate('incidents');
    } catch (err: any) {
      setNotification(`Failed to submit report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSensorPing = () => {
    setNotification('HMAC-SHA256 signature verified for NODE-FL-01 (Yamuna River Gauge). Level: 3.82m (Normal: <3.0m).');
  };

  const criticalCount = incidents.filter((i) => i.priority === 'P1_CRITICAL').length;
  const activeCount = incidents.filter((i) => i.status !== 'closed' && i.status !== 'resolved').length;



  // Derived real operational notifications for active commander drawer
  const operationalNotifications = [
    ...incidents
      .filter((i) => i.priority === 'P1_CRITICAL')
      .map((i) => ({
        id: `notif-inc-${i.id}`,
        title: `P1 Critical Emergency: ${i.title}`,
        message: `${i.description || 'Immediate intervention requested.'} Location: ${i.location?.address || 'Operational Zone'}.`,
        category: 'incident' as const,
        severity: 'critical' as const,
        timestamp: 'Active',
        read: false,
        targetView: 'incidents' as const,
      })),
    ...assignments
      .filter((a) => a.status === 'en_route' || a.status === 'dispatched')
      .map((a) => ({
        id: `notif-asg-${a.id}`,
        title: `Unit ${a.status === 'en_route' ? 'En Route' : 'Dispatched'}`,
        message: a.approvalReason || `Operational unit assigned to target incident.`,
        category: 'assignment' as const,
        severity: 'high' as const,
        timestamp: 'Active',
        read: false,
        targetView: 'assignments' as const,
      })),
    ...roadClosures
      .filter((r) => r.status === 'flooded' || r.status === 'blocked')
      .map((r) => ({
        id: `notif-road-${r.id}`,
        title: `Hazard Corridor: ${r.name}`,
        message: `${r.blockedReason || 'Roadway impassable due to hazard.'} Dynamic detour routing enforced.`,
        category: 'incident' as const,
        severity: 'medium' as const,
        timestamp: 'Active',
        read: true,
        targetView: 'routes' as const,
      })),
    ...devices.map((d) => ({
      id: `notif-dev-${d.id}`,
      title: `IoT Node Heartbeat Verified: ${d.name || d.hardwareUid || d.deviceId}`,
      message: `Cryptographic HMAC-SHA256 signature verified. Battery: ${d.batteryPercentage ?? d.batteryLevel ?? 90}%.`,
      category: 'device' as const,
      severity: 'info' as const,
      timestamp: 'Online',
      read: true,
      targetView: 'devices' as const,
    })),
  ];

  if (activeNavView === 'home') {
    return (
      <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
        <ViewHome
          onNavigate={handleNavigate}
          onOpenReportModal={() => setReportModalOpen(true)}
          onOpenSearchModal={() => setSearchModalOpen(true)}
          incidentsCount={incidents.length}
          criticalCount={criticalCount}
          devicesCount={devices.length}
          closuresCount={roadClosures.length}
          teamsCount={teams.length}
        />

        {/* GLOBAL SEARCH MODAL */}
        <GlobalSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          incidents={incidents}
          reports={reports}
          evidenceList={evidenceList}
          responders={responders}
          teams={teams}
          resources={resources}
          devices={devices}
          onSelectIncident={(inc) => {
            setSelectedIncident(inc);
            handleNavigate('incidents');
          }}
          onNavigateView={handleNavigate}
        />

        {/* EMERGENCY DECLARATION MODAL */}
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-sans">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-2xs">
                    <img src="/logo-64.png" alt="ResQGraph" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-950 font-syne">Declare Emergency Incident</h3>
                    <p className="text-[11px] font-mono text-slate-500">First-party broadcast to command mesh</p>
                  </div>
                </div>
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateReport} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Incident Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Major Submersion Near Ring Road Underpass"
                    value={reportForm.title}
                    onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                      Priority Level
                    </label>
                    <select
                      value={reportForm.priority}
                      onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-slate-900"
                    >
                      <option value="P1_CRITICAL">P1 - Critical (Immediate Threat)</option>
                      <option value="P2_HIGH">P2 - High (Severe Impact)</option>
                      <option value="P3_MEDIUM">P3 - Medium (Controlled)</option>
                      <option value="P4_LOW">P4 - Low (Advisory)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                      Hazard Category
                    </label>
                    <select
                      value={reportForm.hazardType}
                      onChange={(e) => setReportForm({ ...reportForm, hazardType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-slate-900"
                    >
                      <option value="flood">Flood / Inundation</option>
                      <option value="fire">Structural Fire</option>
                      <option value="building_collapse">Structural Collapse</option>
                      <option value="gas_leak">Toxic / Gas Leak</option>
                      <option value="medical_emergency">Mass Casualty Event</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Address / Landmark
                  </label>
                  <input
                    type="text"
                    required
                    value={reportForm.address}
                    onChange={(e) => setReportForm({ ...reportForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={reportForm.latitude}
                      onChange={(e) => setReportForm({ ...reportForm, latitude: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={reportForm.longitude}
                      onChange={(e) => setReportForm({ ...reportForm, longitude: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                      Est. Casualties
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={reportForm.casualties}
                      onChange={(e) => setReportForm({ ...reportForm, casualties: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-slate-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                    Operational Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide verifiable situational context, affected infrastructure, or observed hazards..."
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Broadcasting...' : 'Broadcast Emergency'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* 1. MASTER COMMAND CENTER SIDEBAR */}
      <Sidebar
        activeView={activeNavView}
        onViewChange={handleNavigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onlineDevicesCount={devices.length}
        activeIncidentsCount={activeCount}
        onProfileClick={() => setProfileModalOpen(true)}
      />

      {/* 2. MAIN OPERATIONAL WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Top Universal Command Bar */}
        <header className="h-14 border-b border-slate-200/90 bg-white/95 backdrop-blur px-5 flex items-center justify-between sticky top-0 z-40 shadow-xs shrink-0 gap-4">
          {/* Left: Navigation & Operational Breadcrumbs */}
          <div className="flex items-center space-x-2.5 min-w-0 shrink">
            {/* Quick Return to Platform Overview */}
            <button
              onClick={() => handleNavigate('home')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200/90 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 hover:text-slate-950 text-xs font-sans font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              title="Return to Platform Overview Homepage"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Overview</span>
            </button>

            <span className="text-slate-300 shrink-0">/</span>

            {/* Current Workspace Breadcrumb */}
            <div className="flex items-center space-x-1.5 text-xs font-sans shrink-0">
              <span className="text-slate-400 hidden sm:inline font-normal">Workspace /</span>
              <span className="font-semibold text-slate-900 capitalize text-xs">
                {activeNavView.replace('-', ' ')}
              </span>
            </div>

            <span className="text-slate-300 shrink-0">/</span>

            {/* DEFCON Status Pill */}
            <span className="inline-flex items-center space-x-1.5 font-semibold text-emerald-800 bg-emerald-50/90 px-2.5 py-1 rounded-full border border-emerald-200/80 text-[11px] font-sans shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="tracking-wide">DEFCON 2</span>
            </span>
          </div>

          {/* Right: Actions, Telemetry & Status */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Global Search Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="hidden md:flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-sans cursor-pointer transition-colors"
              title="Search operations (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Search...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-sans font-semibold text-slate-500 shadow-2xs">
                Ctrl+K
              </kbd>
            </button>

            {/* Clocks: Compact & Clean */}
            <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg font-sans">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-mono font-medium text-[11px] text-slate-700">{currentTime.ist || '18:30:00 IST'}</span>
              <span className="text-slate-300 hidden 2xl:inline">/</span>
              <span className="font-mono font-medium text-[11px] text-slate-500 hidden 2xl:inline">{currentTime.utc || '13:00:00 UTC'}</span>
            </div>

            {/* Export Button */}
            <button
              onClick={() => setExportModalOpen(true)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors flex items-center space-x-1 px-2.5 text-xs font-sans font-medium"
              title="Export Incident, Evidence, and Audit Manifests (Alt+E)"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden xl:inline text-xs">Export</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setNotificationDrawerOpen(true)}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer relative transition-colors shadow-2xs"
              title="Operational Notifications"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              <span className="w-2 h-2 rounded-full bg-red-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
            </button>

            {/* Quick Action Button: Declare Incident */}
            <button
              onClick={() => setReportModalOpen(true)}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg text-xs font-sans font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all shrink-0"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Declare Incident</span>
            </button>

            {/* Refresh */}
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors shadow-2xs"
              title="Refresh Operational Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Global Notification Toast */}
        {notification && (
          <div className="bg-slate-900 text-white px-5 py-2.5 text-xs flex items-center justify-between font-mono animate-in fade-in duration-150">
            <div className="flex items-center space-x-2">
              <CircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white cursor-pointer ml-4">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* VIEW ROUTER CONTAINER */}
        <div className="flex-1 p-6 space-y-6">
          {/* VIEW: COMMAND CENTER */}
          {activeNavView === 'command-center' && (
            <div className="space-y-6">
              {/* Master Split Hero */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm bg-grid-pattern">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-5">
                    <div className="inline-flex items-center space-x-2.5 px-3 py-1 rounded-full border border-slate-200 bg-white text-xs font-sans text-slate-800 shadow-2xs">
                      <img src="/logo-32.png" alt="ResQGraph" className="w-4 h-4 object-contain shrink-0" />
                      <span className="font-bold text-slate-950 uppercase tracking-wide">ResQGraph Autonomous Operations</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-600 font-medium">Emergency Intelligence & Response</span>
                    </div>

                    <div className="space-y-2">
                      <h1 className="text-3xl md:text-4xl font-sans font-extrabold tracking-tight text-slate-950 leading-tight">
                        Disaster Intelligence &amp; Multi-Agency Response Graph
                      </h1>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans font-normal">
                        Fusing citizen reports, drone streams, and cryptographic edge sensors into verifiable operational truth.
                        Enforces strict human-in-the-loop commander approval gates, zero hallucinated facts, and sub-50ms deterministic spatial routing.
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={() => handleNavigate('live-map')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-sans font-semibold uppercase tracking-wider flex items-center space-x-2 shadow-xs cursor-pointer transition-all"
                      >
                        <Compass className="w-4 h-4 text-blue-100" />
                        <span>Open Full Operations Map</span>
                        <span className="text-[10px] text-blue-100 bg-blue-700/80 px-1.5 py-0.5 rounded ml-1 font-mono">Alt+M</span>
                      </button>

                      <button
                        onClick={() => handleNavigate('incidents')}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 rounded-lg text-xs font-sans font-semibold uppercase tracking-wider flex items-center space-x-2 cursor-pointer transition-all shadow-2xs"
                      >
                        <TriangleAlert className="w-4 h-4 text-red-600" />
                        <span>Incident Triage Deck</span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-1 font-mono">Alt+I</span>
                      </button>

                      <button
                        onClick={handleSimulateSensorPing}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-sans font-semibold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer transition-all"
                      >
                        <Radio className="w-3.5 h-3.5 text-blue-600" />
                        <span>Simulate Sensor Ping</span>
                      </button>
                    </div>

                    {/* Metric Quick Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs font-sans">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                        <div className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase">Active Incidents</div>
                        <div className="text-2xl font-bold font-mono text-slate-950 mt-1 tracking-tight">{incidents.length}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                        <div className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase">IoT Nodes</div>
                        <div className="text-2xl font-bold font-mono text-blue-700 mt-1 tracking-tight">{devices.length} Active</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                        <div className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase">Road Closures</div>
                        <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tracking-tight">{roadClosures.length} Blocked</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                        <div className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase">P95 Latency</div>
                        <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tracking-tight">18ms</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: High-Precision Aerospace Situational Radar & Drone FLIR Console */}
                  <div className="lg:col-span-5">
                    <TacticalRadarConsole
                      incidents={incidents}
                      teams={teams}
                      devices={devices}
                      onSelectIncident={(inc) => setSelectedIncident(inc)}
                      onNavigate={handleNavigate}
                    />
                  </div>
                </div>
              </div>

              {/* CORE OPERATIONAL ENGINES MATRIX (WITH REAL PRODUCTION UI IMAGERY) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-sans font-bold text-slate-950 tracking-tight flex items-center space-x-2">
                      <span>Core Operational Capabilities</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono font-medium rounded-full border border-emerald-200">
                        Operational Mesh Active
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">
                      Production-grade emergency intelligence pipeline with sub-50ms spatial routing and cryptographic provenance.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-slate-400 hidden sm:block">
                    POSTGIS 3.4 • POSTGRESQL 16 • FASTIFY 5
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {/* Feature 1: Cartographic GIS Routing */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group">
                    <div className="relative aspect-16/10 overflow-hidden bg-slate-100 border-b border-slate-200">
                      <img
                        src="/features/gis-map-preview.jpg"
                        alt="GIS Cartographic Operations Map"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-emerald-700 border border-emerald-300 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center space-x-1 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>SPATIAL MESH</span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-sans font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                          Dynamic GIS &amp; Hazard Routing
                        </h3>
                        <p className="text-xs text-slate-600 font-sans leading-relaxed">
                          Deterministic PostGIS A* routing dynamically circumnavigating flood cordons, structural hazards, and live bridge closures.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-sans">
                        <span className="text-[11px] font-mono text-slate-500">&lt; 18ms latency</span>
                        <button
                          onClick={() => handleNavigate('live-map')}
                          className="text-xs font-semibold text-slate-900 hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Launch Map</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Feature 2: AI Intelligence */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group">
                    <div className="relative aspect-16/10 overflow-hidden bg-slate-100 border-b border-slate-200">
                      <img
                        src="/features/ai-intelligence-preview.jpg"
                        alt="Autonomous AI Risk Intelligence"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-blue-700 border border-blue-300 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center space-x-1 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>NEURAL GRAPH</span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-sans font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                          AI Threat Clustering &amp; NLP
                        </h3>
                        <p className="text-xs text-slate-600 font-sans leading-relaxed">
                          Multimodal entity extraction and spatial clustering. Formulates probabilistic threat matrices with verifiable database provenance.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-sans">
                        <span className="text-[11px] font-mono text-slate-500">Zero Hallucination</span>
                        <button
                          onClick={() => handleNavigate('ai-intelligence')}
                          className="text-xs font-semibold text-slate-900 hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Inspect Neural</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Feature 3: Drone Recon & Sensors */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group">
                    <div className="relative aspect-16/10 overflow-hidden bg-slate-100 border-b border-slate-200">
                      <img
                        src="/features/drone-recon-preview.jpg"
                        alt="Thermal Drone FLIR Telemetry"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center space-x-1 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>FLIR &amp; SENSORS</span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-sans font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                          Thermal FLIR &amp; IoT Nodes
                        </h3>
                        <p className="text-xs text-slate-600 font-sans leading-relaxed">
                          Autonomous drone thermal heat scanning (36.8°C survivor detection) and LoRaWAN edge sensor mesh with HMAC-SHA256 signatures.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-sans">
                        <span className="text-[11px] font-mono text-slate-500">HMAC-SHA256</span>
                        <button
                          onClick={() => handleNavigate('devices')}
                          className="text-xs font-semibold text-slate-900 hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Sensor Mesh</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Feature 4: EOC Command Gates */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group">
                    <div className="relative aspect-16/10 overflow-hidden bg-slate-100 border-b border-slate-200">
                      <img
                        src="/features/eoc-command-preview.jpg"
                        alt="EOC Multi-Agency Command Floor"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-indigo-700 border border-indigo-300 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center space-x-1 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>COMMAND GATES</span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-sans font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                          Multi-Agency Dispatch Gates
                        </h3>
                        <p className="text-xs text-slate-600 font-sans leading-relaxed">
                          Strict human-in-the-loop authorization gates before deploying municipal pumps, heavy rescue boats, or hazmat units.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-sans">
                        <span className="text-[11px] font-mono text-slate-500">Dual Commander</span>
                        <button
                          onClick={() => handleNavigate('decision-trace')}
                          className="text-xs font-semibold text-slate-900 hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Audit Gates</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Metrics Bar */}
              <MetricsBar
                criticalCount={criticalCount}
                activeCount={activeCount}
                deployedTeamsCount={teams.filter((t: any) => t.status === 'deployed' || t.status === 'en_route').length || teams.length}
                closuresCount={roadClosures.length}
                pendingGatesCount={assignments.filter((a: any) => a.status === 'pending').length || (criticalCount > 0 ? 1 : 0)}
                devicesCount={devices.length}
              />

              {/* Incident Feed Preview */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs font-sans">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <TriangleAlert className="w-4 h-4 text-red-600" />
                    <span className="font-bold text-slate-950 tracking-wide uppercase text-xs">Active Incidents Queue</span>
                  </div>
                  <button
                    onClick={() => handleNavigate('incidents')}
                    className="text-slate-900 font-semibold hover:text-blue-600 flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <span>View All {incidents.length} Incidents</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {incidents.slice(0, 4).map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <span className="font-bold font-mono px-2 py-1 bg-slate-100 text-slate-800 rounded border border-slate-200 shrink-0 text-xs">
                          {inc.code}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{inc.title}</div>
                          <div className="text-[11px] text-slate-500 truncate flex items-center space-x-2 mt-0.5">
                            <span className="capitalize">{inc.hazardType.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{inc.location?.address}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded border font-bold font-mono ${
                          inc.priority === 'P1_CRITICAL'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                          {inc.priority.replace('_', ' ')}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: LIVE OPERATIONS MAP */}
          {activeNavView === 'live-map' && (
            <div className="h-[calc(100vh-140px)] min-h-[620px]">
              <MapView
                incidents={incidents}
                roadClosures={roadClosures}
                teams={teams}
                devices={devices}
                selectedIncident={selectedIncident}
                onSelectIncident={setSelectedIncident}
                calculatedRoute={calculatedRoute}
                onNavigate={handleNavigate}
              />
            </div>
          )}

          {/* VIEW: INCIDENTS */}
          {activeNavView === 'incidents' && (
            <ViewIncidents
              incidents={incidents}
              onSelectIncident={setSelectedIncident}
              onNewIncidentClick={() => setReportModalOpen(true)}
            />
          )}

          {/* VIEW: REPORTS */}
          {activeNavView === 'reports' && (
            <ViewReports
              reports={reports}
              onRefresh={refreshData}
              onNewReportClick={() => setReportModalOpen(true)}
            />
          )}

          {/* VIEW: EVIDENCE */}
          {activeNavView === 'evidence' && <ViewEvidence evidenceList={evidenceList} />}

          {/* VIEW: ASSIGNMENTS */}
          {activeNavView === 'assignments' && (
            <ViewAssignments assignments={assignments} onRefresh={refreshData} />
          )}

          {/* VIEW: ALERTS */}
          {activeNavView === 'alerts' && <ViewAlerts />}

          {/* VIEW: TEAMS */}
          {activeNavView === 'teams' && <ViewTeams teams={teams} />}

          {/* VIEW: RESPONDERS */}
          {activeNavView === 'responders' && <ViewResponders responders={responders} />}

          {/* VIEW: RESOURCES */}
          {activeNavView === 'resources' && <ViewResources resources={resources} />}

          {/* VIEW: ROUTES */}
          {activeNavView === 'routes' && <ViewRoutes roadClosures={roadClosures} />}

          {/* VIEW: AI INTELLIGENCE */}
          {activeNavView === 'ai-intelligence' && <ViewAIIntelligence />}

          {/* VIEW: DECISION TRACE */}
          {activeNavView === 'decision-trace' && <ViewDecisionTrace />}

          {/* VIEW: RELATED INCIDENTS */}
          {activeNavView === 'related-incidents' && (
            <div className="space-y-4">
              <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
                <h2 className="text-base font-bold text-slate-950 font-mono">
                  INCIDENT KNOWLEDGE GRAPH &amp; PROXIMITY TOPOLOGY
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Cross-incident correlation, shared hazard perimeters, and multi-source evidence linkage
                </p>
              </div>

              {incidents.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs font-mono text-slate-500">
                  No active incident clusters detected.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incidents.map((inc, i) => {
                    const nearestRoad = roadClosures.find((r) => r.hazardType === inc.hazardType) || roadClosures[0];
                    const clusterLetter = String.fromCharCode(65 + i);

                    return (
                      <div key={inc.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-900">
                            {inc.code || `INC-${inc.id.slice(0, 8)}`} ({inc.title})
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                            Cluster {clusterLetter}
                          </span>
                        </div>
                        <div className="text-slate-600 text-xs font-sans">
                          {nearestRoad ? (
                            <>Correlated with road segment <strong>{nearestRoad.name}</strong> ({nearestRoad.status}).</>
                          ) : (
                            <>Primary emergency epicenter with {inc.reporterCount || 1} verified reporter feeds.</>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Location: {inc.location?.address || inc.location?.landmark || 'Operational Grid'} • Evidence items: {inc.evidenceCount || 0}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW: CONFLICTS */}
          {activeNavView === 'conflicts' && (
            <ViewConflicts
              evidenceList={evidenceList}
              incidents={incidents}
              onRefresh={refreshData}
            />
          )}

          {/* VIEW: DEVICES */}
          {activeNavView === 'devices' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-2xs font-sans">
                <div>
                  <h2 className="text-base font-bold text-slate-950 font-mono flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-blue-600" />
                    <span>IOT HARDWARE EDGE NODES (HMAC-SHA256)</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Autonomous physical emergency nodes with timing-safe cryptographic authentication
                  </p>
                </div>
                <button
                  onClick={handleSimulateSensorPing}
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg font-bold cursor-pointer"
                >
                  Trigger Telemetry Ping
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.map((dev) => (
                  <div key={dev.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-950 text-sm">{dev.deviceId || dev.name}</div>
                          <div className="text-[10px] text-slate-500 uppercase">{(dev.deviceType || 'sensor').replace('_', ' ')}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold uppercase text-[10px]">
                        {dev.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Battery</span>
                        <span className="font-bold text-slate-800">{dev.batteryPercentage ?? dev.batteryLevel ?? 92}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Auth Mode</span>
                        <span className="font-bold text-blue-700">HMAC-SHA256</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Signal</span>
                        <span className="font-bold text-emerald-700">-64 dBm</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        GPS: {dev.location?.latitude?.toFixed(4) || dev.assignedLocation?.latitude?.toFixed(4)}, {dev.location?.longitude?.toFixed(4) || dev.assignedLocation?.longitude?.toFixed(4)}
                      </span>
                      <span className="text-emerald-700 font-bold flex items-center space-x-1">
                        <CircleCheck className="w-3.5 h-3.5" />
                        <span>Signature Valid</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: ANALYTICS */}
          {activeNavView === 'analytics' && (
            <ViewAnalytics
              incidents={incidents}
              reports={reports}
              teams={teams}
              healthData={healthData}
            />
          )}

          {/* VIEW: AUDIT LOGS */}
          {activeNavView === 'audit-logs' && <ViewAuditLogs auditLogs={auditLogs} />}

          {/* VIEW: SYSTEM HEALTH */}
          {activeNavView === 'system-health' && <ViewSystemHealth healthData={healthData} />}

          {/* VIEW: FIELD SYNC */}
          {activeNavView === 'field-sync' && (
            <ViewFieldSync
              responders={responders}
              devices={devices}
            />
          )}

          {/* VIEW: ADMIN SUBVIEWS */}
          {(activeNavView === 'admin-users' ||
            activeNavView === 'admin-roles' ||
            activeNavView === 'admin-settings') && (
            <ViewAdmin subview={activeNavView} />
          )}
        </div>
      </div>

      {/* QUICK REPORT MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <FilePlus className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900">File Emergency Situational Report</h3>
              </div>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Emergency Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flash Flood on Vikas Marg"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Description / Observations</label>
                <textarea
                  required
                  rows={3}
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Priority Rating</label>
                  <select
                    value={reportForm.priority}
                    onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900"
                  >
                    <option value="P1_CRITICAL">P1 - Critical (Threat to Life)</option>
                    <option value="P2_HIGH">P2 - High (Structural Risk)</option>
                    <option value="P3_MEDIUM">P3 - Medium (Hazard / Delay)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Hazard Category</label>
                  <select
                    value={reportForm.hazardType}
                    onChange={(e) => setReportForm({ ...reportForm, hazardType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900"
                  >
                    <option value="flood">Flood & Flash Inundation</option>
                    <option value="fire">Fire & Structural Collapse</option>
                    <option value="chemical">Chemical / Gas Leak</option>
                    <option value="medical">Mass Casualty Medical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Address / Landmark</label>
                  <input
                    type="text"
                    required
                    value={reportForm.address}
                    onChange={(e) => setReportForm({ ...reportForm, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Estimated Casualties</label>
                  <input
                    type="number"
                    min="0"
                    value={reportForm.casualties}
                    onChange={(e) => setReportForm({ ...reportForm, casualties: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 rounded border border-slate-300 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  {loading ? 'Broadcasting...' : 'Broadcast Emergency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEEP TRIAGE MODAL */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onIncidentUpdated={refreshData}
          userRole={currentRole}
        />
      )}

      {/* GLOBAL SEARCH MODAL */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        incidents={incidents}
        reports={reports}
        evidenceList={evidenceList}
        responders={responders}
        teams={teams}
        resources={resources}
        devices={devices}
        onSelectIncident={setSelectedIncident}
        onNavigateView={handleNavigate}
      />

      {/* OPERATIONAL NOTIFICATION DRAWER */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        onNavigateView={handleNavigate}
        notifications={operationalNotifications}
      />

      {/* COMMANDER PROFILE & SECURITY MODAL */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentRole={currentRole}
      />

      {/* ARTIFACT EXPORT MODAL */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        incidents={incidents}
        evidenceList={evidenceList}
        auditLogs={auditLogs}
      />
    </div>
  );
}
