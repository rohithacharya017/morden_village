// ==========================================================================
// MODERN VILLAGE DATA HUB & SIMULATION ENGINE
// ==========================================================================

export const VILLAGE_ZONES = {
  solar: {
    id: "solar",
    name: "Solar Microgrid & Wind Cluster",
    badge: "RENEWABLE POWER",
    image: "/assets/hero-village.jpg",
    desc: "Central clean energy harvesting park equipped with bifacial monocrystalline solar arrays and low-vibration helical wind turbines, delivering reliable 24/7 power to all 320 homesteads.",
    stats: [
      { label: "Peak Generation", value: "428.4 kW" },
      { label: "Battery Reserve (LFP)", value: "1.92 MWh (96%)" },
      { label: "Grid Inversion Efficiency", value: "99.1%" },
      { label: "Carbon Abated Today", value: "2.41 Tons" }
    ],
    targetTab: "telemetry"
  },
  farm: {
    id: "farm",
    name: "IoT Precision Hydroponics & Agro-Forest",
    badge: "PRECISION AGRI",
    image: "/assets/smart-farm.jpg",
    desc: "Automated aeroponic vertical towers and sensor-monitored orchards utilizing closed-loop nutrient cycling, saving 92% water while increasing heirloom crop yields threefold.",
    stats: [
      { label: "Active Tower Pods", value: "8 Towers" },
      { label: "Average Soil Moisture", value: "64% (Optimal)" },
      { label: "Drone Foliar Patrol", value: "Active • Squad #2" },
      { label: "Daily Harvest Output", value: "480 kg Organic" }
    ],
    targetTab: "agriculture"
  },
  water: {
    id: "water",
    name: "Rain Harvesting & Aquifer Sanctuary",
    badge: "HYDRO SECURITY",
    image: "/assets/hero-village.jpg",
    desc: "Decentralized natural bio-filtration wetlands and multi-stage ultraviolet treatment reservoir providing free, pristine drinking water dispensed via automated citizen smart-cards.",
    stats: [
      { label: "Stored Potable Volume", value: "142,500 Liters" },
      { label: "Water Purity / TDS", value: "68 ppm (Pristine)" },
      { label: "Daily Village Demand", value: "18,200 Liters" },
      { label: "Rain Capture Efficiency", value: "98.4%" }
    ],
    targetTab: "telemetry"
  },
  panchayat: {
    id: "panchayat",
    name: "E-Gram Panchayat & Democratic Forum",
    badge: "CIVIC GOVERNANCE",
    image: "/assets/hero-village.jpg",
    desc: "Decentralized digital town hall where all 1,420 registered citizens vote directly on communal eco-projects, municipal expenditures, and transparent resource allocation.",
    stats: [
      { label: "Active Quorum", value: "88.4% Registered" },
      { label: "Active Civic Ballots", value: "3 Open" },
      { label: "Audited Municipal Fund", value: "$148,250" },
      { label: "Green Project ROI", value: "+14.2% YoY" }
    ],
    targetTab: "panchayat"
  },
  health: {
    id: "health",
    name: "Telehealth Pavilion & Wellness Hub",
    badge: "RURAL HEALTHCARE",
    image: "/assets/solar-clinic.jpg",
    desc: "100% solar-powered medical outpost linked via high-speed low-latency satellite internet to top urban hospitals for diagnostic cardiology, maternal care, and rapid drone pharmacy.",
    stats: [
      { label: "Consulting Doctors", value: "3 Tele-Docs Live" },
      { label: "Current Wait Queue", value: "0 mins" },
      { label: "Drone Med Delivery", value: "Ready (Squad Alpha)" },
      { label: "Critical Care Beds", value: "4 Available" }
    ],
    targetTab: "telemetry"
  },
  market: {
    id: "market",
    name: "Artisan Cooperative & Farmer Mandi",
    badge: "FAIR-TRADE MARKET",
    image: "/assets/artisan-market.jpg",
    desc: "A cooperative hub eliminating middlemen, enabling local organic farmers, potters, and handloom weavers to sell directly to conscious consumers with 100% margin retention.",
    stats: [
      { label: "Registered Artisans", value: "42 Local Families" },
      { label: "Live Batches Today", value: "8 Harvest Specials" },
      { label: "Packaging Material", value: "100% Biodegradable" },
      { label: "Co-op Revenue Payout", value: "Instant Direct-UPI" }
    ],
    targetTab: "market"
  }
};

export const TELEMETRY_NODES = [
  { id: "NODE-SOLAR-01", name: "Bifacial Solar Canopy Ridge", subsystem: "Energy", param: "428.4 kW Output", status: "online", signal: "98% (LoRa)" },
  { id: "NODE-BESS-02", name: "Central LFP Storage Vault", subsystem: "Energy", param: "96.2% State of Charge", status: "online", signal: "100% (Fiber)" },
  { id: "NODE-AQUI-03", name: "North Wetland Bio-Reeds", subsystem: "Water", param: "TDS 68 ppm • Flow 14 L/s", status: "online", signal: "94% (LoRa)" },
  { id: "NODE-AGRI-04", name: "Hydroponic Tower Tier-4", subsystem: "Farming", param: "Moisture 64% • pH 6.2", status: "online", signal: "96% (Zigbee)" },
  { id: "NODE-CLIN-05", name: "Vaccine Cold Chain Vault", subsystem: "Healthcare", param: "3.2°C Temperature", status: "online", signal: "99% (LoRa)" },
  { id: "NODE-AQI-06", name: "Village Square Ambient Station", subsystem: "Atmosphere", param: "AQI 18 (Ultra Pure)", status: "online", signal: "95% (LoRa)" }
];

export const INITIAL_GRIEVANCES = [
  {
    id: "MV-CIVIC-2041",
    category: "Solar Street Lighting",
    title: "Dim LED Luminaire on East Canal Pathway",
    location: "Ward 1, East Canal Pedestrian Bridge",
    urgency: "Medium",
    contact: "Citizen #1084",
    desc: "Streetlight fixture #4 is operating at 30% brightness due to tree canopy overhanging the solar mini-panel.",
    status: "in_progress",
    date: "2026-10-19",
    assignedTo: "Karan S. (Lineman)"
  },
  {
    id: "MV-CIVIC-2042",
    category: "Water Supply & Filtration",
    title: "Smart Tap Sensor Calibration Required",
    location: "Ward 3 Community Dispenser",
    urgency: "Low",
    contact: "Citizen #0892",
    desc: "Card swipe sensor on Dispenser Unit 2 responds after 5-second delay. Flow rate is optimal.",
    status: "pending",
    date: "2026-10-20",
    assignedTo: "Unassigned"
  },
  {
    id: "MV-CIVIC-2043",
    category: "Organic Waste & Composting",
    title: "Bio-Digester Chamber 3 Scheduled Emptying",
    location: "South Terraced Kitchen Gardens",
    urgency: "Medium",
    contact: "Co-op Lead Meera",
    desc: "Community organic waste compost chamber #3 has reached full decomposition maturity. Ready for fertilizer bagging.",
    status: "in_progress",
    date: "2026-10-18",
    assignedTo: "Eco-Waste Crew B"
  },
  {
    id: "MV-CIVIC-2040",
    category: "Roads & Walkways",
    title: "Permeable Paver Stone Alignment Fix",
    location: "School Approach Lane",
    urgency: "Low",
    contact: "Headmaster Sharma",
    desc: "Tree roots slightly shifted two eco-paver tiles along bicycle track.",
    status: "resolved",
    date: "2026-10-15",
    assignedTo: "Pavement Guild"
  },
  {
    id: "MV-CIVIC-2039",
    category: "Digital Wi-Fi Tower",
    title: "Satellite Dish Alignment Following Gusts",
    location: "Community Library Roof",
    urgency: "High",
    contact: "Library Staff",
    desc: "Speed dropped to 40 Mbps after sudden storm winds.",
    status: "resolved",
    date: "2026-10-14",
    assignedTo: "Telecom Unit"
  },
  {
    id: "MV-CIVIC-2044",
    category: "Telemedicine Center",
    title: "Backup O₂ Concentrator Preventative Service",
    location: "Clinic Annex Ward 4",
    urgency: "Low",
    contact: "Dr. Anita V.",
    desc: "Regular 500-hour filter cleanse and pressure valve inspection for portable unit.",
    status: "pending",
    date: "2026-10-20",
    assignedTo: "Biomedical Tech"
  }
];

export const MANDI_RATES = [
  { crop: "Heirloom Basmati Rice", price: "₹4,250", unit: "per Quintal", trend: "+3.4%", isUp: true, state: "Surging" },
  { crop: "Organic Sharbati Wheat", price: "₹2,680", unit: "per Quintal", trend: "+1.8%", isUp: true, state: "Stable" },
  { crop: "Cold-Pressed Mustard Seed", price: "₹5,400", unit: "per Quintal", trend: "-0.6%", isUp: false, state: "Steady" },
  { crop: "High-Curcumin Turmeric", price: "₹9,800", unit: "per Quintal", trend: "+6.2%", isUp: true, state: "High Demand" },
  { crop: "Wild Multiflora Raw Honey", price: "₹650", unit: "per Kilogram", trend: "+4.1%", isUp: true, state: "Peak" },
  { crop: "Pure A2 Gir Cow Milk", price: "₹72", unit: "per Liter", trend: "0.0%", isUp: true, state: "Direct Farm" }
];

export const EQUIPMENT_POOL = [
  { id: "EQ-1", name: "Autonomous Electric 45HP Tractor", status: "Available", charge: "98% Solar", operator: "Trained Autonomous / Manual", action: "Book Slot" },
  { id: "EQ-2", name: "Laser Guided Land Leveler", status: "In Use (Ward 2)", charge: "Returns 04:00 PM", operator: "Co-op Driver Rajesh", action: "Join Waitlist" },
  { id: "EQ-3", name: "DJI Agras T40 Drone Sprayer", status: "Available", charge: "100% Ready", operator: "Village Drone Pilot", action: "Book Slot" },
  { id: "EQ-4", name: "Solar Biomass Dehydrator (100kg)", status: "Available", charge: "Active 65°C", operator: "Self-Serve Co-op", action: "Book Slot" }
];

export const PRODUCTS_CATALOG = [
  {
    id: "PROD-101",
    name: "Wildflower Forest Raw Honey (500g)",
    category: "pantry",
    price: 14.50,
    farmer: "Sunita & Tribal Women's Guild",
    image: "/assets/artisan-market.jpg",
    desc: "Unfiltered, unpasteurized honey harvested sustainably from native medicinal flowering tree groves."
  },
  {
    id: "PROD-102",
    name: "Cold-Pressed Organic Sesame Oil (1L)",
    category: "pantry",
    price: 18.00,
    farmer: "Ramesh Organic Mills",
    image: "/assets/artisan-market.jpg",
    desc: "Traditionally wood-churned (Kachi Ghani) at low temperature preserving vital antioxidants."
  },
  {
    id: "PROD-103",
    name: "Handcrafted Terracotta Water Carafe",
    category: "crafts",
    price: 24.00,
    farmer: "Clay Artisan Bholu Ram",
    image: "/assets/artisan-market.jpg",
    desc: "Naturally cooling earthen pitcher infused with river silt, maintaining mineral-rich 18°C drinking water."
  },
  {
    id: "PROD-104",
    name: "Hydroponic Crisp Lettuce & Kale Basket",
    category: "produce",
    price: 8.50,
    farmer: "Ward 4 Vertical Towers",
    image: "/assets/smart-farm.jpg",
    desc: "Harvested to order within 2 hours. Pesticide-free, crisp leaves enriched with organic bio-minerals."
  },
  {
    id: "PROD-105",
    name: "Handloom Organic Khadi Cotton Throw",
    category: "crafts",
    price: 36.00,
    farmer: "Modern Village Weavers Guild",
    image: "/assets/artisan-market.jpg",
    desc: "Spun on solar charkhas and colored with natural pomegranate peel and indigo botanical dyes."
  },
  {
    id: "PROD-106",
    name: "Heirloom Sun-Dried Golden Turmeric (250g)",
    category: "pantry",
    price: 9.00,
    farmer: "Lakshmi Organic Farm",
    image: "/assets/artisan-market.jpg",
    desc: "Laboratory-tested 6.8% high-curcumin rhizomes, stone ground and packed in eco-jute pouches."
  }
];

export const CITIZEN_PROPOSALS = [
  {
    id: "PROP-2026-04",
    title: "Expand Rooftop Solar to Ward 4 Community Stables & Dairy",
    sponsor: "Green Energy Working Group",
    desc: "Install an additional 45 kW bifacial solar canopy with shaded cattle loafing sheds, feeding extra 22 kW into the community cold-chain chiller.",
    budget: "$18,500 from Municipal Surplus",
    yesVotes: 842,
    noVotes: 64,
    totalQuorum: 1100,
    hasVoted: false,
    daysLeft: 4
  },
  {
    id: "PROP-2026-05",
    title: "Revitalize North Lake Wetland with Bio-Reed Swales",
    sponsor: "Eco-Watershed Committee",
    desc: "Create 2.4 hectares of native floating bio-islands to naturally boost water retention, migratory bird nesting, and downstream micro-irrigation quality.",
    budget: "$12,200 from Watershed Fund",
    yesVotes: 914,
    noVotes: 32,
    totalQuorum: 1100,
    hasVoted: false,
    daysLeft: 9
  },
  {
    id: "PROP-2026-06",
    title: "24/7 Autonomous Drone Delivery for Prescription Medicines",
    sponsor: "Village Healthcare Guild",
    desc: "Procure a second redundant weatherproof delivery drone dedicated exclusively to transporting emergency antivenoms, insulin, and pediatric kits to remote farm homesteads.",
    budget: "$14,000 from Rural Health Grant",
    yesVotes: 780,
    noVotes: 118,
    totalQuorum: 1100,
    hasVoted: false,
    daysLeft: 12
  }
];

export const TRANSLATIONS = {
  en: {
    tagline: "Smart Rural Eco-System",
    nav_overview: "Living Twin",
    nav_telemetry: "IoT Microgrid",
    nav_civic: "Civic Desk",
    nav_agri: "Agri-Tech",
    nav_market: "Marketplace",
    nav_panchayat: "E-Council",
    cart_label: "Cart",
    village_status_live: "SMART RURAL ECO-SYSTEM ONLINE",
    hero_title: "Welcome to Modern Village",
    hero_desc: "A self-sustaining, carbon-negative rural township pioneering solar microgrids, autonomous precision agriculture, zero-waste sanitation, and transparent democratic governance.",
    stat_clean_energy: "Clean Energy Self-Sufficiency",
    stat_population: "Resident Population",
    stat_water_reserve: "Safe Water Purity Index",
    stat_carbon: "Net Carbon Footprint",
    btn_explore_zones: "Explore Village Zones",
    btn_quick_grievance: "Report Civic Issue",
    btn_artisan_market: "Local Produce Store",
    twin_subtitle: "INTERACTIVE 2.5D ECO-BLUEPRINT",
    twin_title: "Village Digital Twin & Key Infrastructure"
  },
  hi: {
    tagline: "स्मार्ट ग्रामीण पारिस्थितिकी तंत्र",
    nav_overview: "डिजिटल मॉडल",
    nav_telemetry: "सौर माइक्रोग्रिड",
    nav_civic: "नागरिक सेवा",
    nav_agri: "कृषि-तकनीक",
    nav_market: "ग्राम हाट",
    nav_panchayat: "ई-पंचायत",
    cart_label: "झोला",
    village_status_live: "आधुनिक ग्राम प्रणाली सक्रिय",
    hero_title: "आधुनिक ग्राम में आपका स्वागत है",
    hero_desc: "सौर ऊर्जा, उन्नत जैविक कृषि, स्वच्छ जल और पारदर्शी ग्राम पंचायत से सशक्त भारत का आत्मनिर्भर आदर्श गांव।",
    stat_clean_energy: "स्वच्छ ऊर्जा आत्मनिर्भरता",
    stat_population: "ग्राम निवासी जनसंख्या",
    stat_water_reserve: "जल शुद्धता सूचकांक",
    stat_carbon: "कार्बन कटौती",
    btn_explore_zones: "ग्राम के प्रमुख क्षेत्र",
    btn_quick_grievance: "समस्या दर्ज करें",
    btn_artisan_market: "जैविक उत्पाद बाजार",
    twin_subtitle: "इंटरैक्टिव 2.5D ग्रामीण ब्लूप्रिंट",
    twin_title: "ग्राम डिजिटल ट्विन और बुनियादी ढांचा"
  },
  es: {
    tagline: "Ecosistema Rural Inteligente",
    nav_overview: "Gemelo Digital",
    nav_telemetry: "Microred IoT",
    nav_civic: "Atención Cívica",
    nav_agri: "Agri-Tecnología",
    nav_market: "Mercado Local",
    nav_panchayat: "Consejo Comunal",
    cart_label: "Cesta",
    village_status_live: "ECOSISTEMA RURAL EN LÍNEA",
    hero_title: "Bienvenidos a Modern Village",
    hero_desc: "Un municipio rural autosuficiente y carbono negativo, pionero en microredes solares, agricultura de precisión y gobernanza comunitaria.",
    stat_clean_energy: "Autosuficiencia Energética",
    stat_population: "Población Residente",
    stat_water_reserve: "Índice de Pureza del Agua",
    stat_carbon: "Huella de Carbono",
    btn_explore_zones: "Explorar Zonas del Pueblo",
    btn_quick_grievance: "Reportar Problema",
    btn_artisan_market: "Tienda de Productos",
    twin_subtitle: "PLANO INTERACTIVO 2.5D",
    twin_title: "Gemelo Digital e Infraestructura"
  }
};
