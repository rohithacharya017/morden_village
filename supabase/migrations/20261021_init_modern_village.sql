-- ==========================================================================
-- MODERN VILLAGE: AI-POWERED GRAM PANCHAYAT COMPLAINT MANAGEMENT SYSTEM
-- Supabase PostgreSQL Schema & Row Level Security Policies
-- ==========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Villagers and Panchayat Officials)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile_number TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('villager', 'panchayat_official', 'admin')),
    village_name TEXT,
    ward_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PANCHAYAT OFFICES TABLE
CREATE TABLE IF NOT EXISTS public.panchayat_offices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    office_name TEXT NOT NULL,
    village_name TEXT NOT NULL,
    block TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    contact_phone TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PANCHAYAT MEMBERSHIP (Official Access Mapping)
CREATE TABLE IF NOT EXISTS public.panchayat_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    official_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    panchayat_id UUID REFERENCES public.panchayat_offices(id) ON DELETE CASCADE,
    designation TEXT NOT NULL, -- e.g. Sarpanch, Panchayat Secretary, Ward Member, Junior Engineer
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(official_id, panchayat_id)
);

-- 4. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_number TEXT UNIQUE NOT NULL,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    panchayat_id UUID REFERENCES public.panchayat_offices(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_address TEXT,
    village_name TEXT,
    reporter_name_snapshot TEXT NOT NULL,
    reporter_mobile_snapshot TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    priority_reason TEXT,
    priority_source TEXT DEFAULT 'AI Classification',
    priority_overridden_by UUID REFERENCES public.profiles(id),
    priority_override_reason TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'COMPLETED', 'REOPENED')),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES public.profiles(id),
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES public.profiles(id),
    completion_note TEXT,
    completion_image_url TEXT,
    assigned_official_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMPLAINT STATUS HISTORY (Audit Trail)
CREATE TABLE IF NOT EXISTS public.complaint_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id),
    change_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. IN-APP NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT DEFAULT 'status_update' CHECK (notification_type IN ('status_update', 'acknowledgement', 'completion', 'system')),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequence generator for Complaint Numbers (MV-2026-00001 format)
CREATE SEQUENCE IF NOT EXISTS complaint_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_complaint_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.complaint_number IS NULL OR NEW.complaint_number = '' THEN
        NEW.complaint_number := 'MV-2026-' || LPAD(nextval('complaint_number_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_complaint_number
BEFORE INSERT ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION generate_complaint_number();

-- Auto update timestamp trigger
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_complaints_timestamp
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ==========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panchayat_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panchayat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile, officials can read profiles of reporters
CREATE POLICY "Users view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Complaints Policies:
-- 1. Villagers can view ONLY their own complaints
CREATE POLICY "Villagers view own complaints"
    ON public.complaints FOR SELECT
    USING (
        auth.uid() = reporter_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('panchayat_official', 'admin')
        )
    );

-- 2. Villagers can insert complaints with their own reporter_id
CREATE POLICY "Villagers insert complaints"
    ON public.complaints FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- 3. Only Panchayat officials can update status, priority, or completion fields
CREATE POLICY "Panchayat officials update complaints"
    ON public.complaints FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('panchayat_official', 'admin')
        )
    );

-- Notifications Policies:
CREATE POLICY "Users view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = recipient_id);

CREATE POLICY "Users mark notifications read"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = recipient_id);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_complaints_reporter ON public.complaints(reporter_id);
CREATE INDEX IF NOT EXISTS idx_complaints_panchayat ON public.complaints(panchayat_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);

-- ==========================================================================
-- SEED DATA (For development & demo testing)
-- ==========================================================================
INSERT INTO public.panchayat_offices (id, office_name, village_name, block, district, state, contact_phone, contact_email)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Kandavara Gram Panchayat Office', 'Kandavara', 'Kandavara Central', 'Varanasi', 'Uttar Pradesh', '+91 98765 43210', 'panchayat.kandavara@gov.in')
ON CONFLICT (id) DO NOTHING;
