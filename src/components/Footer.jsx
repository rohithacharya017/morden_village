import React from 'react';
import { Shield, PhoneCall, HelpCircle, CheckCircle2, Heart } from 'lucide-react';

export default function Footer({ onNavigate, onOpenTracker }) {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-white font-extrabold text-base tracking-tight">
                Modern Village
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Your Village. Your Voice. Our Responsibility.
              An AI-assisted civic grievance platform bridging rural citizens directly with Gram Panchayat officials.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Certified Gram Panchayat Civic Portal</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Civic Portals
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('government_schemes')}
                  className="hover:text-emerald-400 transition flex items-center gap-1.5"
                >
                  <span>Govt Schemes & Subsidies</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold uppercase">
                    Yojana
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('villager_auth')}
                  className="hover:text-emerald-400 transition"
                >
                  Citizen Villager Registration
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('panchayat_login')}
                  className="hover:text-emerald-400 transition"
                >
                  Panchayat Official Portal
                </button>
              </li>
              <li>
                <button onClick={onOpenTracker} className="hover:text-emerald-400 transition">
                  Track Complaint Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('panchayat_reports')}
                  className="hover:text-emerald-400 transition"
                >
                  Panchayat Resolution Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Helplines */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
              <span>Emergency Helplines</span>
            </h4>
            <ul className="space-y-2 text-slate-300 text-xs">
              <li>
                <span className="text-slate-400">All Emergency Services:</span>{' '}
                <strong className="text-white">112</strong>
              </li>
              <li>
                <span className="text-slate-400">Electricity & Power Faults:</span>{' '}
                <strong className="text-white">1912</strong>
              </li>
              <li>
                <span className="text-slate-400">Jal Jeevan Water Helpline:</span>{' '}
                <strong className="text-white">1916</strong>
              </li>
              <li>
                <span className="text-slate-400">Gram Panchayat Civic Desk:</span>{' '}
                <strong className="text-white">1800-180-1551</strong>
              </li>
            </ul>
          </div>

          {/* Guidelines */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Citizen Guide</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every complaint is reviewed by an AI safety triage engine within seconds.
              Immediate safety threats receive HIGH priority dispatch within 24 hours.
            </p>
            <div className="mt-3 p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] text-slate-300">
              ⚡ <em>"Transparent governance starts with an empowered citizen."</em>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© 2026 Modern Village. Built for Empowered Rural Communities.</p>
          <div className="flex gap-4">
            <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-white transition cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
