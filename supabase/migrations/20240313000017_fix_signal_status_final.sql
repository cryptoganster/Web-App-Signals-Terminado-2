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

-- Create or replace function to handle signal deletion
CREATE OR REPLACE FUNCTION handle_signal_deletion()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- For active signals with take profit hits
  IF (OLD.status = 'active' AND EXISTS (
    SELECT 1 FROM public.signals 
    WHERE id = OLD.id AND status LIKE 'take-profit-%'
  )) OR OLD.status LIKE 'take-profit-%' THEN
    UPDATE public.signals
    SET status = 'partial profits'
    WHERE id = OLD.id;
    RETURN NULL;
  -- For active signals without take profit hits
  ELSIF OLD.status = 'active' THEN
    UPDATE public.signals
    SET status = 'stopped'
    WHERE id = OLD.id;
    RETURN NULL;
  -- For pending signals or signals already in history
  ELSIF OLD.status IN ('pending', 'completed', 'partial profits', 'stopped') THEN
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for signal deletion
DROP TRIGGER IF EXISTS before_signal_delete ON public.signals;
CREATE TRIGGER before_signal_delete
  BEFORE DELETE ON public.signals
  FOR EACH ROW EXECUTE FUNCTION handle_signal_deletion();

-- Verify the changes
SELECT DISTINCT status, COUNT(*) 
FROM public.signals 
GROUP BY status 
ORDER BY status;