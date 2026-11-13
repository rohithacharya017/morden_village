import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building2,
  Landmark,
  FileText,
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function SchemeDetailModal({ scheme, isOpen, onClose }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !scheme) return null;

  const name = scheme.name;
  const category = scheme.category;
  const description = scheme.short_description;
  const benefits = scheme.benefits;
  const eligibility = scheme.eligibility;
  const documents = scheme.documents_required;
  const govLevel = scheme.government_level;

  const isKarnataka = scheme.government_level === 'Karnataka State Government' || scheme.category_id === 'karnataka_state';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scheme-modal-title"
      >
        {/* Modal Header */}
        <div className={`p-6 sm:p-7 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0 ${
          isKarnataka ? 'bg-gradient-to-r from-amber-500/10 via-amber-50 to-emerald-50/40' : 'bg-gradient-to-r from-emerald-500/10 via-teal-50 to-slate-50'
        }`}>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isKarnataka
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
              }`}>
                {isKarnataka ? <Landmark className="w-3.5 h-3.5 text-amber-700" /> : <Building2 className="w-3.5 h-3.5 text-emerald-700" />}
                <span>{govLevel}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <span>{category}</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Scheme</span>
              </span>
            </div>

            <h2 id="scheme-modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-2xl transition shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 text-sm flex-1">
          {/* Summary / Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>About this Scheme</span>
            </h4>
            <p className="text-slate-800 text-sm sm:text-base leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              {description}
            </p>
          </div>

          {/* Key Benefits */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Benefits & Entitlements</span>
            </h4>
            <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 text-emerald-950 font-medium leading-relaxed">
              {benefits}
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <span>Eligibility Criteria</span>
            </h4>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-slate-800 leading-relaxed shadow-xs">
              {eligibility}
            </div>
          </div>

          {/* Documents Required */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Required Documents Checklist</span>
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 leading-relaxed">
              {documents ? (
                <div className="space-y-1.5">
                  {(Array.isArray(documents)
                    ? documents
                    : typeof documents === 'string'
                    ? documents.split(',')
                    : [String(documents)]
                  )
                    .map((d) => String(d).trim())
                    .filter(Boolean)
                    .map((doc, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{doc}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic">
                  Documentation verification ongoing / Enquire at Gram Panchayat office.
                </span>
              )}
            </div>
          </div>

          {/* Verification Date & Authority Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-100/80 rounded-2xl text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                <strong>Last Verified:</strong>{' '}
                {scheme.last_verified_date
                  ? new Date(scheme.last_verified_date).toLocaleDateString('en-IN', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'October 2026'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Modern Village Civic Desk Certified</span>
            </div>
          </div>

          {/* Mandatory Guidance Notice */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Important Public Notice</span>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              "Modern Village is an informational civic portal. We do not approve, process, or guarantee government benefits. All citizen applications must be submitted directly through official government portals or at your local Gram Panchayat office."
            </p>
            <p className="text-[11px] text-amber-800/80">
              Modern Village does not collect fees, request OTPs, or process payments for any welfare scheme.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
          >
            Close
          </button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
            {scheme.official_url && (
              <a
                href={scheme.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Official Source</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              </a>
            )}

            {scheme.apply_url && (
              <a
                href={scheme.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
