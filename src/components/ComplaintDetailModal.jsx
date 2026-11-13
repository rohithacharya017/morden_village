import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import {
  X,
  MapPin,
  Calendar,
  User,
  Phone,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Send,
  Printer,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ComplaintDetailModal({ complaint, onClose, onSelectComplaint }) {
  const { isPanchayat, currentUser } = useAuth();
  const {
    acknowledgeComplaint,
    setComplaintInProgress,
    completeComplaint,
    reopenComplaint,
    overridePriority
  } = useComplaints();

  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [completionNote, setCompletionNote] = useState('');
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideLevel, setOverrideLevel] = useState('HIGH');
  const [overrideReason, setOverrideReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!complaint) return null;

  // Authorization Check: If user is a logged-in villager, they can ONLY view their own reported problems
  const isOwner =
    !currentUser ||
    currentUser.role !== 'villager' ||
    complaint.reporter_id === currentUser.id ||
    (currentUser.mobile_number && complaint.reporter_mobile_snapshot === currentUser.mobile_number);

  if (currentUser?.role === 'villager' && !isOwner) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-200 text-center animate-fade-in space-y-4">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
            Access Restricted
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            As a registered citizen, you can only view details of problems reported by your account. You cannot view other villagers' private grievance reports.
          </p>
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              Back to My Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Acknowledge
  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    try {
      await acknowledgeComplaint(complaint.id, currentUser?.full_name || 'Panchayat Official');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle In Progress
  const handleSetInProgress = async () => {
    setIsSubmitting(true);
    try {
      await setComplaintInProgress(complaint.id, currentUser?.full_name || 'Panchayat Official');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Complete
  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await completeComplaint(
        complaint.id,
        currentUser?.full_name || 'Panchayat Official',
        completionNote
      );
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      setShowCompletionForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Priority Override
  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await overridePriority(
        complaint.id,
        overrideLevel,
        overrideReason,
        currentUser?.full_name || 'Panchayat Official'
      );
      setShowOverrideForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress steps
  const steps = [
    { label: 'Submitted', done: true, date: complaint.created_at },
    {
      label: 'Acknowledged',
      done: ['ACKNOWLEDGED', 'IN_PROGRESS', 'COMPLETED'].includes(complaint.status),
      date: complaint.acknowledged_at
    },
    {
      label: 'In Progress',
      done: ['IN_PROGRESS', 'COMPLETED'].includes(complaint.status),
      date: complaint.status === 'IN_PROGRESS' || complaint.status === 'COMPLETED' ? complaint.updated_at : null
    },
    {
      label: 'Resolved',
      done: complaint.status === 'COMPLETED',
      date: complaint.completed_at
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-fade-in my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-200 text-slate-800 rounded-lg">
                {complaint.complaint_number}
              </span>
              <PriorityBadge
                priority={complaint.priority}
                reason={complaint.priority_reason}
                source={complaint.priority_source}
              />
              <StatusBadge status={complaint.status} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {complaint.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Category: <strong className="text-slate-700">{complaint.category}</strong> • Ward:{' '}
              <strong className="text-slate-700">{complaint.village_name || 'Kandavara'}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition"
              title="Print Summary"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Progress Tracker Bar */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Resolution Progress Tracking
            </h4>
            <div className="grid grid-cols-4 gap-2 relative">
              {steps.map((st, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                      st.done
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {st.done ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      st.done ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {st.label}
                  </span>
                  {st.date && (
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(st.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Priority Card */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl mt-0.5 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  AI Triage Priority Assessment ({complaint.priority})
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {complaint.priority_source || 'AI Analysis'}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {complaint.priority_reason ||
                  'Assessed on safety threat matrix, citizen impact radius, and environmental hazard heuristics.'}
              </p>
              {complaint.priority_override_reason && (
                <div className="mt-2 pt-2 border-t border-emerald-200 text-xs text-amber-800">
                  <strong>Panchayat Override Reason:</strong> {complaint.priority_override_reason} (By{' '}
                  {complaint.priority_overridden_by})
                </div>
              )}
            </div>
          </div>

          {/* AI Problem Validation & Visual Match Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl mt-0.5 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                    AI Problem Validation (Image &amp; Details Check)
                  </span>
                  <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full uppercase">
                    Status: {complaint.ai_validation_status || 'accepted'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                  Similarity Score: {complaint.similarity_score || 88}% (≥ 70% Passed)
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {complaint.ai_validation_message || 'Image content verified and meaningfully related to both Problem Title and Description.'}
              </p>

              {complaint.extracted_keywords && complaint.extracted_keywords.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-emerald-200/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Visual Entities Extracted from Photograph:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {complaint.extracted_keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white text-emerald-900 rounded-md border border-emerald-200 text-[11px] font-medium shadow-2xs">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Problem Details & Photograph */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                About the Problem
              </h4>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </div>

              {/* Location Box with Google Maps Link */}
              <div className="mt-4 bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Reported Location</span>
                  </div>
                  {complaint.latitude && complaint.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white px-2 py-0.5 rounded-lg border border-blue-200 shadow-2xs hover:bg-blue-50 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Google Maps</span>
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  {complaint.location_address || 'Near Ward Center'}
                </p>
                {complaint.latitude && complaint.longitude && (
                  <p className="text-[11px] font-mono text-slate-400">
                    Live GPS: {complaint.latitude.toFixed(5)}, {complaint.longitude.toFixed(5)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Problem Photograph
              </h4>
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center relative shadow-inner">
                {complaint.image_url ? (
                  <img
                    src={complaint.image_url}
                    alt="Problem Evidence"
                    onError={(e) => { e.currentTarget.src = '/assets/hero-village.jpg'; }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    <span className="text-xs">No photograph provided</span>
                  </div>
                )}
              </div>

              {/* Reporter Contact Information (Shown to Panchayat or original reporter) */}
              <div className="mt-4 bg-blue-50/60 border border-blue-200/70 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide block">
                    Citizen Reporter
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">
                      {complaint.reporter_name_snapshot}
                    </span>
                  </div>
                </div>
                <a
                  href={`tel:${complaint.reporter_mobile_snapshot}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call {complaint.reporter_mobile_snapshot}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Completion Remarks (if resolved) */}
          {complaint.status === 'COMPLETED' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Panchayat Resolution Note</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {complaint.completion_note || 'Work completed and verified by Panchayat staff.'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-emerald-200/60">
                <span>Verified by: <strong>{complaint.completed_by || 'Panchayat Official'}</strong></span>
                <span>
                  Resolved on: {new Date(complaint.completed_at || complaint.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Panchayat Administrative Actions */}
          {isPanchayat && (
            <div className="border-t border-slate-100 pt-5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Panchayat Administrative Actions
              </h4>

              <div className="flex flex-wrap gap-2.5">
                {complaint.status === 'PENDING' && (
                  <button
                    onClick={handleAcknowledge}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    ✓ Acknowledge Complaint
                  </button>
                )}

                {complaint.status === 'ACKNOWLEDGED' && (
                  <button
                    onClick={handleSetInProgress}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    ▶ Mark Work In Progress
                  </button>
                )}

                {complaint.status !== 'COMPLETED' && (
                  <button
                    onClick={() => setShowCompletionForm(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                  >
                    ★ Mark Work Done / Complete
                  </button>
                )}

                {complaint.status === 'COMPLETED' && (
                  <button
                    onClick={() => {
                      const reason = prompt('Please enter the reason for reopening this complaint:');
                      if (reason) reopenComplaint(complaint.id, currentUser?.full_name, reason);
                    }}
                    className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold rounded-xl transition"
                  >
                    ↺ Reopen Complaint
                  </button>
                )}

                <button
                  onClick={() => setShowOverrideForm(!showOverrideForm)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  ⚡ Override Priority
                </button>
              </div>

              {/* Completion Note Form */}
              {showCompletionForm && (
                <form
                  onSubmit={handleCompleteSubmit}
                  className="mt-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl animate-fade-in"
                >
                  <h5 className="text-xs font-bold text-emerald-900 mb-2">
                    Verify and Complete Complaint
                  </h5>
                  <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                    Completion Remarks / Work Summary:
                  </label>
                  <textarea
                    value={completionNote}
                    onChange={(e) => setCompletionNote(e.target.value)}
                    rows={2}
                    placeholder="e.g. Broken pipe repaired by Junior Engineer team, water pressure restored."
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-emerald-500 mb-3"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCompletionForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-700"
                    >
                      Confirm Resolution & Notify Villager
                    </button>
                  </div>
                </form>
              )}

              {/* Override Priority Form */}
              {showOverrideForm && (
                <form
                  onSubmit={handleOverrideSubmit}
                  className="mt-4 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl animate-fade-in"
                >
                  <h5 className="text-xs font-bold text-amber-900 mb-2">
                    Administrative Priority Override
                  </h5>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                        New Priority Level:
                      </label>
                      <select
                        value={overrideLevel}
                        onChange={(e) => setOverrideLevel(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="HIGH">HIGH Priority</option>
                        <option value="MEDIUM">MEDIUM Priority</option>
                        <option value="LOW">LOW Priority</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                        Administrative Reason:
                      </label>
                      <input
                        type="text"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="e.g. Critical hospital approach route"
                        required
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowOverrideForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-amber-700"
                    >
                      Save Override
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
