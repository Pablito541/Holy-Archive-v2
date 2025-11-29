-- Update item_condition enum to match frontend values
ALTER TYPE item_condition ADD VALUE IF NOT EXISTS 'mint';
ALTER TYPE item_condition ADD VALUE IF NOT EXISTS 'very_good';
ALTER TYPE item_condition ADD VALUE IF NOT EXISTS 'good';
ALTER TYPE item_condition ADD VALUE IF NOT EXISTS 'fair';
ALTER TYPE item_condition ADD VALUE IF NOT EXISTS 'poor';

-- Update item_status enum to match frontend values (if needed)
ALTER TYPE item_status ADD VALUE IF NOT EXISTS 'in_stock';
ALTER TYPE item_status ADD VALUE IF NOT EXISTS 'reserved';
ALTER TYPE item_status ADD VALUE IF NOT EXISTS 'sold';

-- Verify columns are nullable for sold/reserved logic
ALTER TABLE items ALTER COLUMN reserved_for DROP NOT NULL;
ALTER TABLE items ALTER COLUMN reserved_until DROP NOT NULL;
ALTER TABLE items ALTER COLUMN sale_price_eur DROP NOT NULL;
ALTER TABLE items ALTER COLUMN sale_date DROP NOT NULL;
ALTER TABLE items ALTER COLUMN sale_channel DROP NOT NULL;
