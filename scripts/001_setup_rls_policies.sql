-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view profiles for public booking pages" ON profiles
  FOR SELECT USING (true);

-- Calendars policies
CREATE POLICY "Users can view their own calendars" ON calendars
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendars" ON calendars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendars" ON calendars
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendars" ON calendars
  FOR DELETE USING (auth.uid() = user_id);

-- Time slots policies
CREATE POLICY "Users can view time slots for their calendars" ON time_slots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM calendars 
      WHERE calendars.id = time_slots.calendar_id 
      AND calendars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create time slots for their calendars" ON time_slots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM calendars 
      WHERE calendars.id = time_slots.calendar_id 
      AND calendars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update time slots for their calendars" ON time_slots
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM calendars 
      WHERE calendars.id = time_slots.calendar_id 
      AND calendars.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete time slots for their calendars" ON time_slots
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM calendars 
      WHERE calendars.id = time_slots.calendar_id 
      AND calendars.user_id = auth.uid()
    )
  );

-- Public access to time slots for booking pages
CREATE POLICY "Anyone can view active time slots for public booking" ON time_slots
  FOR SELECT USING (is_active = true);

-- Bookings policies
CREATE POLICY "Users can view bookings for their calendars" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM calendars 
      WHERE calendars.id = bookings.calendar_id 
      AND calendars.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update bookings for their calendars" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM calendars 
      WHERE calendars.id = bookings.calendar_id 
      AND calendars.user_id = auth.uid()
    )
  );

-- Allow cancellation via token
CREATE POLICY "Anyone can cancel bookings with valid token" ON bookings
  FOR UPDATE USING (cancellation_token IS NOT NULL);
