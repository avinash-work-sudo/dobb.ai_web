-- Create impact_analysis table to store analysis results
CREATE TABLE public.impact_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_id UUID NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  impact_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.impact_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (same as features table)
CREATE POLICY "Impact analysis is publicly accessible" 
ON public.impact_analysis 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_impact_analysis_updated_at
BEFORE UPDATE ON public.impact_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_impact_analysis_feature_id ON public.impact_analysis(feature_id);