-- Add quantity_ml column to inventory_items table
ALTER TABLE inventory_items 
ADD COLUMN quantity_ml NUMERIC DEFAULT 30;

-- Optional: Comment on the column
COMMENT ON COLUMN inventory_items.quantity_ml IS 'Volume of the item in milliliters';
