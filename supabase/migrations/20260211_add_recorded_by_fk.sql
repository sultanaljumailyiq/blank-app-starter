-- Add missing foreign key constraint for recorded_by_staff_id
-- This is required for PostgREST to embed the 'recorder_staff' relation.

ALTER TABLE "financial_transactions"
ADD CONSTRAINT "fk_fin_recorded_by_staff"
FOREIGN KEY ("recorded_by_staff_id")
REFERENCES "staff" ("id")
ON DELETE SET NULL;
