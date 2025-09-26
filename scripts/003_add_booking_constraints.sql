-- Add unique constraint to prevent double bookings
ALTER TABLE bookings 
ADD CONSTRAINT unique_calendar_datetime 
UNIQUE (calendar_id, booking_date, start_time);

-- Add check constraint for valid booking times
ALTER TABLE bookings 
ADD CONSTRAINT valid_booking_times 
CHECK (start_time < end_time);

-- Add check constraint for valid booking dates (not in the past)
ALTER TABLE bookings 
ADD CONSTRAINT valid_booking_date 
CHECK (booking_date >= CURRENT_DATE);

-- Add index for faster conflict checking
CREATE INDEX IF NOT EXISTS idx_bookings_calendar_date_time 
ON bookings (calendar_id, booking_date, start_time, end_time) 
WHERE status != 'cancelled';

-- Add index for faster availability queries
CREATE INDEX IF NOT EXISTS idx_bookings_active 
ON bookings (calendar_id, booking_date, status) 
WHERE status != 'cancelled';
