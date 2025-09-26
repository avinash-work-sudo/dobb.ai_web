import { impactAnalysisAPI, userStoriesAPI } from "@/api/impact-analysis";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Code,
  Cpu,
  Database,
  FileEdit,
  Globe,
  Home,
  Loader2,
  RefreshCw,
  Settings,
  User,
  Users
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const FeatureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [isGeneratingStories, setIsGeneratingStories] = useState(false);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [refinedPRD, setRefinedPRD] = useState("");
  const [originalRefinedPRD, setOriginalRefinedPRD] = useState("");
  const [impactAnalysis, setImpactAnalysis] = useState<any | null>(null);
  const [feature, setFeature] = useState<any | null>(null);
  const [aiSummary, setAiSummary] = useState("");

  // Helper functions for rendering dynamic data
  const getImpactBadgeVariant = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return { className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      case 'low':
        return { className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      default:
        return 'secondary';
    }
  };

  const getComplexityBadgeVariant = (complexity: string) => {
    switch (complexity?.toLowerCase()) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return { className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      case 'low':
        return { className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      default:
        return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return { className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      case 'low':
        return { className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      default:
        return 'secondary';
    }
  };

  const getIconForModule = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('user') || nameLower.includes('auth')) return Users;
    if (nameLower.includes('database') || nameLower.includes('data')) return Database;
    if (nameLower.includes('api') || nameLower.includes('service')) return Globe;
    if (nameLower.includes('ui') || nameLower.includes('interface')) return Code;
    if (nameLower.includes('analytics') || nameLower.includes('tracking')) return BarChart3;
    if (nameLower.includes('admin') || nameLower.includes('management')) return Settings;
    return Code; // default icon
  };

  const generateRefinedPRD = useCallback((analysis: any) => {
    const s = analysis?.summary || analysis?.impactScore;
    const modules = analysis?.impactedModules || [];
    const tech = analysis?.technicalImpacts || [];
    const gaps = analysis?.identifiedGaps || [];
    return `# Refined PRD: ${feature?.title || 'Feature'}

## Overview
This refined PRD is auto-generated from the latest impact analysis.

## Impact Overview
- Total Impact Score: ${s?.totalImpactScore ?? "N/A"}/10
- Risk Level: ${s?.riskLevel ?? "N/A"}
- Estimated Effort: ${s?.estimatedEffort ?? "N/A"}
- Confidence: ${s ? Math.round((s.confidence ?? 0) * 100) : "N/A"}%

## Impacted Modules
${modules.map((m: any, i: number) => `${i + 1}. ${m.name} — ${m.impact}\n   - ${m.description}`).join("\n") || "- No modules detected"}

## Technical Impacts
${tech.map((t: any) => `- ${t.category} (${t.complexity}): ${t.changes.join(", ")}`).join("\n") || "- No technical changes"}

## Identified Gaps
${gaps.map((g: any) => `- [${g.priority}] ${g.type}: ${g.description}\n  Recommendation: ${g.recommendation}`).join("\n") || "- No gaps identified"}
`;
  }, [feature?.title]);

  // Fetch feature and impact analysis data from Supabase
  useEffect(() => {
    let isMounted = true;


    const fetchFeatureData = async () => {
      if (!id) return;

      try {
        // Fetch feature with impact analysis
        const { data: featureData, error: featureError } = await supabase
          .from('features')
          .select(`
            id,
            status,
            created_at,
            updated_at,
            file_url,
            prd_link,
            figma_link,
            transcript_link,
            analysis_started,
            impact_analysis (
              id,
              impact_json,
              created_at,
              updated_at
            )
          `)
          .eq('id', id)
          .single();

        if (featureError) {
          console.error('Error fetching feature:', featureError);
          navigate('/features');
          return;
        }

        if (!isMounted) return;

        // Determine source type based on available links
        let sourceType = "PRD";
        if (featureData.figma_link) sourceType = "Figma";
        else if (featureData.transcript_link) sourceType = "Meeting Transcript";
        else if (featureData.file_url) sourceType = "Document";

        const transformedFeature = {
          id: featureData.id,
          title: (featureData.impact_analysis?.[0]?.impact_json as any)?.title || `Feature ${featureData.id.slice(0, 8)}`,
          description: (featureData.impact_analysis?.[0]?.impact_json as any)?.summary || "Feature analysis",
          status: featureData.status,
          priority: "medium", // You can derive this from impact analysis if needed
          sourceType,
          file_url: featureData.file_url,
          prd_link: featureData.prd_link,
          figma_link: featureData.figma_link,
          transcript_link: featureData.transcript_link,
        };

        setFeature(transformedFeature);
        document.title = `${transformedFeature.title} - Impact Analysis | DOBB.ai`;

        // If impact analysis exists, set it up
        if (featureData.impact_analysis?.[0]) {
          const analysisData = featureData.impact_analysis[0].impact_json as any;
          setImpactAnalysis(analysisData);
          
          // Handle different summary formats
          let summary = "";
          if (typeof analysisData.summary === 'string') {
            summary = analysisData.summary;
          } else if (analysisData.summary) {
            summary = "Impact analysis completed with detailed breakdown available.";
          }
          setAiSummary(summary || "Analysis completed.");

          // Set refined PRD
          const existingRefinedPRD = analysisData.refined_prd || generateRefinedPRD(analysisData);
          setRefinedPRD(existingRefinedPRD);
          setOriginalRefinedPRD(existingRefinedPRD);
        }

      } catch (error) {
        console.error('Error fetching feature data:', error);
        if (isMounted) navigate('/features');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFeatureData();
    return () => { isMounted = false; };
  }, [id, navigate]);

  const handleReanalyze = async () => {
    setIsReanalyzing(true);
    try {
      // Trigger re-analysis
      const res = await impactAnalysisAPI.startAnalysis({
        featureId: String(id),
        fileUrl: feature?.file_url || ""
      });
      
      setImpactAnalysis(res.impactAnalysis);
      setAiSummary(res.impactAnalysis.summary || "Re-analysis completed");
      setRefinedPRD(res.impactAnalysis.refined_prd || generateRefinedPRD(res.impactAnalysis));
      setOriginalRefinedPRD(res.impactAnalysis.refined_prd || "");
      
      toast({
        title: "Re-analysis Complete",
        description: "Feature has been re-analyzed successfully",
      });
    } catch (error) {
      console.error("Re-analysis failed", error);
      toast({
        title: "Re-analysis Failed",
        description: "Failed to re-analyze the feature",
        variant: "destructive",
      });
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleRefineAccept = async () => {
    console.log("Accepting refined PRD:", refinedPRD);
    
    // Update the impact analysis refined_prd attribute locally
    const updatedAnalysis = {
      ...impactAnalysis,
      refined_prd: refinedPRD
    };
    setImpactAnalysis(updatedAnalysis);
    setOriginalRefinedPRD(refinedPRD);
    
    // Update the impact_json in the database
    try {
      const { error } = await supabase
        .from('impact_analysis')
        .update({ 
          impact_json: updatedAnalysis,
          updated_at: new Date().toISOString()
        })
        .eq('feature_id', id);
      
      if (error) {
        console.error('Failed to update impact analysis in database:', error);
        toast({
          title: "Update Failed",
          description: "Failed to save PRD changes to database",
          variant: "destructive",
        });
      } else {
        toast({
          title: "PRD Updated",
          description: "Your refined PRD has been saved successfully",
        });
      }
    } catch (error) {
      console.error('Error updating database:', error);
      toast({
        title: "Update Failed", 
        description: "An error occurred while saving changes",
        variant: "destructive",
      });
    }
    
    setShowRefineModal(false);
  };

  const handleRefineCancel = () => {
    setShowRefineModal(false);
    setRefinedPRD(originalRefinedPRD); // Reset to original
  };

  const handleGenerateUserStories = async () => {
    setIsGeneratingStories(true);
    try {
      // First check if user stories already exist for this feature
      const { data: existingStories, error: checkError } = await supabase
        .from('user_stories')
        .select('id')
        .eq('feature_id', id);

      if (checkError) {
        console.error('Error checking existing user stories:', checkError);
        toast({
          title: "Error",
          description: "Failed to check existing user stories",
          variant: "destructive",
        });
        return;
      }

      // If user stories already exist, just navigate to stories page
      if (existingStories && existingStories.length > 0) {
        toast({
          title: "User Stories Found",
          description: `Found ${existingStories.length} existing user stories for this feature`,
        });
        navigate(`/feature/${id}/stories`);
        return;
      }

      console.log("feature?.file_url", feature?.file_url);
      // Generate user stories using the API
      const userStoriesResponse = await userStoriesAPI.generateUserStories({
        featureId: String(id),
        prdLink: feature?.file_url || feature?.prd_link || ""
      });

      if (!userStoriesResponse.success) {
        throw new Error('Failed to generate user stories from API');
      }

      const generatedUserStories = userStoriesResponse.userStories;

      // Store user stories in Supabase (without test_cases)
      const userStoriesToInsert = generatedUserStories.map((story: any) => ({
        feature_id: id,
        title: story.title,
        description: story.description,
        acceptance_criteria: story.acceptance_criteria || [],
        priority: story.priority || 'medium',
        estimated_hours: story.estimated_hours || 0,
        status: story.status || 'draft'
      }));

      const { data: insertedStories, error } = await supabase
        .from('user_stories')
        .insert(userStoriesToInsert)
        .select();

      if (error) {
        console.error('Error storing user stories:', error);
        toast({
          title: "Generation Failed",
          description: "Failed to store user stories in database",
          variant: "destructive",
        });
        return;
      }

      // Now insert test cases for each user story (if they exist in the API response)
      const testCasesToInsert = [];
      for (let i = 0; i < generatedUserStories.length; i++) {
        const story = generatedUserStories[i];
        const insertedStory = insertedStories[i];
        
        if (story.test_cases && Array.isArray(story.test_cases)) {
          for (const testCase of story.test_cases) {
            testCasesToInsert.push({
              user_story_id: insertedStory.id,
              name: testCase.name,
              description: testCase.description,
              steps: testCase.steps || [],
              expected_result: testCase.expected_result || '',
              priority: testCase.priority || 'medium',
              status: 'not_executed'
            });
          }
        }
      }

      if (testCasesToInsert.length > 0) {
        const { error: testCaseError } = await supabase
          .from('test_cases')
          .insert(testCasesToInsert);

        if (testCaseError) {
          console.error('Error storing test cases:', testCaseError);
          // Don't fail the whole operation for test case errors
          toast({
            title: "Warning",
            description: "User stories created but some test cases failed to save",
            variant: "default",
          });
        }
      }

      toast({
        title: "User Stories Generated",
        description: `Successfully generated ${generatedUserStories.length} user stories${testCasesToInsert.length > 0 ? ' with test cases' : ''}`,
      });

      // Navigate to stories page
      navigate(`/feature/${id}/stories`);

    } catch (error) {
      console.error("Failed to generate user stories:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate user stories",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingStories(false);
    }
  };

  // Show loading only when initially fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Top Bar */}
        <header className="border-b border-border bg-surface-elevated">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate('/features')}
                  className="hover:bg-surface-subtle"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Button>
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
            <Card className="bg-surface-elevated border border-border">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin mb-6" />
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Loading Feature Data
                  </h3>
                  <p className="text-muted-foreground">
                    Fetching feature details and analysis results...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Show message if no feature found
  if (!feature) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-surface-elevated">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate('/features')}
                  className="hover:bg-surface-subtle"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Button>
                <div className="bg-gradient-primary p-2 rounded-lg shadow-elegant">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground">DOBB.ai</h1>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Feature Not Found</h1>
            <p className="text-muted-foreground mb-6">The requested feature could not be found.</p>
            <Button onClick={() => navigate('/features')}>
              Back to Features
            </Button>
          </div>
        </main>
      </div>
    );
  }

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
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/features')}
                className="hover:bg-purple-500/20 text-purple-200 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-amber-500 rounded-lg flex items-center justify-center">
                <img src="/head.png" alt="DOBB.ai" className="w-5 h-5 rounded" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-amber-300 bg-clip-text text-transparent">DOBB.ai</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="hover:bg-purple-500/20 text-purple-200 hover:text-white">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-purple-500/20 text-purple-200 hover:text-white">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => navigate('/homepage')}
                    className="cursor-pointer flex items-center space-x-1"
                  >
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => navigate('/features')}
                    className="cursor-pointer"
                  >
                    Features
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{feature.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Feature Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Analysis Complete
              </Badge>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                High Priority
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {feature.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              Comprehensive impact analysis and risk assessment completed
            </p>
          </div>

          {/* AI Summary */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="text-white">AI-Generated Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100 leading-relaxed">
                {aiSummary || "Summary will appear once analysis completes."}
              </p>
            </CardContent>
          </Card>

          {/* Impact Report */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Impacted Modules - Product Perspective */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-blue-400" />
                  <span className="text-white">Impacted Modules</span>
                </CardTitle>
                <CardDescription className="text-purple-200">Business and product areas affected by this feature</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {impactAnalysis?.impactedModules?.length > 0 ? (
                    impactAnalysis.impactedModules.map((module: any, index: number) => {
                      const IconComponent = getIconForModule(module.name);
                      const badgeVariant = getImpactBadgeVariant(module.impact);
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{module.name}</span>
                            </div>
                            <Badge 
                              {...(typeof badgeVariant === 'object' ? badgeVariant : { variant: badgeVariant })}
                              className={`text-xs ${typeof badgeVariant === 'object' ? badgeVariant.className : ''}`}
                            >
                              {module.impact}
                            </Badge>
                          </div>
                          <div className="pl-6 text-xs text-muted-foreground">
                            <p>{module.description}</p>
                            {module.effort && (
                              <p className="mt-1 text-primary">Effort: {module.effort}</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No impacted modules data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Technical Impacts - Technical/Coding Perspective */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-yellow-400" />
                  <span className="text-white">Technical Impacts</span>
                </CardTitle>
                <CardDescription className="text-purple-200">Technical components and code modules affected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {impactAnalysis?.technicalImpacts?.length > 0 ? (
                    <>
                      {impactAnalysis.technicalImpacts.map((impact: any, index: number) => {
                        const badgeVariant = getComplexityBadgeVariant(impact.complexity);
                        const categoryIcon = impact.category.toLowerCase().includes('database') ? Database :
                                           impact.category.toLowerCase().includes('api') ? Globe :
                                           impact.category.toLowerCase().includes('frontend') ? Code :
                                           impact.category.toLowerCase().includes('security') ? Settings : Cpu;
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {React.createElement(categoryIcon, { className: "h-4 w-4 text-muted-foreground" })}
                                <span className="text-sm font-medium">{impact.category}</span>
                              </div>
                              <Badge 
                                {...(typeof badgeVariant === 'object' ? badgeVariant : { variant: badgeVariant })}
                                className={`text-xs ${typeof badgeVariant === 'object' ? badgeVariant.className : ''}`}
                              >
                                {impact.complexity}
                              </Badge>
                            </div>
                            <div className="pl-6 space-y-1">
                              {impact.changes?.map((change: string, changeIndex: number) => (
                                <div key={changeIndex} className="text-xs text-muted-foreground flex items-start space-x-1">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{change}</span>
                                </div>
                              ))}
                              {impact.estimatedDowntime && (
                                <div className="text-xs text-yellow-400 mt-1">
                                  Downtime: {impact.estimatedDowntime}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Summary Stats */}
                      <div className="pt-2 border-t border-border">
                        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                          <span>Categories: {impactAnalysis.technicalImpacts.length}</span>
                          <span>Avg Complexity: {impactAnalysis.technicalImpacts.reduce((acc: number, impact: any) => {
                            const complexityScore = impact.complexity?.toLowerCase() === 'critical' ? 5 :
                                                   impact.complexity?.toLowerCase() === 'high' ? 4 :
                                                   impact.complexity?.toLowerCase() === 'medium' ? 3 :
                                                   impact.complexity?.toLowerCase() === 'low' ? 2 : 1;
                            return acc + complexityScore;
                          }, 0) / impactAnalysis.technicalImpacts.length}/5</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Cpu className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No technical impacts data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Identified Gaps - Detailed by Category */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <span className="text-white">Identified Gaps</span>
                </CardTitle>
                <CardDescription className="text-purple-200">Technical feasibility concerns and missing requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {impactAnalysis?.identifiedGaps?.length > 0 ? (
                    (() => {
                      // Group gaps by type
                      const groupedGaps = impactAnalysis.identifiedGaps.reduce((acc: any, gap: any) => {
                        const type = gap.type || 'Other';
                        if (!acc[type]) acc[type] = [];
                        acc[type].push(gap);
                        return acc;
                      }, {});

                      const getTypeColor = (type: string) => {
                        switch (type.toLowerCase()) {
                          case 'security': return 'text-red-400 border-red-500/30';
                          case 'performance': return 'text-yellow-400 border-yellow-500/30';
                          case 'testing': return 'text-blue-400 border-blue-500/30';
                          case 'compliance': return 'text-purple-400 border-purple-500/30';
                          case 'documentation': return 'text-green-400 border-green-500/30';
                          case 'monitoring': return 'text-orange-400 border-orange-500/30';
                          default: return 'text-gray-400 border-gray-500/30';
                        }
                      };

                      return Object.entries(groupedGaps).map(([type, gaps]: [string, any]) => (
                        <div key={type}>
                          <h4 className={`text-sm font-semibold mb-2 ${getTypeColor(type).split(' ')[0]}`}>
                            {type}
                          </h4>
                          <div className={`space-y-3 pl-3 border-l-2 ${getTypeColor(type).split(' ')[1]}`}>
                            {gaps.map((gap: any, index: number) => {
                              const priorityBadgeVariant = getPriorityBadgeVariant(gap.priority);
                              
                              return (
                                <div key={index} className="space-y-2">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <p className="text-foreground font-medium text-xs">
                                          • {gap.title || gap.type}
                                        </p>
                                        <Badge 
                                          {...(typeof priorityBadgeVariant === 'object' ? priorityBadgeVariant : { variant: priorityBadgeVariant })}
                                          className={`text-xs ${typeof priorityBadgeVariant === 'object' ? priorityBadgeVariant.className : ''}`}
                                        >
                                          {gap.priority}
                                        </Badge>
                                        {gap.blocker && (
                                          <Badge variant="destructive" className="text-xs">
                                            Blocker
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-muted-foreground text-xs mb-1">
                                        {gap.description}
                                      </p>
                                      {gap.recommendation && (
                                        <p className="text-primary text-xs">
                                          <span className="font-medium">Recommendation:</span> {gap.recommendation}
                                        </p>
                                      )}
                                      {gap.estimatedEffort && (
                                        <p className="text-muted-foreground text-xs mt-1">
                                          <span className="font-medium">Effort:</span> {gap.estimatedEffort}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No identified gaps data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowRefineModal(true)}
              className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white transition-all duration-300 shadow-2xl shadow-purple-500/25"
              size="lg"
              disabled={isReanalyzing}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refine PRD
            </Button>
            <Button 
              onClick={handleReanalyze}
              variant="outline"
              className="border-amber-500/50 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 transition-all duration-300"
              size="lg"
              disabled={isReanalyzing}
            >
              {isReanalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isReanalyzing ? "Re-analyzing..." : "Re-analyze Feature"}
            </Button>
            <Button 
              onClick={handleGenerateUserStories}
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300"
              size="lg"
              disabled={isReanalyzing || isGeneratingStories}
            >
              {isGeneratingStories ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              {isGeneratingStories ? "Generating..." : "Generate User Stories"}
            </Button>
          </div>
        </div>
      </main>

      {/* Refine PRD Modal */}
      <Dialog open={showRefineModal} onOpenChange={setShowRefineModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-gradient-to-br from-slate-900 to-purple-950 border-purple-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileEdit className="h-5 w-5 text-primary" />
              <span>Refined PRD</span>
            </DialogTitle>
            <DialogDescription>
              AI-generated refined Product Requirements Document. You can edit the content below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-0">
            <Textarea
              value={refinedPRD}
              onChange={(e) => setRefinedPRD(e.target.value)}
              className="min-h-[400px] resize-none bg-purple-900/30 border-purple-500/30 font-mono text-sm text-white placeholder:text-purple-300"
              placeholder="Refined PRD content will appear here..."
            />
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleRefineCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleRefineAccept}
              className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white"
            >
              Accept Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeatureDetail;