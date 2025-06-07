-- PostgreSQL schema for RMG POS system
-- Database: rmg_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE restaurant_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number TEXT NOT NULL,
    capacity INT NOT NULL,
    status TEXT,
    section_id UUID REFERENCES restaurant_sections(id),
    position_x INT,
    position_y INT,
    width INT,
    height INT,
    shape TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    position TEXT,
    status TEXT,
    clock_in TIMESTAMPTZ,
    clock_out TIMESTAMPTZ,
    hourly_rate NUMERIC,
    break_start TIMESTAMPTZ,
    break_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE break_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id),
    break_start TIMESTAMPTZ,
    break_end TIMESTAMPTZ,
    date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    quantity NUMERIC,
    unit TEXT,
    cost NUMERIC,
    supplier TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    price NUMERIC,
    category TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE modifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    required BOOLEAN,
    multi_select BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE modifier_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    modifier_id UUID REFERENCES modifiers(id),
    name TEXT,
    price NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE menu_item_modifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id),
    modifier_id UUID REFERENCES modifiers(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_number TEXT,
    server TEXT,
    status TEXT,
    subtotal NUMERIC,
    tax NUMERIC,
    tip NUMERIC,
    total NUMERIC,
    discount_type TEXT,
    discount_value NUMERIC,
    payment_method TEXT,
    paid BOOLEAN,
    client_count INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    menu_item_id UUID REFERENCES menu_items(id),
    quantity INT,
    price NUMERIC,
    notes TEXT,
    client_number INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_item_modifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID REFERENCES order_items(id),
    modifier_id UUID REFERENCES modifiers(id),
    modifier_option_id UUID REFERENCES modifier_options(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    name TEXT,
    subtotal NUMERIC,
    tax NUMERIC,
    tip NUMERIC,
    total NUMERIC,
    paid BOOLEAN,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE split_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    split_id UUID REFERENCES order_splits(id),
    order_item_id UUID REFERENCES order_items(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
