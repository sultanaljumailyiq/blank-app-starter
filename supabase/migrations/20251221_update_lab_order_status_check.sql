-- Migration to update the allowed statuses for lab orders
-- to support the granular workflow requested (waiting for rep, dispatched, etc)

ALTER TABLE dental_lab_orders DROP CONSTRAINT IF EXISTS dental_lab_orders_status_check;

ALTER TABLE dental_lab_orders 
ADD CONSTRAINT dental_lab_orders_status_check 
CHECK (status IN (
    'pending', 
    'waiting_for_representative', 
    'representative_dispatched', 
    'in_progress', 
    'completed', 
    'out_for_delivery', 
    'delivered', 
    'returned', 
    'cancelled', 
    'rejected', 
    'modification_requested',
    'sent',      -- Keeping for legacy/compatibility
    'received'   -- Keeping for legacy/compatibility
));
