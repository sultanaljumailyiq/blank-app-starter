ALTER TABLE dental_lab_orders DROP CONSTRAINT IF EXISTS dental_lab_orders_status_check;
ALTER TABLE dental_lab_orders ADD CONSTRAINT dental_lab_orders_status_check 
CHECK (status IN (
    'pending', 
    'waiting_for_representative', 
    'representative_dispatched', 
    'in_progress',
    'in-progress',
    'completed',
    'out_for_delivery', 
    'delivered', 
    'returned', 
    'cancelled', 
    'rejected', 
    'modification_requested',
    'confirmed',
    'processing',
    'ready_for_pickup',
    'ready_for_delivery',
    'ready',
    'collected'
));
