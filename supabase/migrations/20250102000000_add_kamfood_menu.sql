/*
  # Add Kamfood Inasal Menu Items
  
  This migration is self-contained and will create all necessary tables
  if they don't exist, then populate with Kamfood Inasal menu data.

  1. Create Tables (if not exists)
    - menu_items
    - variations
    - add_ons
    - categories
    - payment_methods
    - site_settings
  
  2. Categories
    - Add Kamfood Inasal specific categories
  
  3. Menu Items
    - Add items for each category starting with KAMerienda
*/

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  base_price decimal(10,2) NOT NULL,
  category text NOT NULL,
  popular boolean DEFAULT false,
  available boolean DEFAULT true,
  image_url text,
  discount_price decimal(10,2),
  discount_start_date timestamptz,
  discount_end_date timestamptz,
  discount_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create variations table
CREATE TABLE IF NOT EXISTS variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create add_ons table
CREATE TABLE IF NOT EXISTS add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '☕',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id text PRIMARY KEY,
  name text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  qr_code_url text NOT NULL,
  active boolean DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id text PRIMARY KEY,
  value text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (drop if exists first)
DROP POLICY IF EXISTS "Anyone can read menu items" ON menu_items;
CREATE POLICY "Anyone can read menu items" ON menu_items FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Anyone can read variations" ON variations;
CREATE POLICY "Anyone can read variations" ON variations FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Anyone can read add-ons" ON add_ons;
CREATE POLICY "Anyone can read add-ons" ON add_ons FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
CREATE POLICY "Anyone can read categories" ON categories FOR SELECT TO public USING (active = true);

DROP POLICY IF EXISTS "Anyone can read active payment methods" ON payment_methods;
CREATE POLICY "Anyone can read active payment methods" ON payment_methods FOR SELECT TO public USING (active = true);

DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
CREATE POLICY "Anyone can read site settings" ON site_settings FOR SELECT TO public USING (true);

-- Create policies for authenticated admin access
DROP POLICY IF EXISTS "Authenticated users can manage menu items" ON menu_items;
CREATE POLICY "Authenticated users can manage menu items" ON menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage variations" ON variations;
CREATE POLICY "Authenticated users can manage variations" ON variations FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage add-ons" ON add_ons;
CREATE POLICY "Authenticated users can manage add-ons" ON add_ons FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
CREATE POLICY "Authenticated users can manage categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage payment methods" ON payment_methods;
CREATE POLICY "Authenticated users can manage payment methods" ON payment_methods FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON site_settings;
CREATE POLICY "Authenticated users can manage site settings" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for menu images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for menu-images bucket
DROP POLICY IF EXISTS "Public can view menu images" ON storage.objects;
CREATE POLICY "Public can view menu images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Authenticated users can upload menu images" ON storage.objects;
CREATE POLICY "Authenticated users can upload menu images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Authenticated users can update menu images" ON storage.objects;
CREATE POLICY "Authenticated users can update menu images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'menu-images')
  WITH CHECK (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Authenticated users can delete menu images" ON storage.objects;
CREATE POLICY "Authenticated users can delete menu images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'menu-images');

-- Also allow public upload for easier testing (can be restricted later)
DROP POLICY IF EXISTS "Anyone can upload menu images" ON storage.objects;
CREATE POLICY "Anyone can upload menu images"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'menu-images');

-- Clear existing categories and add Kamfood Inasal categories
TRUNCATE TABLE categories CASCADE;

INSERT INTO categories (id, name, icon, sort_order, active) VALUES
  ('kamerienda', 'KAMerienda', '', 1, true),
  ('kamseafood', 'KAMseafood', '', 2, true),
  ('drinks-dessert', 'Drinks & Dessert', '', 3, true),
  ('platters', 'Platters', '', 4, true),
  ('pitcher', 'Pitcher', '', 5, true),
  ('alcoholic', 'Alcoholic Drinks', '', 6, true),
  ('family-meals', 'Family Meals', '', 7, true),
  ('bilao-treats', 'Bilao Treats', '', 8, true),
  ('lutong-pinoy', 'Lutong Pinoy', '', 9, true),
  ('busog-meals', 'Busog Meals', '', 10, true),
  ('breakfast', 'Breakfast', '', 11, true),
  ('lechon', 'Lechon', '', 12, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active;

-- Add unique constraint on name and category to prevent duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'menu_items_name_category_unique'
  ) THEN
    ALTER TABLE menu_items ADD CONSTRAINT menu_items_name_category_unique UNIQUE (name, category);
  END IF;
END $$;

-- Set all existing items to not popular
UPDATE menu_items SET popular = false;

-- Add KAMerienda items
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Batchoy', 'Traditional Filipino noodle soup with pork offal, crushed pork cracklings, chicken stock, beef loin and round noodles', 99.00, 'kamerienda', false, true, NULL),
  ('Lomi', 'Thick egg noodle soup with meat, vegetables, and thick broth', 199.00, 'kamerienda', false, true, NULL)
ON CONFLICT (name, category) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  available = EXCLUDED.available;

-- Add Bilao Treats items
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('10 PCS Inasal Paa w/ Java Rice', 'Bilao of 10 pieces chicken leg inasal with java rice', 1399.00, 'bilao-treats', false, true, NULL)
ON CONFLICT (name, category) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  available = EXCLUDED.available;

-- Add Lechon items
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Lechon Manok', 'Whole roasted chicken, Filipino style', 285.00, 'lechon', false, true, NULL)
ON CONFLICT (name, category) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  available = EXCLUDED.available;

-- Add KAMseafood items (Aklan's Best)
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Steamed Talaba', 'Fresh steamed oysters', 120.00, 'kamseafood', false, true, NULL),
  ('Ginisang Tahong', 'Sauteed mussels in garlic and ginger', 150.00, 'kamseafood', false, true, NULL),
  ('Garlic Butter Shrimp', 'Succulent shrimp in garlic butter sauce (3-4 persons)', 399.00, 'kamseafood', false, true, NULL),
  ('Chili Crab', 'Spicy crab dish (2-3 persons)', 399.00, 'kamseafood', false, true, NULL),
  ('Chili Shrimp', 'Spicy shrimp dish (3-4 persons)', 399.00, 'kamseafood', false, true, NULL),
  ('Mixed Chili Crab and Shrimp', 'Combination of spicy crab and shrimp (4-5 persons)', 799.00, 'kamseafood', false, true, NULL),
  ('Sweet n Sour Lapu Lapu', 'Grouper fish in sweet and sour sauce', 699.00, 'kamseafood', false, true, NULL),
  ('Calamares', 'Crispy fried squid rings', 399.00, 'kamseafood', false, true, NULL),
  ('Tempura', 'Mixed seafood and vegetable tempura', 499.00, 'kamseafood', false, true, NULL)
ON CONFLICT (name, category) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  available = EXCLUDED.available;

-- Add Drinks & Dessert items
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Calamansi Juice', 'Fresh calamansi juice', 35.00, 'drinks-dessert', false, true, NULL),
  ('1.5L Softdrinks', 'Coke, Sprite, or Royal 1.5L', 110.00, 'drinks-dessert', false, true, NULL),
  ('Soda in Can', 'Coke, Sprite, or Royal', 30.00, 'drinks-dessert', false, true, NULL),
  ('Mountain Dew', 'Mountain Dew soda', 30.00, 'drinks-dessert', false, true, NULL),
  ('Vitamilk', 'Soy milk drink', 50.00, 'drinks-dessert', false, true, NULL),
  ('Shakes', 'Buko or Vanilla shakes', 90.00, 'drinks-dessert', false, true, NULL)
ON CONFLICT (name, category) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  available = EXCLUDED.available;

-- Add Platters items
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Rice Platter', 'Steamed rice platter', 150.00, 'platters', false, true, NULL),
  ('Pancit Guisado Platter', 'Stir-fried noodles platter', 280.00, 'platters', false, true, NULL),
  ('Sotanghon Guisado Platter', 'Glass noodles platter', 280.00, 'platters', false, true, NULL),
  ('Bam-I Platter', 'Mixed noodles platter', 300.00, 'platters', false, true, NULL),
  ('BBQ Platter', '15 pieces barbecue platter', 499.00, 'platters', false, true, NULL),
  ('Lumpia Platter', 'Spring rolls platter', 300.00, 'platters', false, true, NULL),
  ('Chopsuey Platter', 'Mixed vegetables platter', 300.00, 'platters', false, true, NULL),
  ('Buttered Chicken', 'Chicken in butter sauce', 450.00, 'platters', false, true, NULL)
ON CONFLICT (name, category) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  available = EXCLUDED.available;

-- Add Pitcher items
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Calamansi Cucumber Pitcher', 'Refreshing calamansi cucumber drink pitcher', 120.00, 'pitcher', false, true, NULL),
  ('Iced Tea Pitcher', 'Iced tea pitcher', 120.00, 'pitcher', false, true, NULL),
  ('Blue Lemonade Pitcher', 'Blue lemonade pitcher', 120.00, 'pitcher', false, true, NULL)
ON CONFLICT (name, category) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  available = EXCLUDED.available;

-- Add Alcoholic Drinks items
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Red Horse Beer', 'Red Horse beer bottle', 80.00, 'alcoholic', false, true, NULL),
  ('San Mig Light', 'San Miguel Light beer', 75.00, 'alcoholic', false, true, NULL),
  ('San Mig Apple', 'San Miguel Apple beer', 75.00, 'alcoholic', false, true, NULL),
  ('San Mig Bucket', 'San Miguel beer bucket', 450.00, 'alcoholic', false, true, NULL),
  ('Red Horse Bucket', 'Red Horse beer bucket', 480.00, 'alcoholic', false, true, NULL)
ON CONFLICT (name, category) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  available = EXCLUDED.available;

-- Add more Bilao Treats items
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('10 PCS Inasal Pechu w/ Java Rice', 'Bilao of 10 pieces chicken breast inasal with java rice', 1499.00, 'bilao-treats', false, true, NULL),
  ('30 PCS Pork Barbecue', 'Bilao of 30 pieces pork barbecue', 999.00, 'bilao-treats', false, true, NULL),
  ('Pork Sisig', 'Sizzling pork sisig bilao', 1299.00, 'bilao-treats', false, true, NULL),
  ('60 PCS Lumpiang Shanghai', 'Bilao of 60 pieces lumpiang shanghai', 1200.00, 'bilao-treats', false, true, NULL),
  ('Bam-E', 'Mixed noodles bilao', 900.00, 'bilao-treats', false, true, NULL),
  ('Pancit Guisado Bilao', 'Stir-fried noodles bilao', 899.00, 'bilao-treats', false, true, NULL),
  ('Sotanghon Guisado Bilao', 'Glass noodles bilao', 799.00, 'bilao-treats', false, true, NULL)
ON CONFLICT (name, category) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  available = EXCLUDED.available;

-- Add Lutong Pinoy items
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Kalderetang Kambing', 'Goat meat in tomato sauce', 400.00, 'lutong-pinoy', false, true, NULL),
  ('Sinampalokan', 'Sour soup with tamarind', 400.00, 'lutong-pinoy', false, true, NULL),
  ('Kilawin', 'Filipino ceviche', 300.00, 'lutong-pinoy', false, true, NULL),
  ('Crispy Pata', 'Deep fried pork leg', 700.00, 'lutong-pinoy', false, true, NULL),
  ('Chopsuey', 'Mixed vegetables stir-fry', 300.00, 'lutong-pinoy', false, true, NULL),
  ('Kare-Kare', 'Peanut stew with oxtail and vegetables', 400.00, 'lutong-pinoy', false, true, NULL),
  ('Pancit Bam-E', 'Mixed noodles', 300.00, 'lutong-pinoy', false, true, NULL),
  ('Pancit Guisado', 'Stir-fried noodles', 280.00, 'lutong-pinoy', false, true, NULL),
  ('Sotanghon Guisado', 'Glass noodles', 280.00, 'lutong-pinoy', false, true, NULL)
ON CONFLICT (name, category) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  available = EXCLUDED.available;

-- Add Busog Meals items
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('KM1 - Inasal Paa', 'Grilled chicken leg quarter with unlimited rice', 159.00, 'busog-meals', false, true, NULL),
  ('KM2 - Inasal Pechu', 'Grilled chicken breast with unlimited rice', 169.00, 'busog-meals', false, true, NULL),
  ('KM3 - Inasal Solo', 'Solo grilled chicken with rice', 139.00, 'busog-meals', false, true, NULL),
  ('KM4 - Pork BBQ', 'Pork barbecue skewers with unlimited rice', 149.00, 'busog-meals', false, true, NULL),
  ('KM5 - Beefy Mushroom', 'Beef with mushroom with unlimited rice', 159.00, 'busog-meals', false, true, NULL),
  ('KM6 - Pork Liempo', 'Grilled pork belly with unlimited rice', 169.00, 'busog-meals', false, true, NULL),
  ('KM7 - Sizzling Pork Sisig', 'Sizzling chopped pork with unlimited rice', 159.00, 'busog-meals', false, true, NULL),
  ('KM8 - Sizzling Squid', 'Sizzling squid with unlimited rice', 169.00, 'busog-meals', false, true, NULL),
  ('KM9 - Lumpia w/ Rice', 'Fried spring rolls with rice', 139.00, 'busog-meals', false, true, NULL)
ON CONFLICT (name, category) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  available = EXCLUDED.available;

-- Add Breakfast items
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Tapsilog', 'Tapa, sinangag, itlog (beef, fried rice, egg)', 99.00, 'breakfast', false, true, NULL),
  ('Sisiglog', 'Sisig, sinangag, itlog', 99.00, 'breakfast', false, true, NULL),
  ('Longsilog', 'Longganisa, sinangag, itlog (sausage, fried rice, egg)', 99.00, 'breakfast', false, true, NULL),
  ('Hotsilog', 'Hotdog, sinangag, itlog', 99.00, 'breakfast', false, true, NULL),
  ('Bangsilog', 'Bangus, sinangag, itlog (milkfish, fried rice, egg)', 99.00, 'breakfast', false, true, NULL),
  ('Tosilog', 'Tocino, sinangag, itlog (sweet pork, fried rice, egg)', 99.00, 'breakfast', false, true, NULL),
  ('Goto', 'Rice porridge with beef tripe', 89.00, 'breakfast', false, true, NULL),
  ('Beefy Rice Bowl', 'Beef rice bowl', 89.00, 'breakfast', false, true, NULL)
ON CONFLICT (name, category) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  available = EXCLUDED.available;

-- Add Family Meals items
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('FM1 - Inasal Bundle', '10 pcs Inasal w/ Java or Plain Rice, 2 servings Pancit Guisado, 2 Whole Balbacua, 2 Pitchers Iced Tea or Lemonade, Desserts (Good for 8-10 persons)', 3249.00, 'family-meals', false, true, NULL),
  ('FM2 - Seafood Bundle', '2 Platter Steamed Rice, 2 Serves Buttered Garlic Shrimp, 2 Plates Sizzling Squid, 2 Sinigang Tuna or Shrimp, 2 Pitchers Iced Tea or Lemonade, Desserts (Good for 8-10 persons)', 3299.00, 'family-meals', false, true, NULL),
  ('FM3 - Meaty Bundle', '2 Crispy Pata, 2 Plates Steamed Rice, 2 servings Bulalo, 2 Servings Kanding Kaldereta, 2 Pitchers Iced Tea or Lemonade, Desserts (Good for 8-10 persons)', 3899.00, 'family-meals', false, true, NULL)
ON CONFLICT (name, category) DO UPDATE SET
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  available = EXCLUDED.available;

-- Add variations for items with different sizes
DO $$
DECLARE
  item_id uuid;
BEGIN
  -- Lomi variations (Half and Whole)
  SELECT id INTO item_id FROM menu_items WHERE name = 'Lomi' AND category = 'kamerienda' LIMIT 1;
  IF item_id IS NOT NULL THEN
    DELETE FROM variations WHERE menu_item_id = item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES
      (item_id, 'Half', 0.00),      -- Base price 199
      (item_id, 'Whole', 100.00);   -- 299 total
  END IF;

  -- Pork Sisig variations (Medium and Large)
  SELECT id INTO item_id FROM menu_items WHERE name = 'Pork Sisig' AND category = 'bilao-treats' LIMIT 1;
  IF item_id IS NOT NULL THEN
    DELETE FROM variations WHERE menu_item_id = item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES
      (item_id, 'Medium', 0.00),    -- Base price 1299
      (item_id, 'Large', 600.00);   -- 1899 total
  END IF;

  -- Bam-E variations (Medium and Large)
  SELECT id INTO item_id FROM menu_items WHERE name = 'Bam-E' AND category = 'bilao-treats' LIMIT 1;
  IF item_id IS NOT NULL THEN
    DELETE FROM variations WHERE menu_item_id = item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES
      (item_id, 'Medium', 0.00),    -- Base price 900
      (item_id, 'Large', 399.00);   -- 1299 total
  END IF;

  -- Pancit Guisado Bilao variations (Medium and Large)
  SELECT id INTO item_id FROM menu_items WHERE name = 'Pancit Guisado Bilao' AND category = 'bilao-treats' LIMIT 1;
  IF item_id IS NOT NULL THEN
    DELETE FROM variations WHERE menu_item_id = item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES
      (item_id, 'Medium', 0.00),    -- Base price 899
      (item_id, 'Large', 1100.00);  -- 1999 total
  END IF;

  -- Sotanghon Guisado Bilao variations (Medium and Large)
  SELECT id INTO item_id FROM menu_items WHERE name = 'Sotanghon Guisado Bilao' AND category = 'bilao-treats' LIMIT 1;
  IF item_id IS NOT NULL THEN
    DELETE FROM variations WHERE menu_item_id = item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES
      (item_id, 'Medium', 0.00),    -- Base price 799
      (item_id, 'Large', 200.00);   -- 999 total
  END IF;

  -- KM3 Inasal Solo variations (with/without unlimited rice)
  SELECT id INTO item_id FROM menu_items WHERE name = 'KM3 - Inasal Solo' AND category = 'busog-meals' LIMIT 1;
  IF item_id IS NOT NULL THEN
    DELETE FROM variations WHERE menu_item_id = item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES
      (item_id, 'Regular Rice', 0.00),     -- Base price 139
      (item_id, 'Unlimited Rice', 10.00);  -- 149 total
  END IF;
END $$;

-- Insert default site settings
INSERT INTO site_settings (id, value, type, description) VALUES
  ('site_name', 'Kamfood Inasal', 'text', 'The name of the cafe/restaurant'),
  ('site_logo', '/logo.jpg', 'image', 'The logo image URL for the site'),
  ('site_description', 'Sarap na Binabalik-balikan - Certified Akeanamiton Since 2019', 'text', 'Short description of the cafe'),
  ('currency', '₱', 'text', 'Currency symbol for prices'),
  ('currency_code', 'PHP', 'text', 'Currency code for payments')
ON CONFLICT (id) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description;

-- Insert default payment methods
INSERT INTO payment_methods (id, name, account_number, account_name, qr_code_url, sort_order, active) VALUES
  ('gcash', 'GCash', '09XX XXX XXXX', 'Kamfood Inasal', 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 1, true),
  ('maya', 'Maya (PayMaya)', '09XX XXX XXXX', 'Kamfood Inasal', 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 2, true),
  ('bank-transfer', 'Bank Transfer', 'Account: 1234-5678-9012', 'Kamfood Inasal', 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 3, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  account_number = EXCLUDED.account_number,
  account_name = EXCLUDED.account_name,
  qr_code_url = EXCLUDED.qr_code_url,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active;

