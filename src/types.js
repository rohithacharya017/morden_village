// ==========================================================================
// MODERN VILLAGE - CATEGORIES & CONSTANTS
// ==========================================================================

export const COMPLAINT_CATEGORIES = [
  {
    id: "electrical",
    name: "Electrical Problems",
    description: "Damaged streetlights, power-related public infrastructure issues, exposed public wiring.",
    iconName: "Zap",
    color: "amber"
  },
  {
    id: "water",
    name: "Water Supply",
    description: "Water shortage, pipeline leakage, contaminated water, broken public taps.",
    iconName: "Droplet",
    color: "blue"
  },
  {
    id: "roads",
    name: "Roads and Transportation",
    description: "Potholes, damaged roads, blocked public paths, damaged public signs.",
    iconName: "Truck",
    color: "orange"
  },
  {
    id: "waste",
    name: "Waste Management and Sanitation",
    description: "Garbage accumulation, overflowing bins, drainage blockage, sanitation issues.",
    iconName: "Trash2",
    color: "emerald"
  },
  {
    id: "property",
    name: "Public Property Damage",
    description: "Damaged government buildings, faded wall paint, peeling plaster, broken benches, damaged public facilities.",
    iconName: "Building2",
    color: "red"
  },
  {
    id: "drainage",
    name: "Drainage and Sewage",
    description: "Overflowing drains, sewage leakage, clogged drainage.",
    iconName: "Waves",
    color: "cyan"
  },
  {
    id: "streetlights",
    name: "Streetlights and Public Lighting",
    description: "Non-working streetlights, dark public roads.",
    iconName: "Sun",
    color: "yellow"
  },
  {
    id: "parks",
    name: "Parks and Public Spaces",
    description: "Damaged playground equipment, neglected public spaces.",
    iconName: "Trees",
    color: "green"
  },
  {
    id: "animals",
    name: "Animal-Related Public Issues",
    description: "Stray animal concerns or public animal hazards.",
    iconName: "Dog",
    color: "purple"
  },
  {
    id: "other",
    name: "Other",
    description: "Any village problem that does not fit the listed categories.",
    iconName: "HelpCircle",
    color: "slate"
  }
];

export const STATUS_TYPES = {
  PENDING: {
    label: "Pending",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
    step: 1
  },
  ACKNOWLEDGED: {
    label: "Acknowledged",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    step: 2
  },
  IN_PROGRESS: {
    label: "In Progress",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    step: 3
  },
  COMPLETED: {
    label: "Completed",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    step: 4
  },
  REOPENED: {
    label: "Reopened",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    step: 2
  }
};

export const PRIORITY_TYPES = {
  HIGH: {
    label: "HIGH",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    borderClass: "border-red-200",
    dotClass: "bg-red-500",
    sortOrder: 1
  },
  MEDIUM: {
    label: "MEDIUM",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
    dotClass: "bg-amber-500",
    sortOrder: 2
  },
  LOW: {
    label: "LOW",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
    dotClass: "bg-emerald-500",
    sortOrder: 3
  }
};
