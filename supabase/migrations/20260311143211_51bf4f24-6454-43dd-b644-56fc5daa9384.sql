CREATE POLICY "Public can read maintenance mode"
ON public.platform_settings
FOR SELECT
TO anon, authenticated
USING (setting_key = 'maintenance_mode');