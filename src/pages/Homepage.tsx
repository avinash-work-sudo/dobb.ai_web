import { impactAnalysisAPI } from "@/api/impact-analysis";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCard } from "@/components/UploadCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Eye,
  Figma,
  FileText,
  Link,
  Mic,
  Plus,
  Settings,
  Upload,
  User
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fileUrl, setFileUrl] = useState<string>("");
  const [prdLink, setPrdLink] = useState("");
  const [figmaLink, setFigmaLink] = useState("");
  const [transcriptLink, setTranscriptLink] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!fileUrl && !prdLink && !figmaLink && !transcriptLink) {
      toast({
        title: "No data provided",
        description: "Please upload a file or provide at least one link.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Create feature record in Supabase
      const { data: feature, error: featureError } = await supabase
        .from('features')
        .insert({
          file_url: fileUrl || null,
          prd_link: prdLink || null,
          figma_link: figmaLink || null,
          transcript_link: transcriptLink || null,
          status: 'processing'
        })
        .select()
        .single();

      if (featureError) {
        throw featureError;
      }

      // Start impact analysis using mock API
      const analysisResponse = await impactAnalysisAPI.startAnalysis({
        featureId: feature.id,
        fileUrl: fileUrl,
        prdLink: prdLink,
        figmaLink: figmaLink,
        transcriptLink: transcriptLink
      });

      if (!analysisResponse.success) {
        throw new Error('Failed to start impact analysis');
      }

      // Save impact analysis result to database
      const { error: analysisError } = await supabase
        .from('impact_analysis')
        .insert({
          feature_id: feature.id,
          impact_json: analysisResponse.impactAnalysis
        });

      if (analysisError) {
        throw analysisError;
      }

      // Update feature status to completed
      await supabase
        .from('features')
        .update({ 
          status: 'completed',
          analysis_started: true 
        })
        .eq('id', feature.id);

      toast({
        title: "Analysis completed",
        description: "Your feature analysis has been completed successfully.",
      });

      // Navigate to the specific feature detail page
      navigate(`/feature/${feature.id}`);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to complete analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b border-border bg-surface-elevated">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg shadow-elegant">
                <img src="/head.png" alt="DOBB.ai" className="size-10" />
              </div>
              <h1 className="text-xl font-bold text-foreground">DOBB.ai</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="hover:bg-surface-subtle">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-surface-subtle">
                <User className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Project Impact Analysis
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload your project artifacts or provide links to generate comprehensive impact analysis
            </p>
          </div>

          {/* Upload Section */}
          <Card className="bg-surface-elevated border border-border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-primary" />
                <span>Add Project Artifact</span>
              </CardTitle>
              <CardDescription>
                Upload PRD files or provide links to your project resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-surface-subtle">
                  <TabsTrigger value="upload" className="data-[state=active]:bg-surface-elevated">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="links" className="data-[state=active]:bg-surface-elevated">
                    <Link className="h-4 w-4 mr-2" />
                    Provide Links
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-6">
                  <UploadCard
                    title="PRD Document"
                    description="Upload your Product Requirements Document"
                    icon={<FileText className="h-6 w-6" />}
                    acceptsFile={true}
                    fileTypes={["pdf", "docx", "md"]}
                    placeholder="Upload PRD document..."
                    value={fileUrl}
                    onFileUpload={(url) => setFileUrl(url)}
                    onValueChange={(value) => setFileUrl(value)}
                  />
                </TabsContent>

                <TabsContent value="links" className="mt-6">
                  <div className="space-y-6">
                    <UploadCard
                      title="PRD Link"
                      description="Link to your Product Requirements Document"
                      icon={<FileText className="h-6 w-6" />}
                      acceptsUrl={true}
                      placeholder="https://confluence.example.com/prd..."
                      value={prdLink}
                      onUrlSubmit={(url) => setPrdLink(url)}
                      onValueChange={(value) => setPrdLink(value)}
                    />
                    
                    <UploadCard
                      title="Figma Design"
                      description="Link to your Figma design file"
                      icon={<Figma className="h-6 w-6" />}
                      acceptsUrl={true}
                      placeholder="https://figma.com/file/..."
                      value={figmaLink}
                      onUrlSubmit={(url) => setFigmaLink(url)}
                      onValueChange={(value) => setFigmaLink(value)}
                    />
                    
                    <UploadCard
                      title="Meeting Transcript"
                      description="Link to your meeting transcript"
                      icon={<Mic className="h-6 w-6" />}
                      acceptsUrl={true}
                      placeholder="https://meet.google.com/transcript/..."
                      value={transcriptLink}
                      onUrlSubmit={(url) => setTranscriptLink(url)}
                      onValueChange={(value) => setTranscriptLink(value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleAnalyze}
                  className="bg-gradient-primary text-white hover:opacity-90 transition-all duration-300"
                  disabled={(!fileUrl && !prdLink && !figmaLink && !transcriptLink) || isAnalyzing}
                >
                  {isAnalyzing ? "Processing Feature Analysis..." : "Start Analysis"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* View Features Section */}
          <Card className="bg-surface-elevated border border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  View Analyzed Features
                </h3>
                <p className="text-muted-foreground mb-6">
                  Review all the features you've previously analyzed and their impact reports
                </p>
                <Button 
                  onClick={() => navigate('/features')}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Features
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Homepage;