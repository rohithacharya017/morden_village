import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { SCHEME_CATEGORIES, OFFICIAL_PORTALS, VERIFIED_SCHEMES } from '../data/schemesData';
import { schemeService } from '../services/supabase';
import SchemeDetailModal from '../components/SchemeDetailModal';
import {
  Search,
  Filter,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Building2,
  Landmark,
  ArrowLeft,
  Calendar,
  Eye,
  Info,
  ShieldAlert,
  Sparkles,
  LayoutGrid,
  Wheat,
  Home,
  GraduationCap,
  HeartPulse,
  Briefcase,
  Users2,
  Trees,
  Droplets,
  AlertCircle
} from 'lucide-react';

// Icon Map helper for Category Pills
const CATEGORY_ICON_MAP = {
  all: LayoutGrid,
  agriculture: Wheat,
  housing: Home,
  education: GraduationCap,
  health: HeartPulse,
  employment: Briefcase,
  women_child: Users2,
  rural_dev: Trees,
  sanitation_water: Droplets,
  pension_welfare: ShieldAlert,
  karnataka_state: Landmark
};

export default function GovernmentSchemesPage({ onNavigate }) {
  const { isVillager, isPanchayat } = useAuth();

  // State
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGovLevel, setSelectedGovLevel] = useState('all'); // 'all', 'Central Government', 'Karnataka State Government'
  const [selectedScheme, setSelectedScheme] = useState(null);

  // Load schemes from Supabase service (with robust local fallback)
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await schemeService.getSchemes();
        if (isMounted) {
          setSchemes(data && data.length > 0 ? data : VERIFIED_SCHEMES);
        }
      } catch (err) {
        console.error('Failed to load government schemes:', err);
        if (isMounted) {
          // Graceful fallback to verified built-in dataset
          setSchemes(VERIFIED_SCHEMES);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Filtered schemes computation
  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      // 1. Government level filter
      if (selectedGovLevel !== 'all' && s.government_level !== selectedGovLevel) {
        return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all') {
        const catObj = SCHEME_CATEGORIES.find((c) => c.id === selectedCategory);
        if (catObj) {
          const matchesCategory =
            s.category_id === selectedCategory ||
            s.category === catObj.name ||
            (selectedCategory === 'karnataka_state' && s.government_level === 'Karnataka State Government');
          if (!matchesCategory) return false;
        }
      }

      // 3. Search query matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = (s.name || '').toLowerCase().includes(query);
        const descMatch = (s.short_description || '').toLowerCase().includes(query);
        const benefitsMatch = (s.benefits || '').toLowerCase().includes(query);
        const categoryMatch = (s.category || '').toLowerCase().includes(query);
        const tagsMatch = Array.isArray(s.tags) && s.tags.some(tag => tag.toLowerCase().includes(query));

        if (!nameMatch && !descMatch && !benefitsMatch && !categoryMatch && !tagsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [schemes, selectedCategory, selectedGovLevel, searchQuery]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedGovLevel !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedGovLevel('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Breadcrumb & Navigation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isVillager) onNavigate('villager_dashboard');
              else if (isPanchayat) onNavigate('panchayat_dashboard');
              else onNavigate('landing');
            }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-emerald-700 bg-white hover:bg-emerald-50 px-3.5 py-2 rounded-xl border border-slate-200 transition shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" />
            <span>
              {isVillager ? 'Back to My Citizen Dashboard' : isPanchayat ? 'Back to Complaints Desk' : 'Back to Home'}
            </span>
          </button>

          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 transition shadow-xs cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <span className="text-slate-400">Portal:</span>
          <span className="font-bold text-slate-700">Central & State Welfare Desk</span>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
            <Landmark className="w-3.5 h-3.5 text-amber-300" />
            <span>Modern Village Civic Desk</span>
            <span>•</span>
            <span>Central & Karnataka State Welfare</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Explore Government Welfare Schemes
          </h1>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Official Central & Karnataka State Government citizen programs, verified eligibility criteria, required documents, and direct application links for villagers.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-emerald-200/90">
            <span className="flex items-center gap-1.5 bg-emerald-900/50 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Verified Information
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-900/50 px-2.5 py-1 rounded-lg">
              <ExternalLink className="w-4 h-4 text-amber-300" />
              Direct Official Portal Access
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-900/50 px-2.5 py-1 rounded-lg">
              <Sparkles className="w-4 h-4 text-teal-300" />
              Free Citizen Guidance
            </span>
          </div>
        </div>

        {/* Subtle decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Mandatory Civic Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm text-amber-950">
          <p className="font-extrabold text-amber-900">
            Important Public Notice:
          </p>
          <p className="leading-relaxed font-medium text-amber-900/95">
            "Modern Village is an informational civic portal. We do not approve, process, or guarantee government benefits. All citizen applications must be submitted directly through official government portals or at your local Gram Panchayat office."
          </p>
          <p className="text-[11px] sm:text-xs text-amber-800/80 pt-0.5">
            Modern Village does not charge fees, promise approvals, or collect Aadhaar or bank details to browse schemes. All applications are submitted securely via official government portals or at the local Gram Panchayat office.
          </p>
        </div>
      </div>

      {/* Official Government Portals Quick Access Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <span>Verified Government Portals</span>
          </h3>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Official starting points
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {OFFICIAL_PORTALS.map((portal, idx) => (
            <a
              key={idx}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-500 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {portal.badge}
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                  {portal.name}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {portal.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                <span>Visit Portal</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Search and Filter Control Center */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-8 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schemes by name, keyword, or benefits..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-full"
              >
                Clear
              </button>
            )}
          </div>

          {/* Government Level Filter */}
          <div className="md:col-span-4">
            <div className="relative">
              <select
                value={selectedGovLevel}
                onChange={(e) => setSelectedGovLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition appearance-none cursor-pointer"
              >
                <option value="all">🏛️ All Governance Levels</option>
                <option value="Central Government">🇮🇳 Central Government</option>
                <option value="Karnataka State Government">🟡🔴 Karnataka State Government</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Category Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {SCHEME_CATEGORIES.map((cat) => {
              const IconComponent = CATEGORY_ICON_MAP[cat.id] || LayoutGrid;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 shadow-2xs ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-emerald-700/20'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5 shrink-0" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filters Summary Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            <span>Showing schemes: </span>
            <strong className="text-slate-900 font-bold">{filteredSchemes.length}</strong>{' '}
            <span>matching schemes</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-emerald-700 font-bold hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Schemes Grid Display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs animate-pulse space-y-4">
              <div className="h-5 bg-slate-200 rounded-md w-1/3" />
              <div className="h-7 bg-slate-200 rounded-md w-4/5" />
              <div className="h-16 bg-slate-100 rounded-md" />
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredSchemes.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-extrabold text-slate-900">
            No Schemes Found
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Try adjusting your search terms or category filters to find relevant welfare schemes.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => {
            const isKarnataka = scheme.government_level === 'Karnataka State Government' || scheme.category_id === 'karnataka_state';
            const name = scheme.name;
            const category = scheme.category;
            const description = scheme.short_description;
            const benefits = scheme.benefits;
            const govLevel = scheme.government_level;

            return (
              <div
                key={scheme.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500 shadow-sm hover:shadow-lg transition flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header Top */}
                <div className="p-6 space-y-4 flex-1">
                  {/* Classification Pill */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      isKarnataka
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}>
                      {isKarnataka ? <Landmark className="w-3 h-3 text-amber-700" /> : <Building2 className="w-3 h-3 text-emerald-700" />}
                      <span>{govLevel}</span>
                    </span>

                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {category}
                    </span>
                  </div>

                  {/* Scheme Name */}
                  <h3
                    onClick={() => setSelectedScheme(scheme)}
                    className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-emerald-700 transition cursor-pointer leading-snug line-clamp-2"
                  >
                    {name}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {description}
                  </p>

                  {/* Key Benefits Callout */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 text-xs text-emerald-950 font-medium">
                    <span className="font-bold text-emerald-900 block mb-0.5">
                      💡 Key Benefits:
                    </span>
                    <span className="line-clamp-2">{benefits}</span>
                  </div>

                  {/* Verification Date Metadata */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Last verified: {scheme.last_verified_date}
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Verified Scheme</span>
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedScheme(scheme)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 font-bold text-xs border border-slate-200 transition flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>View Details</span>
                    </button>

                    {scheme.official_url && (
                      <a
                        href={scheme.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
                        title="Official Source"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {scheme.apply_url && (
                    <a
                      href={scheme.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-700/20"
                    >
                      <span>Apply on Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scheme Detail Modal */}
      <SchemeDetailModal
        scheme={selectedScheme}
        isOpen={Boolean(selectedScheme)}
        onClose={() => setSelectedScheme(null)}
      />
    </div>
  );
}
