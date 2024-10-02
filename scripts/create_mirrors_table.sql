-- Create mirrors table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.mirrors (
    SKU TEXT PRIMARY KEY,
    name TEXT,
    price NUMERIC,
    width NUMERIC,
    height NUMERIC,
    depth NUMERIC,
    weight NUMERIC,
    frame_color TEXT,
    frame_material TEXT,
    frame_finish TEXT,
    mirror_shape TEXT,
    installation_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_mirrors_modtime
BEFORE UPDATE ON public.mirrors
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();