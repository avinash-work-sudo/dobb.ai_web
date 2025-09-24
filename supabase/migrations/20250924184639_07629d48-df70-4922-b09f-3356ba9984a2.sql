-- Remove test_cases column from user_stories table
ALTER TABLE public.user_stories DROP COLUMN IF EXISTS test_cases;

-- Create test_cases table
CREATE TABLE public.test_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_story_id UUID NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_executed',
  description TEXT,
  steps TEXT[],
  expected_result TEXT,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_test_cases_user_story 
    FOREIGN KEY (user_story_id) 
    REFERENCES public.user_stories(id) 
    ON DELETE CASCADE
);

-- Enable RLS on test_cases table
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;

-- Create policy for test_cases (publicly accessible like other tables)
CREATE POLICY "Test cases are publicly accessible" 
ON public.test_cases 
FOR ALL 
USING (true);

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_test_cases_updated_at
BEFORE UPDATE ON public.test_cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add constraints for status values
ALTER TABLE public.test_cases 
ADD CONSTRAINT check_test_case_status 
CHECK (status IN ('passed', 'failed', 'not_executed'));

-- Add constraints for priority values  
ALTER TABLE public.test_cases 
ADD CONSTRAINT check_test_case_priority 
CHECK (priority IN ('high', 'medium', 'low'));

-- Create index for better performance
CREATE INDEX idx_test_cases_user_story_id ON public.test_cases(user_story_id);