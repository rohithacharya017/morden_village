import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import { Search, X, CheckCircle2, Clock, MapPin, AlertCircle } from 'lucide-react';

export default function QuickTrackerModal({ isOpen, onClose, onSelectComplaint }) {
  const { complaints } = useComplaints();
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    const query = searchId.trim().toUpperCase();
    if (!query) return;

    const found = complaints.find(
      c => c.complaint_number.toUpperCase().includes(query) || c.id === query
    );
    setResult(found || null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-700 text-white">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-200" />
            <h3 className="font-bold text-base">Quick Complaint Tracker</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearch} className="mb-5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">
              Enter Complaint Number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. MV-2026-00001"
                className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none uppercase font-mono font-semibold"
                required
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md"
              >
                Track
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Tip: You can find your complaint number on your submission receipt or SMS.
            </p>
          </form>

          {hasSearched && !result && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-500 animate-fade-in">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No complaint found</p>
              <p className="text-xs text-slate-400 mt-1">
                Please verify the complaint number format (e.g. MV-2026-00001).
              </p>
            </div>
          )}

          {result && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 animate-fade-in space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-700">
                  {result.complaint_number}
                </span>
                <StatusBadge status={result.status} />
              </div>

              <h4 className="font-bold text-slate-900 text-sm">
                {result.title}
              </h4>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Category: {result.category}</span>
                <PriorityBadge priority={result.priority} />
              </div>

              <div className="text-xs text-slate-600 border-t border-slate-200/80 pt-2 flex items-center justify-between">
                <span>Reported: {new Date(result.created_at).toLocaleDateString()}</span>
                <span>Ward: {result.village_name || 'Kandavara'}</span>
              </div>

              {result.completion_note && (
                <div className="bg-emerald-100/60 p-2.5 rounded-xl text-xs text-emerald-900">
                  <strong>Resolution:</strong> {result.completion_note}
                </div>
              )}

              <button
                onClick={() => {
                  onSelectComplaint(result.id);
                  onClose();
                }}
                className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                View Full Progress & Audit Trail →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
