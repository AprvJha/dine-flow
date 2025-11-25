-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'customer');
CREATE TYPE public.staff_role AS ENUM ('waiter', 'kitchen', 'manager', 'cashier');
CREATE TYPE public.table_status AS ENUM ('available', 'occupied', 'reserved', 'cleaning');
CREATE TYPE public.order_status AS ENUM ('pending', 'preparing', 'ready', 'served', 'cancelled');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'seated', 'cancelled', 'completed');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Assign customer role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Staff details table
CREATE TABLE public.staff_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    staff_role public.staff_role NOT NULL,
    shift_start TIME,
    shift_end TIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.staff_details ENABLE ROW LEVEL SECURITY;

-- Menu categories
CREATE TABLE public.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

-- Menu items
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_spicy BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    prep_time_minutes INTEGER DEFAULT 15,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Restaurant tables
CREATE TABLE public.restaurant_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number TEXT NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    status public.table_status DEFAULT 'available',
    position_x INTEGER,
    position_y INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

-- Reservations
CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    party_size INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    special_requests TEXT,
    status public.reservation_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status public.order_status DEFAULT 'pending',
    order_type TEXT DEFAULT 'dine-in',
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    service_charge DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Order items
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- User roles: readable by authenticated users
CREATE POLICY "User roles are viewable by authenticated users"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (TRUE);

-- Staff details: admins can manage all, staff can view own
CREATE POLICY "Admins can manage staff details"
  ON public.staff_details FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view own details"
  ON public.staff_details FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Menu categories: public read, admin write
CREATE POLICY "Anyone can view menu categories"
  ON public.menu_categories FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage menu categories"
  ON public.menu_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Menu items: public read, admin write
CREATE POLICY "Anyone can view available menu items"
  ON public.menu_items FOR SELECT
  USING (is_available = TRUE);

CREATE POLICY "Admins can manage menu items"
  ON public.menu_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Restaurant tables: staff and admins can view/manage
CREATE POLICY "Staff and admins can view tables"
  ON public.restaurant_tables FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Admins can manage tables"
  ON public.restaurant_tables FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can update table status"
  ON public.restaurant_tables FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'staff'));

-- Reservations: customers own, staff/admin see all
CREATE POLICY "Customers can view own reservations"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Staff and admins can view all reservations"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Customers can create reservations"
  ON public.reservations FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Staff and admins can manage reservations"
  ON public.reservations FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'staff')
  );

-- Orders: staff/admin see all, customers see own
CREATE POLICY "Staff and admins can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Customers can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Staff can create and update orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Staff can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'staff')
  );

-- Order items: follow order permissions
CREATE POLICY "Users can view order items if they can view the order"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id 
      AND (
        o.customer_id = auth.uid() OR
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'staff')
      )
    )
  );

CREATE POLICY "Staff can manage order items"
  ON public.order_items FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'staff')
  );

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE PLPGSQL
AS $$
DECLARE
  new_number TEXT;
BEGIN
  SELECT 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0')
  INTO new_number;
  RETURN new_number;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS order_number_seq;

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_number();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();