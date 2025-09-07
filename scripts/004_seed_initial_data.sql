-- Seed initial data for P-ZED Hotels & Suites

-- Insert room categories
INSERT INTO public.room_categories (name, base_price, description, amenities, max_occupancy) VALUES
('Standard', 15000.00, 'Comfortable standard room with essential amenities', '["WiFi", "AC", "TV", "Private Bathroom"]', 2),
('Classic', 25000.00, 'Upgraded room with additional comfort features', '["WiFi", "AC", "Smart TV", "Private Bathroom", "Mini Fridge", "Work Desk"]', 2),
('Diplomatic', 35000.00, 'Spacious room designed for business travelers', '["WiFi", "AC", "Smart TV", "Private Bathroom", "Mini Fridge", "Work Desk", "Sitting Area", "Coffee Machine"]', 3),
('Deluxe', 40000.00, 'Premium room with luxury amenities', '["WiFi", "AC", "Smart TV", "Private Bathroom", "Mini Fridge", "Work Desk", "Sitting Area", "Coffee Machine", "Balcony", "Premium Bedding"]', 4),
('Executive', 50000.00, 'Top-tier suite with exclusive services', '["WiFi", "AC", "Smart TV", "Private Bathroom", "Mini Fridge", "Work Desk", "Sitting Area", "Coffee Machine", "Balcony", "Premium Bedding", "Kitchenette", "Living Room"]', 4)
ON CONFLICT (name) DO NOTHING;

-- Insert rooms (22 total rooms as specified)
WITH room_data AS (
  SELECT 
    room_number,
    category_name,
    floor
  FROM (VALUES
    ('101', 'Standard', 1), ('102', 'Standard', 1), ('103', 'Classic', 1), ('104', 'Classic', 1),
    ('201', 'Standard', 2), ('202', 'Standard', 2), ('203', 'Classic', 2), ('204', 'Diplomatic', 2),
    ('301', 'Classic', 3), ('302', 'Classic', 3), ('303', 'Diplomatic', 3), ('304', 'Diplomatic', 3),
    ('401', 'Diplomatic', 4), ('402', 'Deluxe', 4), ('403', 'Deluxe', 4), ('404', 'Deluxe', 4),
    ('501', 'Deluxe', 5), ('502', 'Executive', 5), ('503', 'Executive', 5), ('504', 'Executive', 5),
    ('505', 'Executive', 5), ('506', 'Executive', 5)
  ) AS t(room_number, category_name, floor)
)
INSERT INTO public.rooms (room_number, category_id, floor, status)
SELECT 
  rd.room_number,
  rc.id,
  rd.floor,
  'available'
FROM room_data rd
JOIN public.room_categories rc ON rc.name = rd.category_name
ON CONFLICT (room_number) DO NOTHING;

-- Insert basic chart of accounts
INSERT INTO public.chart_of_accounts (account_code, account_name, account_type) VALUES
('1000', 'Cash', 'asset'),
('1100', 'Accounts Receivable', 'asset'),
('1200', 'Inventory', 'asset'),
('2000', 'Accounts Payable', 'liability'),
('3000', 'Owner Equity', 'equity'),
('4000', 'Room Revenue', 'revenue'),
('4100', 'Restaurant Revenue', 'revenue'),
('4200', 'Other Revenue', 'revenue'),
('5000', 'Cost of Goods Sold', 'expense'),
('6000', 'Operating Expenses', 'expense'),
('6100', 'Payroll Expenses', 'expense'),
('6200', 'Utilities', 'expense'),
('6300', 'Maintenance', 'expense')
ON CONFLICT (account_code) DO NOTHING;

-- Insert menu categories
INSERT INTO public.menu_categories (name, description, sort_order) VALUES
('Appetizers', 'Start your meal with our delicious appetizers', 1),
('Main Courses', 'Hearty main dishes to satisfy your appetite', 2),
('Desserts', 'Sweet treats to end your meal', 3),
('Beverages', 'Refreshing drinks and cocktails', 4),
('Room Service', 'Special items available for room service', 5)
ON CONFLICT DO NOTHING;

-- Insert sample menu items
WITH category_ids AS (
  SELECT id, name FROM public.menu_categories
)
INSERT INTO public.menu_items (category_id, name, description, price, cost_price, is_available) 
SELECT 
  c.id,
  item_name,
  item_description,
  item_price,
  item_cost
FROM category_ids c
CROSS JOIN (VALUES
  ('Appetizers', 'Spring Rolls', 'Crispy vegetable spring rolls with sweet chili sauce', 2500.00, 800.00),
  ('Appetizers', 'Chicken Wings', 'Spicy buffalo chicken wings with ranch dip', 3500.00, 1200.00),
  ('Main Courses', 'Grilled Chicken', 'Herb-marinated grilled chicken with vegetables', 8500.00, 3500.00),
  ('Main Courses', 'Beef Steak', 'Premium beef steak with mashed potatoes', 12000.00, 6000.00),
  ('Main Courses', 'Fish & Chips', 'Beer-battered fish with crispy fries', 7500.00, 3000.00),
  ('Desserts', 'Chocolate Cake', 'Rich chocolate cake with vanilla ice cream', 3000.00, 1000.00),
  ('Desserts', 'Fruit Salad', 'Fresh seasonal fruits with honey drizzle', 2000.00, 800.00),
  ('Beverages', 'Fresh Orange Juice', 'Freshly squeezed orange juice', 1500.00, 500.00),
  ('Beverages', 'Coffee', 'Premium coffee blend', 1000.00, 300.00),
  ('Beverages', 'Local Beer', 'Cold local beer', 2000.00, 800.00)
) AS items(category_name, item_name, item_description, item_price, item_cost)
WHERE c.name = items.category_name
ON CONFLICT DO NOTHING;

-- Insert basic inventory items
INSERT INTO public.inventory_items (name, category, unit, current_stock, minimum_stock, unit_cost) VALUES
('Rice', 'Grains', 'kg', 50.0, 10.0, 800.00),
('Chicken Breast', 'Meat', 'kg', 20.0, 5.0, 2500.00),
('Beef', 'Meat', 'kg', 15.0, 3.0, 4000.00),
('Fish Fillet', 'Seafood', 'kg', 10.0, 2.0, 3500.00),
('Cooking Oil', 'Condiments', 'liters', 25.0, 5.0, 1200.00),
('Onions', 'Vegetables', 'kg', 30.0, 5.0, 400.00),
('Tomatoes', 'Vegetables', 'kg', 25.0, 5.0, 600.00),
('Bread', 'Bakery', 'loaves', 20.0, 5.0, 500.00),
('Eggs', 'Dairy', 'crates', 10.0, 2.0, 2000.00),
('Milk', 'Dairy', 'liters', 15.0, 3.0, 800.00)
ON CONFLICT DO NOTHING;
