import { impactAnalysisAPI } from "@/api/impact-analysis";
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
import { useEffect, useState } from "react";
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

  const generateRefinedPRD = (analysis: any) => {
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
  };

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

      // Only generate new user stories if none exist
      const dummyUserStories = [
        {
          title: "User Registration with Email Verification",
          description: "As a new user, I want to register with my email address and receive a verification email so that I can create a secure account.",
          acceptance_criteria: [
            "User can enter email and password",
            "Verification email is sent within 30 seconds",
            "User can click verification link to activate account",
            "Invalid email formats are rejected with clear error messages"
          ],
          priority: "high",
          estimated_hours: 8,
          status: "draft",
          test_cases: [
            {
              name: "Successful User Registration with Valid Email",
              description: "Verify that a user can successfully register with a valid email address and strong password",
              steps: [
                "Navigate to registration page",
                "Enter valid email address (test@example.com)",
                "Enter strong password (minimum 8 characters, uppercase, lowercase, number, symbol)",
                "Confirm password matches",
                "Click 'Register' button",
                "Verify success message is displayed",
                "Check that verification email is sent"
              ],
              expected_result: "User account is created and verification email is sent",
              priority: "high"
            },
            {
              name: "Registration Fails with Invalid Email Format",
              description: "Verify that registration fails when user enters invalid email format",
              steps: [
                "Navigate to registration page",
                "Enter invalid email format (test@invalid)",
                "Enter valid password",
                "Click 'Register' button",
                "Verify error message is displayed"
              ],
              expected_result: "Registration fails with appropriate error message",
              priority: "high"
            }
          ]
        },
        {
          title: "OAuth Integration for Social Login",
          description: "As a user, I want to login using my Google or GitHub account so that I can access the platform quickly without creating a new password.",
          acceptance_criteria: [
            "Google OAuth integration works correctly",
            "GitHub OAuth integration works correctly",
            "User profile data is synced from OAuth provider",
            "Account linking works for existing users"
          ],
          priority: "medium",
          estimated_hours: 12,
          status: "draft",
          test_cases: [
            {
              name: "Google OAuth Integration Test",
              description: "Test the Google OAuth login flow",
              steps: [
                "Click 'Login with Google' button",
                "Verify Google OAuth popup opens",
                "Complete Google authentication",
                "Verify user is logged in with Google profile"
              ],
              expected_result: "User successfully logs in using Google OAuth",
              priority: "high"
            },
            {
              name: "GitHub OAuth Integration Test", 
              description: "Test the GitHub OAuth login flow",
              steps: [
                "Click 'Login with GitHub' button",
                "Verify GitHub OAuth popup opens",
                "Complete GitHub authentication",
                "Verify user is logged in with GitHub profile"
              ],
              expected_result: "User successfully logs in using GitHub OAuth",
              priority: "medium"
            }
          ]
        },
        {
          title: "User Profile Management",
          description: "As a registered user, I want to update my profile information including name, avatar, and preferences so that I can personalize my experience.",
          acceptance_criteria: [
            "User can update display name",
            "User can upload and crop avatar image",
            "User can set email preferences",
            "Changes are saved and reflected immediately"
          ],
          priority: "low",
          estimated_hours: 6,
          status: "draft",
          test_cases: [
            {
              name: "Profile Information Update Test",
              description: "Test updating user profile information",
              steps: [
                "Navigate to profile settings",
                "Update display name",
                "Save changes",
                "Verify changes are reflected"
              ],
              expected_result: "Profile information is successfully updated",
              priority: "medium"
            }
          ]
        }
      ];

      // Store user stories in Supabase (without test_cases)
      const userStoriesToInsert = dummyUserStories.map(story => ({
        feature_id: id,
        title: story.title,
        description: story.description,
        acceptance_criteria: story.acceptance_criteria,
        priority: story.priority,
        estimated_hours: story.estimated_hours,
        status: story.status
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

      // Now insert test cases for each user story
      const testCasesToInsert = [];
      for (let i = 0; i < dummyUserStories.length; i++) {
        const story = dummyUserStories[i];
        const insertedStory = insertedStories[i];
        
        for (const testCase of story.test_cases) {
          testCasesToInsert.push({
            user_story_id: insertedStory.id,
            name: testCase.name,
            description: testCase.description,
            steps: testCase.steps,
            expected_result: testCase.expected_result,
            priority: testCase.priority,
            status: 'not_executed'
          });
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
        description: `Successfully generated ${dummyUserStories.length} user stories with test cases`,
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
              <div className="bg-gradient-primary p-2 rounded-lg shadow-elegant">
                <BarChart3 className="h-6 w-6 text-white" />
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
          <Card className="bg-surface-elevated border border-border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>AI-Generated Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                {aiSummary || "Summary will appear once analysis completes."}
              </p>
            </CardContent>
          </Card>

          {/* Impact Report */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Impacted Modules - Product Perspective */}
            <Card className="bg-surface-elevated border border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-blue-500" />
                  <span>Impacted Modules</span>
                </CardTitle>
                <CardDescription>Business and product areas affected by this feature</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">User Management</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">High</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">User Onboarding</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">High</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Account Settings</span>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Medium</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Analytics & Reporting</span>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Low</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Admin Dashboard</span>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Medium</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Impacts - Technical/Coding Perspective */}
            <Card className="bg-surface-elevated border border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-yellow-500" />
                  <span>Technical Impacts</span>
                </CardTitle>
                <CardDescription>Technical components and code modules affected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">User Schema Tables</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Auth Service Layer</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">High</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">API Gateway Middleware</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">High</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">React Auth Components</span>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Medium</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Session Management</span>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Medium</Badge>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <span>Complexity: 8.5/10</span>
                      <span>Effort: 120-150h</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Identified Gaps - Detailed by Category */}
            <Card className="bg-surface-elevated border border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Identified Gaps</span>
                </CardTitle>
                <CardDescription>Technical feasibility concerns and missing requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Security Gaps */}
                  <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-2">Security</h4>
                    <div className="space-y-2 pl-3 border-l-2 border-red-500/30">
                      <div className="text-xs">
                        <p className="text-foreground font-medium">• Penetration Testing Protocol</p>
                        <p className="text-muted-foreground">Comprehensive security audit including OWASP top 10 vulnerabilities, SQL injection, and XSS testing</p>
                      </div>
                      <div className="text-xs">
                        <p className="text-foreground font-medium">• Multi-factor Authentication</p>
                        <p className="text-muted-foreground">Integration with TOTP, SMS, and hardware security keys for enhanced account protection</p>
                      </div>
                    </div>
                  </div>

                  {/* Monitoring Gaps */}
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-400 mb-2">Monitoring</h4>
                    <div className="space-y-2 pl-3 border-l-2 border-yellow-500/30">
                      <div className="text-xs">
                        <p className="text-foreground font-medium">• Authentication Analytics</p>
                        <p className="text-muted-foreground">Real-time monitoring of failed login attempts, suspicious patterns, and geographic anomalies</p>
                      </div>
                      <div className="text-xs">
                        <p className="text-foreground font-medium">• Performance Metrics</p>
                        <p className="text-muted-foreground">Response time tracking, database query optimization, and load balancing effectiveness</p>
                      </div>
                    </div>
                  </div>

                  {/* Documentation Gaps */}
                  <div>
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">Documentation</h4>
                    <div className="space-y-2 pl-3 border-l-2 border-blue-500/30">
                      <div className="text-xs">
                        <p className="text-foreground font-medium">• API Documentation</p>
                        <p className="text-muted-foreground">Complete OpenAPI specs, rate limiting details, and error code references for developer integration</p>
                      </div>
                      <div className="text-xs">
                        <p className="text-foreground font-medium">• Security Guidelines</p>
                        <p className="text-muted-foreground">Password policies, session management best practices, and compliance requirements documentation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowRefineModal(true)}
              className="bg-gradient-primary text-white hover:opacity-90 transition-all duration-300"
              size="lg"
              disabled={isReanalyzing}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refine PRD
            </Button>
            <Button 
              onClick={handleReanalyze}
              variant="outline"
              className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white transition-all duration-300"
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
              className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
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
        <DialogContent className="max-w-4xl max-h-[80vh] bg-surface-elevated border border-border">
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
              className="min-h-[400px] resize-none bg-surface-subtle border-border font-mono text-sm"
              placeholder="Refined PRD content will appear here..."
            />
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleRefineCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleRefineAccept}
              className="bg-gradient-primary text-white hover:opacity-90"
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