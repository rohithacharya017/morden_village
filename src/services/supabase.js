// ==========================================================================
// MODERN VILLAGE - SUPABASE CLIENT & RESILIENT DATA PROVIDER
// Dual-Mode Architecture: Live Supabase with Full Local Offline Fallback
// ==========================================================================

import { createClient } from '@supabase/supabase-js';
import { VERIFIED_SCHEMES } from '../data/schemesData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================================================
// SEED DATA FOR LOCAL REPOSITORY
// ==========================================================================

const SEED_COMPLAINTS = [
  {
    id: "complaint-1",
    complaint_number: "MV-2026-00001",
    reporter_id: "villager-1",
    reporter_name_snapshot: "Rameshwar Patel",
    reporter_mobile_snapshot: "9876543210",
    title: "High-voltage wire snapped near Primary School pathway",
    category: "Electrical Problems",
    description: "An overhead 440V wire snapped during yesterday's high winds and is hanging 4 feet above the pathway where children walk to the government school. Immediate hazard of electrocution.",
    village_name: "Kandavara Gram Panchayat",
    latitude: 25.3176,
    longitude: 82.9739,
    location_address: "Ward 3, East Approach Lane near Govt Primary School",
    image_url: "/assets/hero-village.jpg",
    priority: "HIGH",
    priority_reason: "Exposed live electrical wiring in pedestrian route creates an immediate electrocution hazard.",
    priority_source: "AI Classification",
    precaution: "Keep people, children, and livestock at least 15 feet away. Do not attempt to touch or move the wire even with wooden sticks.",
    status: "ACKNOWLEDGED",
    acknowledged_at: "2026-10-20T08:30:00Z",
    acknowledged_by: "Panchayat Secretary Sharma",
    completed_at: null,
    completed_by: null,
    completion_note: null,
    created_at: "2026-10-20T06:15:00Z",
    updated_at: "2026-10-20T08:30:00Z"
  },
  {
    id: "complaint-2",
    complaint_number: "MV-2026-00002",
    reporter_id: "villager-2",
    reporter_name_snapshot: "Sunita Devi",
    reporter_mobile_snapshot: "9812345678",
    title: "Main drinking water pipeline cracked with muddy ingress",
    category: "Water Supply",
    description: "The 3-inch distribution pipe near Community Well #2 has a major fracture. Turbid brown water is reaching 35 households, making drinking water unsafe.",
    village_name: "Kandavara Gram Panchayat",
    latitude: 25.3210,
    longitude: 82.9780,
    location_address: "Ward 1, Beside Community Well #2",
    image_url: "/assets/hero-village.jpg",
    priority: "HIGH",
    priority_reason: "Suspected bacterial/sediment contamination in municipal drinking supply threatens resident health.",
    priority_source: "AI Classification",
    precaution: "Do not consume tap water directly. Boil all drinking water for at least 3 minutes before household use until line pressure is restored.",
    status: "IN_PROGRESS",
    acknowledged_at: "2026-10-19T10:00:00Z",
    acknowledged_by: "Panchayat Secretary Sharma",
    completed_at: null,
    completed_by: null,
    completion_note: null,
    created_at: "2026-10-19T07:45:00Z",
    updated_at: "2026-10-19T14:20:00Z"
  },
  {
    id: "complaint-3",
    complaint_number: "MV-2026-00003",
    reporter_id: "villager-1",
    reporter_name_snapshot: "Rameshwar Patel",
    reporter_mobile_snapshot: "9876543210",
    title: "Streetlight luminaire dead at Market Crossing",
    category: "Streetlights and Public Lighting",
    description: "The solar streetlight pole at the four-way market intersection has not lit up for 4 nights. Dark road increases bicycle accident risk at night.",
    village_name: "Kandavara Gram Panchayat",
    latitude: 25.3195,
    longitude: 82.9712,
    location_address: "Ward 4, Weekly Haat Bazaar Intersection",
    image_url: "/assets/artisan-market.jpg",
    priority: "MEDIUM",
    priority_reason: "Non-working lighting at busy intersection degrades nighttime public mobility.",
    priority_source: "AI Classification",
    precaution: "Carry a flashlight or mobile torch after sundown and ride bicycles at cautious slow speeds near the dark intersection.",
    status: "PENDING",
    acknowledged_at: null,
    acknowledged_by: null,
    completed_at: null,
    completed_by: null,
    completion_note: null,
    created_at: "2026-10-20T14:10:00Z",
    updated_at: "2026-10-20T14:10:00Z"
  },
  {
    id: "complaint-4",
    complaint_number: "MV-2026-00004",
    reporter_id: "villager-3",
    reporter_name_snapshot: "Anil Yadav",
    reporter_mobile_snapshot: "9823456789",
    title: "Overflowing compost bin near dairy shed",
    category: "Waste Management and Sanitation",
    description: "The community organic waste collection point is full and spilling onto the side drain. Bad odor and flies accumulating.",
    village_name: "Kandavara Gram Panchayat",
    latitude: 25.3150,
    longitude: 82.9690,
    location_address: "Ward 2, Dairy Cooperative Gate",
    image_url: "/assets/smart-farm.jpg",
    priority: "MEDIUM",
    priority_reason: "Accumulated organic waste creates local odor and sanitation concerns.",
    priority_source: "AI Classification",
    precaution: "Keep children away from the waste mound and avoid discarding raw food nearby until waste clearance completes.",
    status: "COMPLETED",
    acknowledged_at: "2026-10-18T09:00:00Z",
    acknowledged_by: "Junior Engineer Verma",
    completed_at: "2026-10-18T16:30:00Z",
    completed_by: "Junior Engineer Verma",
    completion_note: "Waste cleared by sanitation crew and transported to bio-methanation plant. New cover installed.",
    created_at: "2026-10-18T06:30:00Z",
    updated_at: "2026-10-18T16:30:00Z"
  },
  {
    id: "complaint-5",
    complaint_number: "MV-2026-00005",
    reporter_id: "villager-2",
    reporter_name_snapshot: "Sunita Devi",
    reporter_mobile_snapshot: "9812345678",
    title: "Community Park Bench wooden slat broken",
    category: "Parks and Public Spaces",
    description: "One wooden slat on the park bench near the herbal garden has cracked. Minor issue, needs replacement.",
    village_name: "Kandavara Gram Panchayat",
    latitude: 25.3188,
    longitude: 82.9755,
    location_address: "Ward 1, Amrit Sarovar Park",
    image_url: "/assets/hero-village.jpg",
    priority: "LOW",
    priority_reason: "Cosmetic repair with no immediate safety hazard.",
    priority_source: "AI Classification",
    precaution: "Avoid sitting on this section of the bench and advise visitors to use adjacent seating until wooden slats are replaced.",
    status: "PENDING",
    acknowledged_at: null,
    acknowledged_by: null,
    completed_at: null,
    completed_by: null,
    completion_note: null,
    created_at: "2026-10-20T16:00:00Z",
    updated_at: "2026-10-20T16:00:00Z"
  },
  {
    id: "complaint-6",
    complaint_number: "MV-2026-00006",
    reporter_id: "villager-1",
    reporter_name_snapshot: "Rameshwar Patel",
    reporter_mobile_snapshot: "9876543210",
    title: "Faded whitewash and peeling wall paint on Panchayat Bhavan boundary",
    category: "Public Property Damage",
    description: "The exterior perimeter wall paint has faded and peeled off due to monsoon rains. Requires repainting and surface plaster touch-up.",
    village_name: "Kandavara Gram Panchayat",
    latitude: 25.3180,
    longitude: 82.9740,
    location_address: "Ward 3, Panchayat Bhavan Outer Wall",
    image_url: "/assets/hero-village.jpg",
    priority: "LOW",
    priority_reason: "Superficial cosmetic degradation; no structural weakness or public safety threat detected.",
    priority_source: "AI Visual Classification",
    precaution: "Keep the area dry and free of damp waste; avoid scratching loose plaster until painters apply weather-coat primer.",
    status: "PENDING",
    acknowledged_at: null,
    acknowledged_by: null,
    completed_at: null,
    completed_by: null,
    completion_note: null,
    created_at: "2026-10-21T09:30:00Z",
    updated_at: "2026-10-21T09:30:00Z"
  }
];

const SEED_NOTIFICATIONS = [
  {
    id: "notif-1",
    recipient_id: "villager-3",
    complaint_id: "complaint-4",
    title: "Complaint Resolved! 🎉",
    message: "Your complaint MV-2026-00004 'Overflowing compost bin near dairy shed' has been resolved by Gram Panchayat.",
    notification_type: "completion",
    read_at: null,
    created_at: "2026-10-18T16:30:00Z"
  },
  {
    id: "notif-2",
    recipient_id: "villager-1",
    complaint_id: "complaint-1",
    title: "Complaint Acknowledged",
    message: "Your complaint MV-2026-00001 'High-voltage wire snapped near Primary School' has been acknowledged by Panchayat Secretary Sharma. Inspection team dispatched.",
    notification_type: "acknowledgement",
    read_at: null,
    created_at: "2026-10-20T08:30:00Z"
  }
];

// Initialize LocalStorage if empty or sanitize stale blob URLs
function initLocalStorage() {
  const existingComplaints = localStorage.getItem('mv_complaints');
  if (!existingComplaints) {
    localStorage.setItem('mv_complaints', JSON.stringify(SEED_COMPLAINTS));
  } else {
    // Sanitize any dead blob URLs from prior sessions
    try {
      const parsed = JSON.parse(existingComplaints);
      let modified = false;
      parsed.forEach(c => {
        if (c.image_url && c.image_url.startsWith('blob:')) {
          c.image_url = '/assets/hero-village.jpg'; // graceful recovery fallback
          modified = true;
        }
        if (c.village_name && c.village_name.includes('Rampur')) {
          c.village_name = c.village_name.replace(/Rampur/g, 'Kandavara');
          modified = true;
        }
        if (c.location_address && c.location_address.includes('Rampur')) {
          c.location_address = c.location_address.replace(/Rampur/g, 'Kandavara');
          modified = true;
        }
      });
      if (modified) {
        localStorage.setItem('mv_complaints', JSON.stringify(parsed));
      }
    } catch (e) {
      console.warn('Failed to sanitize stale complaints:', e);
    }
  }

  if (!localStorage.getItem('mv_notifications')) {
    localStorage.setItem('mv_notifications', JSON.stringify(SEED_NOTIFICATIONS));
  }
  if (!localStorage.getItem('mv_history')) {
    localStorage.setItem('mv_history', JSON.stringify([]));
  }
}

initLocalStorage();

// ==========================================================================
// RESILIENT REPOSITORY API (Supabase with Local Fallback)
// ==========================================================================

export const DataRepo = {
  // Fetch complaints
  async getComplaints(filter = {}) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('complaints').select('*');
        if (filter.reporter_id) query = query.eq('reporter_id', filter.reporter_id);
        if (filter.status) query = query.eq('status', filter.status);
        if (filter.priority) query = query.eq('priority', filter.priority);

        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store:', err);
      }
    }

    // Local fallback
    const all = JSON.parse(localStorage.getItem('mv_complaints') || '[]');
    let result = all;
    if (filter.reporter_id) {
      result = result.filter(c => c.reporter_id === filter.reporter_id);
    }
    if (filter.status) {
      result = result.filter(c => c.status === filter.status);
    }
    if (filter.priority) {
      result = result.filter(c => c.priority === filter.priority);
    }
    return result;
  },

  // Save new complaint
  async createComplaint(complaintData) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('complaints').insert([complaintData]).select();
        if (!error && data?.[0]) return data[0];
      } catch (err) {
        console.warn('Supabase insert failed, using local store:', err);
      }
    }

    // Local fallback: generate sequenced complaint number
    const all = JSON.parse(localStorage.getItem('mv_complaints') || '[]');
    const nextSeq = String(all.length + 1).padStart(5, '0');
    const complaintNumber = `MV-2026-${nextSeq}`;

    const newRecord = {
      id: `complaint-${Date.now()}`,
      complaint_number: complaintNumber,
      ...complaintData,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    all.unshift(newRecord);
    localStorage.setItem('mv_complaints', JSON.stringify(all));

    // Also add to audit history
    this.addAuditHistory({
      complaint_id: newRecord.id,
      previous_status: null,
      new_status: 'PENDING',
      changed_by: complaintData.reporter_name_snapshot,
      change_note: 'Complaint lodged by citizen.'
    });

    return newRecord;
  },

  // Update complaint status / acknowledgement / completion
  async updateComplaint(id, updates, changedBy = 'Panchayat Official', note = '') {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('complaints').update(updates).eq('id', id).select();
        if (!error && data?.[0]) {
          return data[0];
        }
      } catch (err) {
        console.warn('Supabase update failed, using local store:', err);
      }
    }

    // Local fallback
    const all = JSON.parse(localStorage.getItem('mv_complaints') || '[]');
    const index = all.findIndex(c => c.id === id);
    if (index === -1) return null;

    const previousStatus = all[index].status;
    const updated = {
      ...all[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    all[index] = updated;
    localStorage.setItem('mv_complaints', JSON.stringify(all));

    // Audit trail
    if (updates.status && updates.status !== previousStatus) {
      this.addAuditHistory({
        complaint_id: id,
        previous_status: previousStatus,
        new_status: updates.status,
        changed_by: changedBy,
        change_note: note || `Status updated from ${previousStatus} to ${updates.status}`
      });
    }

    return updated;
  },

  // Delete complaint
  async deleteComplaint(id) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('complaints').delete().eq('id', id);
        if (error) {
          console.warn('Supabase delete failed:', error);
        }
      } catch (err) {
        console.warn('Supabase delete failed, using local store:', err);
      }
    }

    // Local fallback
    const all = JSON.parse(localStorage.getItem('mv_complaints') || '[]');
    const filtered = all.filter(c => c.id !== id);
    localStorage.setItem('mv_complaints', JSON.stringify(filtered));

    return true;
  },

  // Add audit record
  addAuditHistory(entry) {
    const history = JSON.parse(localStorage.getItem('mv_history') || '[]');
    history.push({
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...entry,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('mv_history', JSON.stringify(history));
  },

  // Get audit history for a complaint
  getAuditHistory(complaintId) {
    const history = JSON.parse(localStorage.getItem('mv_history') || '[]');
    return history.filter(h => h.complaint_id === complaintId);
  },

  // In-app Notifications
  async getNotifications(userId) {
    const all = JSON.parse(localStorage.getItem('mv_notifications') || '[]');
    return all.filter(n => !userId || n.recipient_id === userId);
  },

  async addNotification(notif) {
    const all = JSON.parse(localStorage.getItem('mv_notifications') || '[]');
    const newNotif = {
      id: `notif-${Date.now()}`,
      ...notif,
      read_at: null,
      created_at: new Date().toISOString()
    };
    all.unshift(newNotif);
    localStorage.setItem('mv_notifications', JSON.stringify(all));
    return newNotif;
  },

  async markNotificationRead(id) {
    const all = JSON.parse(localStorage.getItem('mv_notifications') || '[]');
    const updated = all.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n);
    localStorage.setItem('mv_notifications', JSON.stringify(updated));
  },

  // Government Schemes & Benefits
  async getGovernmentSchemes() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('government_schemes')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase schemes query error, falling back to verified dataset:', err);
      }
    }
    return VERIFIED_SCHEMES;
  }
};

export const schemeService = {
  async getSchemes() {
    return DataRepo.getGovernmentSchemes();
  }
};

// ==========================================================================
// VILLAGER PROFILE SERVICE
// Upserts and fetches villager profiles after Supabase phone OTP verification.
// Profile is linked to the Supabase Auth user via the same UUID (id).
// ==========================================================================

export const villagerProfileService = {
  /**
   * Upsert villager profile after successful OTP verification.
   * Uses the Supabase Auth user UUID as the profile primary key.
   */
  async upsertProfile({ id, full_name, mobile_number, role = 'villager', village_name = 'Kandavara Gram Panchayat' }) {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id,
          full_name,
          mobile_number,
          role,
          village_name,
          email: `${mobile_number}@villager.in`,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Fetch an existing villager profile by mobile number.
   * Used to check if a returning user has a profile before creating a new one.
   */
  async getProfileByMobile(mobile_number) {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('mobile_number', mobile_number)
      .single();
    return data || null;
  }
};
