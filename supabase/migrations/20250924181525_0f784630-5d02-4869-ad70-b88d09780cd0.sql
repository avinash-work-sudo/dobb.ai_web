-- Create user_stories table
CREATE TABLE public.user_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  acceptance_criteria TEXT[],
  priority TEXT DEFAULT 'medium',
  estimated_hours INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  test_cases TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_stories ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (matching the pattern of other tables)
CREATE POLICY "User stories are publicly accessible" 
ON public.user_stories 
FOR ALL 
USING (true);

-- Add foreign key relationship to features table
ALTER TABLE public.user_stories 
ADD CONSTRAINT user_stories_feature_id_fkey 
FOREIGN KEY (feature_id) REFERENCES public.features(id) 
ON DELETE CASCADE;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_stories_updated_at
BEFORE UPDATE ON public.user_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();