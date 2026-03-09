-- Secure AI Agents Table
-- Only Admins (service role or specific admin role) can edit AI Agents.
-- Authenticated users (doctors/staff) can only VIEW.

-- Drop existing update policy if it exists (it was "Allow authenticated update access")
DROP POLICY IF EXISTS "Allow authenticated update access" ON public.ai_agents;

-- Create correct policy for updates: Service Role Only (or Admin Role if implemented)
-- For now, we restrict to Service Role to prevent any client-side updates.
-- If an admin panel exists for this, we would add the admin role check here.
CREATE POLICY "Restrict updates to service role"
ON public.ai_agents FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure Insert/Delete are also restricted (if not already by default deny)
DROP POLICY IF EXISTS "Allow insert for everyone" ON public.ai_agents; -- Just in case
-- By default, no policy = deny for other roles. 
-- We ensure explicit deny or restricted allow.

CREATE POLICY "Allow service role full access"
ON public.ai_agents FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
