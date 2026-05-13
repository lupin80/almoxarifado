-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Tables with native UUIDs
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  cnpj TEXT,
  city TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'operador', 'usuario')) DEFAULT 'usuario',
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT,
  price DOUBLE PRECISION DEFAULT 0,
  stock INTEGER DEFAULT 0,
  max_stock INTEGER DEFAULT 1000,
  location TEXT,
  ncm TEXT,
  icms DOUBLE PRECISION DEFAULT 0,
  ipi DOUBLE PRECISION DEFAULT 0,
  pis DOUBLE PRECISION DEFAULT 0,
  invoice_number TEXT,
  supplier_id UUID REFERENCES suppliers(id),
  image TEXT,
  status TEXT DEFAULT 'ativo',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT CHECK(type IN ('entry', 'exit', 'transfer', 'product_transfer', 'initial')),
  product_id UUID NOT NULL REFERENCES products(id),
  target_product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  origin TEXT,
  destination TEXT,
  date TEXT,
  time TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Data
INSERT INTO destinations (name) VALUES 
('Ribeira'), ('Expedição'), ('Acabamento'), ('Acondiconamento')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name) VALUES 
('Componentes'), ('Redes'), ('Módulos IA'), ('Eletrônicos')
ON CONFLICT (name) DO NOTHING;

-- RPC for Atomic Movement
CREATE OR REPLACE FUNCTION create_movement(
  p_type TEXT,
  p_product_id UUID,
  p_target_product_id UUID,
  p_quantity INTEGER,
  p_origin TEXT,
  p_destination TEXT,
  p_date TEXT,
  p_time TEXT,
  p_note TEXT
) RETURNS VOID AS $$
DECLARE
  v_stock INTEGER;
  v_target_stock INTEGER;
BEGIN
  -- Get current stock
  SELECT stock INTO v_stock FROM products WHERE id = p_product_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado';
  END IF;

  -- Update stock based on type
  IF p_type = 'entry' THEN
    UPDATE products SET stock = stock + p_quantity, updated_at = NOW() WHERE id = p_product_id;
  ELSIF p_type = 'exit' OR p_type = 'product_transfer' THEN
    IF v_stock < p_quantity THEN
      RAISE EXCEPTION 'Estoque insuficiente';
    END IF;
    UPDATE products SET stock = stock - p_quantity, updated_at = NOW() WHERE id = p_product_id;
  END IF;

  -- Handle target product for transfers
  IF p_type = 'product_transfer' THEN
    IF p_target_product_id IS NULL THEN
      RAISE EXCEPTION 'Produto de destino é obrigatório para transferências';
    END IF;
    
    SELECT stock INTO v_target_stock FROM products WHERE id = p_target_product_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produto de destino não encontrado';
    END IF;
    
    UPDATE products SET stock = stock + p_quantity, updated_at = NOW() WHERE id = p_target_product_id;
  END IF;

  -- Insert movement record
  INSERT INTO movements (type, product_id, target_product_id, quantity, origin, destination, date, time, note)
  VALUES (p_type, p_product_id, p_target_product_id, p_quantity, p_origin, p_destination, p_date, p_time, p_note);

END;
$$ LANGUAGE plpgsql;

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES usuarios(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at to existing tables if missing
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Apply trigger to products
DROP TRIGGER IF EXISTS set_timestamp ON products;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Apply trigger to suppliers
DROP TRIGGER IF EXISTS set_timestamp ON suppliers;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON suppliers
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

