-- Guest services and feedback management tables

-- Guest feedback
CREATE TABLE IF NOT EXISTS public.guest_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID REFERENCES public.guests(id),
  reservation_id UUID REFERENCES public.reservations(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  category TEXT NOT NULL CHECK (category IN ('room', 'service', 'food', 'cleanliness', 'staff', 'overall')),
  feedback_text TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'responded', 'resolved')),
  response_text TEXT,
  responded_by UUID REFERENCES public.profiles(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loyalty program
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID NOT NULL REFERENCES public.guests(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'adjusted')),
  points INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_type TEXT CHECK (reference_type IN ('reservation', 'restaurant_order', 'feedback', 'bonus')),
  reference_id UUID,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guest requests/complaints
CREATE TABLE IF NOT EXISTS public.guest_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID REFERENCES public.guests(id),
  room_number TEXT,
  request_type TEXT NOT NULL CHECK (request_type IN ('maintenance', 'housekeeping', 'amenity', 'complaint', 'information', 'other')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES public.profiles(id),
  resolved_by UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Guest preferences
CREATE TABLE IF NOT EXISTS public.guest_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID NOT NULL REFERENCES public.guests(id),
  preference_type TEXT NOT NULL,
  preference_value TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(guest_id, preference_type)
);

-- Enable RLS
ALTER TABLE public.guest_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view guest feedback" ON public.guest_feedback FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage guest feedback" ON public.guest_feedback FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'manager', 'receptionist'))
);

CREATE POLICY "Staff can view loyalty transactions" ON public.loyalty_transactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage loyalty transactions" ON public.loyalty_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'manager', 'receptionist'))
);

CREATE POLICY "Staff can view guest requests" ON public.guest_requests FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage guest requests" ON public.guest_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'manager', 'receptionist', 'staff'))
);

CREATE POLICY "Staff can view guest preferences" ON public.guest_preferences FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage guest preferences" ON public.guest_preferences FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'manager', 'receptionist'))
);
