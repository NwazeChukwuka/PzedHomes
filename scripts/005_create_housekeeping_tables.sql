-- Housekeeping and maintenance management tables

-- Housekeeping tasks
CREATE TABLE IF NOT EXISTS public.housekeeping_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id),
  task_type TEXT NOT NULL CHECK (task_type IN ('cleaning', 'maintenance', 'inspection', 'setup')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  description TEXT NOT NULL,
  estimated_duration INTEGER, -- in minutes
  assigned_to UUID REFERENCES public.profiles(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Housekeeping supplies/consumables
CREATE TABLE IF NOT EXISTS public.housekeeping_supplies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  minimum_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_cost DECIMAL(10,2),
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supply usage tracking
CREATE TABLE IF NOT EXISTS public.supply_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supply_id UUID NOT NULL REFERENCES public.housekeeping_supplies(id),
  room_id UUID REFERENCES public.rooms(id),
  task_id UUID REFERENCES public.housekeeping_tasks(id),
  quantity_used DECIMAL(10,2) NOT NULL,
  used_by UUID NOT NULL REFERENCES public.profiles(id),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Laundry management
CREATE TABLE IF NOT EXISTS public.laundry_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID REFERENCES public.guests(id),
  room_number TEXT,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'washing', 'drying', 'ironing', 'ready', 'delivered')),
  total_items INTEGER NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  pickup_date DATE,
  delivery_date DATE,
  special_instructions TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Laundry items
CREATE TABLE IF NOT EXISTS public.laundry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.laundry_orders(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  special_care TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laundry_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laundry_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view housekeeping tasks" ON public.housekeeping_tasks FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage housekeeping tasks" ON public.housekeeping_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'manager', 'receptionist', 'staff'))
);

CREATE POLICY "Staff can view supplies" ON public.housekeeping_supplies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Managers can manage supplies" ON public.housekeeping_supplies FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'manager'))
);

CREATE POLICY "Staff can view supply usage" ON public.supply_usage FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can record supply usage" ON public.supply_usage FOR INSERT WITH CHECK (auth.uid() = used_by);

CREATE POLICY "Staff can view laundry orders" ON public.laundry_orders FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage laundry orders" ON public.laundry_orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'manager', 'receptionist', 'staff'))
);

CREATE POLICY "Staff can view laundry items" ON public.laundry_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage laundry items" ON public.laundry_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'manager', 'receptionist', 'staff'))
);
