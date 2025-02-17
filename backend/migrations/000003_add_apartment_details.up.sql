ALTER TABLE apartments
ADD COLUMN available_dates TIMESTAMP[] DEFAULT '{}',
ADD COLUMN location VARCHAR(255),
ADD COLUMN features TEXT[] DEFAULT '{}',
ADD COLUMN rules TEXT; 