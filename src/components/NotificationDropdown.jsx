import React, { useState, useRef, useEffect } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { Bell, Check, Clock, MessageSquare, AlertCircle } from 'lucide-react';

export default function NotificationDropdown({ onSelectComplaint }) {
  const { notifications, unreadCount, markNotificationRead } = useComplaints();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    if (onSelectComplaint && notif.complaint_id) {
      onSelectComplaint(notif.complaint_id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in">
          <div className="p-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <h4 className="font-semibold text-sm">Notifications & Alerts</h4>
            </div>
            <span className="text-xs bg-emerald-700/60 px-2 py-0.5 rounded-full">
              {unreadCount} unread
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                    !n.read_at ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h5 className="font-semibold text-xs text-slate-800 line-clamp-1">
                      {n.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-1.5">
                    {n.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-600 font-medium">Click to view details →</span>
                    {!n.read_at && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Unread" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
