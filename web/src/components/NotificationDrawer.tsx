'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  X,
  DoubleCheck,
  TriangleAlert,
  Radio,
  Cpu,
  CircleCheck,
} from '@flux-icons/react';
import { NavViewId } from './Sidebar';

export interface OperationalNotification {
  id: string;
  title: string;
  message: string;
  category: 'assignment' | 'incident' | 'ai_approval' | 'device' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'info';
  timestamp: string;
  read: boolean;
  targetView?: NavViewId;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView: (view: NavViewId) => void;
  notifications?: OperationalNotification[];
}

export function NotificationDrawer({
  isOpen,
  onClose,
  onNavigateView,
  notifications: initialNotifications = [],
}: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<OperationalNotification[]>(initialNotifications);

  // Sync with prop updates
  useEffect(() => {
    if (initialNotifications && initialNotifications.length > 0) {
      setNotifications(initialNotifications);
    }
  }, [initialNotifications]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col font-mono text-xs animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-slate-800" />
            <h3 className="font-bold text-slate-900 text-sm">Operational Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px]">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 cursor-pointer"
              >
                <DoubleCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feed List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                if (n.targetView) {
                  onNavigateView(n.targetView);
                  onClose();
                }
              }}
              className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                n.read
                  ? 'bg-white border-transparent hover:bg-slate-50'
                  : 'bg-blue-50/40 border-blue-100 hover:bg-blue-50/70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  {n.category === 'ai_approval' && <Cpu className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                  {n.category === 'assignment' && <CircleCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  {n.category === 'device' && <Radio className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  {n.category === 'incident' && <TriangleAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                  <span className="font-bold text-slate-900 text-xs">{n.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
              </div>

              <p className="text-[11px] text-slate-600 font-sans mt-1.5 leading-relaxed">
                {n.message}
              </p>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60 text-[10px]">
                <span className={`font-bold uppercase ${
                  n.severity === 'critical' ? 'text-red-700' : n.severity === 'high' ? 'text-orange-700' : 'text-slate-500'
                }`}>
                  {n.severity} Priority
                </span>
                {n.targetView && (
                  <span className="text-blue-600 hover:underline">
                    View in {n.targetView.replace('-', ' ')} →
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Connected to SSE Event Stream</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>
    </div>
  );
}
