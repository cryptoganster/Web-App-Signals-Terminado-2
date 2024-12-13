-- Drop existing constraint
ALTER TABLE public.signals DROP CONSTRAINT IF EXISTS signals_status_check;

-- Update all status values to be consistent
UPDATE public.signals
SET status = 'partial profits'
WHERE status IN ('partial-profits', 'Partial Profits', 'Partial profits', 'partial-profits');

UPDATE public.signals
SET status = 'stopped'
WHERE status IN ('Stopped', 'stop-loss-1') OR status LIKE 'stop-loss-%';

-- Add new constraint with correct values
ALTER TABLE public.signals ADD CONSTRAINT signals_status_check
  CHECK (
    status IN ('active', 'pending', 'completed', 'partial profits', 'stopped') OR
    status ~ '^take-profit-\d+$' OR
    status ~ '^stop-loss-\d+$' OR
    status ~ '^entry-\d+$'
  );

-- Verify the changes
SELECT DISTINCT status, COUNT(*) 
FROM public.signals 
GROUP BY status 
ORDER BY status;