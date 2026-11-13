import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ComplaintProvider, useComplaints } from './context/ComplaintContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ComplaintDetailModal from './components/ComplaintDetailModal';
import QuickTrackerModal from './components/QuickTrackerModal';
import Chatbot from './components/Chatbot';

// Pages
import LandingPage from './pages/LandingPage';
import VillagerAuthPage from './pages/VillagerAuthPage';
import VillagerDashboard from './pages/VillagerDashboard';
import ReportProblemPage from './pages/ReportProblemPage';
import PanchayatLoginPage from './pages/PanchayatLoginPage';
import PanchayatDashboard from './pages/PanchayatDashboard';
import PanchayatReports from './pages/PanchayatReports';
import GovernmentSchemesPage from './pages/GovernmentSchemesPage';

function AppContent() {
  const { isVillager, isPanchayat } = useAuth();
  const { complaints } = useComplaints();

  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // Selected complaint object
  const selectedComplaint = selectedComplaintId
    ? complaints.find((c) => c.id === selectedComplaintId)
    : null;

  // Navigation router with strict role authorization
  const navigate = (page) => {
    // Restrict Panchayat Dashboard & Reports to authorized Panchayat Officials only
    if (page === 'panchayat_dashboard' || page === 'panchayat_reports') {
      if (!isPanchayat) {
        if (isVillager) {
          alert('Access Denied: Villagers cannot access the Gram Panchayat administrative desk. You are being redirected to your Citizen Dashboard.');
          setCurrentPage('villager_dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        } else {
          setCurrentPage('panchayat_login');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectComplaint = (id) => {
    setSelectedComplaintId(id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Top Navbar */}
      <Navbar
        onNavigate={navigate}
        currentPage={currentPage}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onSelectComplaint={handleSelectComplaint}
      />

      {/* Main Page View */}
      <main className="flex-1">
        {currentPage === 'landing' && (
          <LandingPage
            onNavigate={navigate}
            onOpenTracker={() => setIsTrackerOpen(true)}
          />
        )}

        {currentPage === 'villager_auth' && (
          <VillagerAuthPage onNavigate={navigate} />
        )}

        {currentPage === 'villager_dashboard' && (
          <VillagerDashboard
            onNavigate={navigate}
            onSelectComplaint={handleSelectComplaint}
          />
        )}

        {currentPage === 'report_problem' && (
          <ReportProblemPage
            onNavigate={navigate}
            onSelectComplaint={handleSelectComplaint}
          />
        )}

        {currentPage === 'panchayat_login' && (
          <PanchayatLoginPage onNavigate={navigate} />
        )}

        {currentPage === 'government_schemes' && (
          <GovernmentSchemesPage onNavigate={navigate} />
        )}

        {/* Protected Panchayat Dashboard */}
        {currentPage === 'panchayat_dashboard' && (
          isPanchayat ? (
            <PanchayatDashboard
              onNavigate={navigate}
              onSelectComplaint={handleSelectComplaint}
            />
          ) : (
            <div className="max-w-xl mx-auto my-16 px-4 animate-fade-in text-center">
              <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-xl space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Access Restricted to Panchayat Officials
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Villagers are strictly prohibited from viewing or accessing the Gram Panchayat grievance desk and other residents' complaints. Villagers may only view complaints they have personally submitted.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate(isVillager ? 'villager_dashboard' : 'panchayat_login')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    {isVillager ? 'Go to My Citizen Dashboard' : 'Panchayat Official Sign In'}
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {/* Protected Panchayat Reports */}
        {currentPage === 'panchayat_reports' && (
          isPanchayat ? (
            <PanchayatReports onNavigate={navigate} />
          ) : (
            <div className="max-w-xl mx-auto my-16 px-4 animate-fade-in text-center">
              <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-xl space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Access Restricted
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Only verified Gram Panchayat officials can view analytics and village-wide reports.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate(isVillager ? 'villager_dashboard' : 'panchayat_login')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    {isVillager ? 'Go to My Citizen Dashboard' : 'Panchayat Official Sign In'}
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={navigate}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      {/* Modals */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaintId(null)}
          onSelectComplaint={handleSelectComplaint}
        />
      )}

      <QuickTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        onSelectComplaint={handleSelectComplaint}
      />

      {/* GRAMITRA Chatbot */}
      <Chatbot
        onNavigate={navigate}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onSelectComplaint={handleSelectComplaint}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ComplaintProvider>
        <AppContent />
      </ComplaintProvider>
    </AuthProvider>
  );
}
