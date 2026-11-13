import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import {
  Shield,
  Home,
  FilePlus,
  ListFilter,
  BarChart3,
  LogOut,
  User,
  Building2,
  Search,
  Sparkles,
  Landmark,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ onNavigate, currentPage, onOpenTracker, onSelectComplaint }) {
  const { currentUser, isVillager, isPanchayat, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page) => {
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  const handleTrackerClick = () => {
    setMobileMenuOpen(false);
    onOpenTracker();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo & Title */}
          <div
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  Modern Village
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" /> AI Powered
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Your Village. Your Voice. Our Responsibility.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Items based on role */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600">
            <button
              onClick={() => handleNavClick('landing')}
              className={`px-3 py-1.5 rounded-xl transition ${
                currentPage === 'landing' ? 'text-emerald-700 bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            {/* Central & State Government Schemes (Villagers & Citizens only, hidden from Panchayat Admin) */}
            {!isPanchayat && (
              <button
                onClick={() => handleNavClick('government_schemes')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  currentPage === 'government_schemes'
                    ? 'text-emerald-700 bg-emerald-50 font-bold ring-1 ring-emerald-200'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Landmark className="w-4 h-4 text-emerald-600" />
                <span>Govt Schemes</span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md uppercase tracking-tight">
                  Yojana
                </span>
              </button>
            )}

            {isVillager && (
              <>
                <button
                  onClick={() => handleNavClick('villager_dashboard')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    currentPage === 'villager_dashboard' ? 'text-emerald-700 bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Dashboard
                </button>
                <button
                  onClick={() => handleNavClick('report_problem')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>Report a Problem</span>
                </button>
              </>
            )}

            {isPanchayat && (
              <>
                <button
                  onClick={() => handleNavClick('panchayat_dashboard')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    currentPage === 'panchayat_dashboard' ? 'text-emerald-700 bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Complaints Desk
                </button>
                <button
                  onClick={() => handleNavClick('panchayat_reports')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                    currentPage === 'panchayat_reports' ? 'text-emerald-700 bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Reports & Analytics</span>
                </button>
              </>
            )}

            <button
              onClick={handleTrackerClick}
              className="px-3 py-1.5 rounded-xl hover:text-emerald-700 hover:bg-emerald-50 transition flex items-center gap-1 text-slate-500 font-medium"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Ticket</span>
            </button>
          </nav>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            {currentUser && (
              <NotificationDropdown onSelectComplaint={onSelectComplaint} />
            )}

            {/* User Profile Pill or Login CTA */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div
                  onClick={() => handleNavClick(isVillager ? 'villager_dashboard' : 'panchayat_dashboard')}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 cursor-pointer transition"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                      isPanchayat ? 'bg-blue-600' : 'bg-emerald-600'
                    }`}
                  >
                    {isPanchayat ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.full_name}
                    </p>
                    <span className="text-[10px] text-slate-500 capitalize block leading-tight">
                      {isPanchayat ? (currentUser.designation || 'Panchayat Official') : 'Citizen Resident'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('villager_auth')}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
                >
                  Villager Login
                </button>
                <button
                  onClick={() => handleNavClick('panchayat_login')}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs"
                >
                  Panchayat Official
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-2 animate-fade-in">
            <div className="grid grid-cols-1 gap-1 text-sm font-semibold text-slate-700">
              <button
                onClick={() => handleNavClick('landing')}
                className={`w-full text-left px-4 py-2.5 rounded-xl transition flex items-center gap-2.5 ${
                  currentPage === 'landing' ? 'text-emerald-700 bg-emerald-50 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <Home className="w-4 h-4 text-emerald-600" />
                <span>Home</span>
              </button>

              {/* Govt Schemes in Mobile Nav (Villagers & Citizens only, hidden from Panchayat Admin) */}
              {!isPanchayat && (
                <button
                  onClick={() => handleNavClick('government_schemes')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition flex items-center justify-between ${
                    currentPage === 'government_schemes' ? 'text-emerald-700 bg-emerald-50 font-bold ring-1 ring-emerald-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Landmark className="w-4 h-4 text-emerald-600" />
                    <span>Government Schemes</span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase">
                    Yojana
                  </span>
                </button>
              )}

              {isVillager && (
                <>
                  <button
                    onClick={() => handleNavClick('villager_dashboard')}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition flex items-center gap-2.5 ${
                      currentPage === 'villager_dashboard' ? 'text-emerald-700 bg-emerald-50 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>My Citizen Dashboard</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('report_problem')}
                    className="w-full text-left px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold transition flex items-center gap-2.5 shadow-xs"
                  >
                    <FilePlus className="w-4 h-4" />
                    <span>Report a Problem</span>
                  </button>
                </>
              )}

              {isPanchayat && (
                <>
                  <button
                    onClick={() => handleNavClick('panchayat_dashboard')}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition flex items-center gap-2.5 ${
                      currentPage === 'panchayat_dashboard' ? 'text-emerald-700 bg-emerald-50 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Complaints Desk</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('panchayat_reports')}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition flex items-center gap-2.5 ${
                      currentPage === 'panchayat_reports' ? 'text-emerald-700 bg-emerald-50 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span>Reports & Analytics</span>
                  </button>
                </>
              )}

              <button
                onClick={handleTrackerClick}
                className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-600 transition flex items-center gap-2.5"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Track Complaint Status</span>
              </button>
            </div>

            {!currentUser && (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => handleNavClick('villager_auth')}
                  className="w-full py-2.5 text-center text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
                >
                  Citizen Villager Login / Register
                </button>
                <button
                  onClick={() => handleNavClick('panchayat_login')}
                  className="w-full py-2.5 text-center text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs"
                >
                  Panchayat Official Sign In
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
