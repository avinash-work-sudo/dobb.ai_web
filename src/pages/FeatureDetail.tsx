import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  ArrowLeft, 
  BarChart3, 
  Settings, 
  User, 
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Code,
  Database,
  Cpu,
  Globe,
  RefreshCw,
  FileEdit,
  Users,
  Home
} from "lucide-react";
import { impactAnalysisAPI } from "@/api/impact-analysis";

const FeatureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [refinedPRD, setRefinedPRD] = useState("");
  const [originalRefinedPRD, setOriginalRefinedPRD] = useState("");
  const [impactAnalysis, setImpactAnalysis] = useState<any | null>(null);
  const [aiSummary, setAiSummary] = useState("");

  // Mock feature data
  const feature = {
    id: 1,
    title: "User Authentication System",
    description: "Complete user registration, login, and password reset functionality",
    status: "completed",
    priority: "high",
    sourceType: "PRD",
  };

  const generateRefinedPRD = (analysis: any) => {
    const s = analysis?.summary;
    const modules = analysis?.impactedModules || [];
    const tech = analysis?.technicalImpacts || [];
    const gaps = analysis?.identifiedGaps || [];
    return `# Refined PRD: ${feature.title}

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

  useEffect(() => {
    let isMounted = true;
    document.title = `${feature.title} - Impact Analysis | DOBB.ai`;

    (async () => {
      try {
        const res = await impactAnalysisAPI.startAnalysis({
          featureId: String(id ?? feature.id),
          fileUrl: ""
        });
        if (!isMounted) return;
        setImpactAnalysis(res.impactAnalysis);
        setAiSummary(res.impactAnalysis.summary || "No summary available");
        setRefinedPRD(res.impactAnalysis.refined_prd || "No refined PRD available");
        setOriginalRefinedPRD(res.impactAnalysis.refined_prd || "");
      } catch (e) {
        console.error("Impact analysis failed", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [id]);

  const handleRefineAccept = () => {
    console.log("Accepting refined PRD:", refinedPRD);
    setShowRefineModal(false);
    // Here you would save the refined PRD
  };

  const handleRefineCancel = () => {
    setShowRefineModal(false);
    setRefinedPRD(originalRefinedPRD); // Reset to original
  };

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

        {/* Loading Content */}
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {feature.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                Analyzing feature impact and generating comprehensive report...
              </p>
            </div>

            <Card className="bg-surface-elevated border border-border">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="relative mb-6">
                    <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Processing Feature Analysis
                  </h3>
                  
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Extracting requirements</span>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Analyzing dependencies</span>
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Identifying risks</span>
                      <div className="w-4 h-4 rounded-full bg-muted"></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Generating report</span>
                      <div className="w-4 h-4 rounded-full bg-muted"></div>
                    </div>
                  </div>
                  
                  <Progress value={65} className="mt-6 max-w-md mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Estimated time remaining: 2 minutes
                  </p>
                </div>
              </CardContent>
            </Card>
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
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refine PRD
            </Button>
            <Button 
              onClick={() => navigate(`/feature/${id}/stories`)}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
              size="lg"
            >
              <Users className="h-4 w-4 mr-2" />
              Generate User Stories
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