'use client';

import { useState, useEffect } from 'react';
import {
  Layers,
  Video,
  Radio,
  CircleCheck,
  X,
  MapPin,
  Clock,
  Shield,
  CirclePlus,
  Eye,
  Activity,
} from '@flux-icons/react';

interface ViewEvidenceProps {
  evidenceList: any[];
}

export function ViewEvidence({ evidenceList: initialEvidence }: ViewEvidenceProps) {
  const defaultEvidence = [
    {
      id: 'ev-art-01',
      sourceType: 'citizen',
      mediaType: 'image',
      description: 'Water level reached windshield of white Maruti Dzire sedan at Kashmere Gate Ring Road underpass.',
      location: { latitude: 28.6678, longitude: 77.2285, address: 'Kashmere Gate Underpass Cordon' },
      isVerified: true,
      confidenceScore: 0.98,
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      contradictionFlags: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    },
    {
      id: 'ev-art-02',
      sourceType: 'device',
      mediaType: 'text',
      description: 'Ultrasonic river gauge FL-01 telemetry packet: 3.82m water height (Spike rate +0.82m/35min). HMAC-SHA256 signature verified.',
      location: { latitude: 28.6612, longitude: 77.2341, address: 'Old Railway Bridge Sensor Pylon #4' },
      isVerified: true,
      confidenceScore: 1.0,
      sha256Hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      contradictionFlags: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
    {
      id: 'ev-art-03',
      sourceType: 'drone',
      mediaType: 'video',
      description: 'Drone Recon DR-04 4K FLIR thermal camera recording of 11kV substation fire showing flame spread perimeter.',
      location: { latitude: 28.6012, longitude: 77.2915, address: 'Mayur Vihar Phase 1 Sector Market' },
      isVerified: true,
      confidenceScore: 0.94,
      sha256Hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
      contradictionFlags: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    },
    {
      id: 'ev-art-04',
      sourceType: 'voice',
      mediaType: 'audio',
      description: 'Hotline 911 distress call recording: resident requesting boat evacuation for 3 family members stranded on roof.',
      location: { latitude: 28.6690, longitude: 77.2270, address: 'Ring Road Low-lying Settlement' },
      isVerified: false,
      confidenceScore: 0.82,
      sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      contradictionFlags: ['Awaiting drone visual corroboration'],
      createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    },
  ];

  const [evidence, setEvidence] = useState<any[]>(
    initialEvidence && initialEvidence.length > 0 ? initialEvidence : defaultEvidence
  );
  const [filterType, setFilterType] = useState('ALL');
  const [selectedArtifact, setSelectedArtifact] = useState<any | null>(null);

  useEffect(() => {
    if (initialEvidence && initialEvidence.length > 0) {
      setEvidence(initialEvidence);
    }
  }, [initialEvidence]);

  const handleSimulateNewEvidence = () => {
    const newArt = {
      id: `ev-art-${Date.now()}`,
      sourceType: 'drone',
      mediaType: 'image',
      description: 'High-resolution aerial orthophoto from Scout Drone Unit Beta showing water current velocity at 2.4 m/s.',
      location: { latitude: 28.6655, longitude: 77.2310, address: 'Yamuna Embankment North Wall' },
      isVerified: true,
      confidenceScore: 0.97,
      sha256Hash: 'b45cffe084dd3d20d928bee85e7b0f2142277d01cdff0ef81878d65421a82d23',
      contradictionFlags: [],
      createdAt: new Date().toISOString(),
    };
    setEvidence([newArt, ...evidence]);
    setSelectedArtifact(newArt);
  };

  const filtered = evidence.filter((ev) => {
    if (filterType === 'ALL') return true;
    return ev.mediaType === filterType || ev.sourceType === filterType;
  });

  const getMediaIcon = (type: string, source: string) => {
    if (source === 'device') return <Radio className="w-4 h-4 text-blue-600" />;
    if (type === 'video') return <Video className="w-4 h-4 text-purple-600" />;
    if (type === 'audio' || source === 'voice') return <Activity className="w-4 h-4 text-amber-600" />;
    return <Layers className="w-4 h-4 text-indigo-600" />;
  };

  const imageCount = evidence.filter((e) => e.mediaType === 'image').length;
  const sensorCount = evidence.filter((e) => e.sourceType === 'device').length;
  const droneCount = evidence.filter((e) => e.sourceType === 'drone').length;
  const verifiedCount = evidence.filter((e) => e.isVerified).length;

  return (
    <div className="space-y-5 font-sans">
      {/* 1. VISUAL HERO BANNER WITH REAL DRONE RECON PREVIEW */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 p-5 space-y-2">
            <div className="inline-flex items-center space-x-2 text-[11px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              <span>SHA-256 PROVENANCE VAULT • TAMPER-EVIDENT EVIDENCE</span>
            </div>
            <h2 className="text-xl font-sans font-bold text-slate-950 tracking-tight">
              Multimodal Evidence Repository &amp; Provenance Vault
            </h2>
            <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-2xl">
              Cryptographically hashes and stores aerial thermal drone streams, IoT telemetry packets, audio 911 calls, and citizen reports.
              Maintains an immutable chain of custody with PostGIS spatial anchors.
            </p>
          </div>

          <div className="md:col-span-4 p-4 flex justify-end">
            <div className="relative w-full max-w-[240px] aspect-16/10 rounded-lg overflow-hidden border border-slate-200 shadow-xs">
              <img
                src="/features/drone-recon-preview.jpg"
                alt="Drone Recon Telemetry"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1.5 right-1.5 bg-white/95 backdrop-blur-xs text-amber-800 border border-amber-200 text-[9px] font-mono px-1.5 py-0.5 rounded">
                FLIR 1080P
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
              Total Artifacts
            </span>
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-950 mt-1 tracking-tight">
            {evidence.length} <span className="text-xs font-sans font-normal text-slate-500">files</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Multimodal vault
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
              Cryptographic Proof
            </span>
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tracking-tight">
            SHA-256
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tamper-evident chain
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
              Sensor &amp; Drone Feeds
            </span>
            <Radio className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-900 mt-1 tracking-tight">
            {sensorCount + droneCount} <span className="text-xs font-sans font-normal text-blue-600">streams</span>
          </div>
          <div className="text-[11px] text-blue-700 mt-1">
            Direct edge ingestion
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
              Verification Ratio
            </span>
            <CircleCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tracking-tight">
            {Math.round((verifiedCount / (evidence.length || 1)) * 100)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {verifiedCount} of {evidence.length} validated
          </div>
        </div>
      </div>

      {/* 3. FILTER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-2xs text-xs font-sans">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-semibold text-[11px] mr-1">Filter Artifacts:</span>
          {[
            { id: 'ALL', label: `All Artifacts (${evidence.length})` },
            { id: 'image', label: `Imagery (${imageCount})` },
            { id: 'device', label: `IoT Sensor Logs (${sensorCount})` },
            { id: 'drone', label: `Drone FLIR Streams (${droneCount})` },
            { id: 'audio', label: 'Audio Records' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSimulateNewEvidence}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
        >
          <CirclePlus className="w-3.5 h-3.5 text-blue-400" />
          <span>Simulate Drone Stream</span>
        </button>
      </div>

      {/* 4. EVIDENCE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const isVerified = item.isVerified;
          const conf = Math.round((item.confidenceScore || 0.9) * 100);

          return (
            <div
              key={item.id}
              onClick={() => setSelectedArtifact(item)}
              className="bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3.5"
            >
              <div className="space-y-3">
                {/* Top Header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 rounded bg-slate-100 border border-slate-200">
                      {getMediaIcon(item.mediaType, item.sourceType)}
                    </span>
                    <span className="font-bold text-slate-900 uppercase">
                      {item.sourceType} {item.mediaType}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      isVerified
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {isVerified ? 'VERIFIED ARTIFACT' : 'PENDING CORROBORATION'}
                  </span>
                </div>

                <p className="text-xs text-slate-800 font-sans leading-relaxed font-medium">
                  {item.description}
                </p>

                {/* Metadata Pill */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.location?.address || 'NCR Spatial Coordinates'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                    <span className="truncate max-w-[200px] text-slate-400">
                      SHA: {item.sha256Hash?.slice(0, 16)}...
                    </span>
                    <span className="text-emerald-700 font-bold">
                      Confidence: {conf}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </span>

                <span className="text-slate-900 font-bold flex items-center gap-1 hover:text-blue-600">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Provenance</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ARTIFACT PROVENANCE INSPECTOR MODAL */}
      {selectedArtifact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-950 font-sans text-base">
                  Cryptographic Evidence Provenance
                </h3>
              </div>
              <button
                onClick={() => setSelectedArtifact(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 font-sans text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase">
                    {selectedArtifact.sourceType} • {selectedArtifact.mediaType}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono text-[10px]">
                    {selectedArtifact.isVerified ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-sans leading-relaxed">
                  {selectedArtifact.description}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  SHA-256 Tamper-Evident Hash:
                </span>
                <div className="p-2.5 rounded-lg bg-slate-100 text-slate-900 font-mono text-[11px] break-all border border-slate-300 select-all">
                  {selectedArtifact.sha256Hash}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Spatial Anchor:</span>
                  <span className="text-slate-800 font-mono font-bold text-[11px] block mt-1">
                    {selectedArtifact.location?.latitude?.toFixed(4)}° N, {selectedArtifact.location?.longitude?.toFixed(4)}° E
                  </span>
                  <span className="text-slate-500 text-[10px] truncate block font-sans">
                    {selectedArtifact.location?.address}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Corroboration Confidence:</span>
                  <span className="text-emerald-700 font-bold text-base font-mono block mt-1">
                    {Math.round((selectedArtifact.confidenceScore || 0.95) * 100)}%
                  </span>
                  <span className="text-slate-500 text-[10px] block font-sans">
                    PostGIS Spatial Corroborated
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedArtifact(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
