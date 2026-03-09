-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    sender_role TEXT NOT NULL,
    recipient_id UUID NOT NULL, -- Can refer to a Supplier ID or User ID
    recipient_role TEXT NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own messages (sent or received)" ON public.messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id -- Note: If recipient_id refers to a Supplier, this might need a join or careful handling if auth.uid != supplier.id directly (unless suppliers has user_id)
        -- Assuming for now simple user-to-user or user-to-supplier-owner mapping
    );

CREATE POLICY "Users can insert messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
