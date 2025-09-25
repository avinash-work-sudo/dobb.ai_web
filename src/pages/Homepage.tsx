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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Mystical grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-purple-600/30 to-amber-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-amber-500/30 to-purple-600/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 border-b border-purple-500/30 bg-gradient-to-r from-slate-900/90 to-purple-950/90 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-amber-500 rounded-lg flex items-center justify-center">
                <img src="/head.png" alt="DOBB.ai" className="w-5 h-5 rounded" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-amber-300 bg-clip-text text-transparent">DOBB.ai</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-purple-200 hover:text-white hover:bg-purple-500/20">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-purple-200 hover:text-white hover:bg-purple-500/20">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-amber-200 bg-clip-text text-transparent mb-2">
              Project Impact Analysis
            </h1>
            <p className="text-lg text-purple-200">
              Upload your project artifacts or provide links to generate comprehensive impact analysis
            </p>
          </div>

          {/* Upload Section */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Plus className="h-5 w-5 text-purple-400" />
                <span>Add Project Artifact</span>
              </CardTitle>
              <CardDescription className="text-purple-200">
                Upload PRD files or provide links to your project resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-purple-900/20 border-purple-500/30">
                  <TabsTrigger value="upload" className="data-[state=active]:bg-purple-600/30 text-purple-200 data-[state=active]:text-white">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="links" className="data-[state=active]:bg-purple-600/30 text-purple-200 data-[state=active]:text-white">
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
                  className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white transition-all duration-300 shadow-2xl shadow-purple-500/25"
                  disabled={(!fileUrl && !prdLink && !figmaLink && !transcriptLink) || isAnalyzing}
                >
                  {isAnalyzing ? "Processing Feature Analysis..." : "Start Analysis"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* View Features Section */}
          <Card className="bg-gradient-to-br from-amber-900/30 to-slate-900/30 border-amber-500/30 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <Eye className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  View Analyzed Features
                </h3>
                <p className="text-amber-200 mb-6">
                  Review all the features you've previously analyzed and their impact reports
                </p>
                <Button 
                  onClick={() => navigate('/features')}
                  variant="outline"
                  className="border-amber-400/30 text-amber-200 hover:bg-amber-500/20 hover:text-white transition-all duration-300"
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