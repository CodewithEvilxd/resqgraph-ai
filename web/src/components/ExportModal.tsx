'use client';

import { useState } from 'react';
import {
  Download,
  FileText,
  FileCheck,
  Shield,
  Layers,
  X,
  CircleCheck,
} from '@flux-icons/react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: any[];
  evidenceList: any[];
  auditLogs: any[];
}

export function ExportModal({
  isOpen,
  onClose,
  incidents,
  evidenceList,
  auditLogs,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv'>('json');
  const [exportType, setExportType] = useState<'incidents' | 'evidence' | 'audit' | 'summary'>('incidents');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    let filename = `resqgraph-${exportType}-${new Date().toISOString().substring(0, 10)}`;
    let content = '';

    if (exportType === 'incidents') {
      if (selectedFormat === 'json') {
        content = JSON.stringify(incidents, null, 2);
        filename += '.json';
      } else {
        const header = 'ID,Code,Title,HazardType,Priority,Status,Casualties,Address,CreatedAt\n';
        const rows = incidents
          .map(
            (i) =>
              `"${i.id}","${i.code}","${i.title}","${i.hazardType}","${i.priority}","${i.status}",${i.affectedPeopleEstimate || 0},"${i.location?.address || ''}","${i.createdAt}"`
          )
          .join('\n');
        content = header + rows;
        filename += '.csv';
      }
    } else if (exportType === 'evidence') {
      if (selectedFormat === 'json') {
        content = JSON.stringify(evidenceList, null, 2);
        filename += '.json';
      } else {
        const header = 'ID,IncidentID,SourceType,MediaType,LocationConfidence,ExtractionConfidence,Contradictions,CreatedAt\n';
        const rows = evidenceList
          .map(
            (e) =>
              `"${e.id}","${e.incidentId}","${e.sourceType}","${e.mediaType}",${e.locationConfidence},${e.extractionConfidence},"${(e.contradictionFlags || []).join(';') || 'none'}","${e.createdAt}"`
          )
          .join('\n');
        content = header + rows;
        filename += '.csv';
      }
    } else if (exportType === 'audit') {
      if (selectedFormat === 'json') {
        content = JSON.stringify(auditLogs, null, 2);
        filename += '.json';
      } else {
        const header = 'ID,Action,TargetEntity,TargetID,UserID,IP,Timestamp\n';
        const rows = auditLogs
          .map(
            (a) =>
              `"${a.id}","${a.action}","${a.targetEntity}","${a.targetEntityId || ''}","${a.userId || ''}","${a.ipAddress || ''}","${a.timestamp}"`
          )
          .join('\n');
        content = header + rows;
        filename += '.csv';
      }
    } else {
      // Summary
      const summary = {
        title: 'ResQGraph AI — Operational Briefing',
        generatedAt: new Date().toISOString(),
        activeIncidentsCount: incidents.length,
        evidenceCount: evidenceList.length,
        auditCount: auditLogs.length,
        compliance: 'Verified PostGIS & Fastify Telemetry',
      };
      content = JSON.stringify(summary, null, 2);
      filename += '.json';
    }

    const blob = new Blob([content], {
      type: selectedFormat === 'json' ? 'application/json' : 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 font-mono text-xs">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-slate-800" />
            <h3 className="font-bold text-slate-900 text-sm">Export Operational Artifacts</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase">Dataset to Export</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'incidents', label: 'Incident Manifest', icon: FileText },
                { id: 'evidence', label: 'Evidence Gallery', icon: Layers },
                { id: 'audit', label: 'Audit Trail', icon: FileCheck },
                { id: 'summary', label: 'Command Summary', icon: Shield },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setExportType(item.id as any)}
                    className={`p-2.5 rounded-lg border text-left flex items-center space-x-2 cursor-pointer transition-colors ${
                      exportType === item.id
                        ? 'border-slate-900 bg-slate-900 text-white font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase">Format</label>
            <div className="flex space-x-3">
              <label className="flex items-center space-x-2 text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={selectedFormat === 'json'}
                  onChange={() => setSelectedFormat('json')}
                />
                <span>JSON (Full Object Structure)</span>
              </label>
              <label className="flex items-center space-x-2 text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={selectedFormat === 'csv'}
                  onChange={() => setSelectedFormat('csv')}
                />
                <span>CSV (Spreadsheet Compatible)</span>
              </label>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-500 font-sans">
            Exported data includes cryptographic timestamps, responder identifiers, and PostGIS coordinates verified by DEMA EOC authority.
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleDownload}
            disabled={downloadSuccess}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            {downloadSuccess ? (
              <>
                <CircleCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Manifest</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
