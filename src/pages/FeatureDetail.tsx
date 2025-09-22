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
  Users
} from "lucide-react";

const FeatureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [refinedPRD, setRefinedPRD] = useState("");

  // Mock feature data
  const feature = {
    id: 1,
    title: "User Authentication System",
    description: "Complete user registration, login, and password reset functionality",
    status: "completed",
    priority: "high",
    sourceType: "PRD",
  };

  // Mock refined PRD content
  const mockRefinedPRD = `# Enhanced User Authentication System

## Overview
This document outlines the requirements for implementing a comprehensive user authentication system that includes registration, login, password reset, and session management capabilities.

## Features
1. **User Registration**
   - Email/username validation
   - Password strength requirements
   - Email verification process
   - Terms of service acceptance

2. **User Login**
   - Multi-factor authentication support
   - Remember me functionality
   - Account lockout after failed attempts
   - Social login integration (Google, GitHub)

3. **Password Management**
   - Secure password reset via email
   - Password history tracking
   - Password expiration policies
   - Account recovery options

## Technical Requirements
- JWT token-based authentication
- HTTPS encryption for all auth endpoints
- Rate limiting on authentication attempts
- Audit logging for security events

## Success Metrics
- 99.9% authentication uptime
- < 500ms average response time
- Zero security incidents
- 95% user satisfaction score`;

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
      setRefinedPRD(mockRefinedPRD);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefineAccept = () => {
    console.log("Accepting refined PRD:", refinedPRD);
    setShowRefineModal(false);
    // Here you would save the refined PRD
  };

  const handleRefineCancel = () => {
    setShowRefineModal(false);
    setRefinedPRD(mockRefinedPRD); // Reset to original
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
                The User Authentication System is a critical infrastructure component that requires careful implementation across multiple application layers. The analysis reveals significant dependencies on the database layer, API gateway, and frontend components. This feature introduces moderate complexity with high business value and requires coordination between backend and frontend teams.
              </p>
            </CardContent>
          </Card>

          {/* Impact Report */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Impacted Modules */}
            <Card className="bg-surface-elevated border border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-blue-500" />
                  <span>Impacted Modules</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">User Database</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">High</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Auth Service</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">High</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">API Gateway</span>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Medium</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Frontend UI</span>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Medium</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Impacts */}
            <Card className="bg-surface-elevated border border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span>Technical Impacts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Complexity Score</span>
                      <span className="text-sm font-bold text-yellow-400">7.5/10</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Risk Level</span>
                      <span className="text-sm font-bold text-red-400">6.2/10</span>
                    </div>
                    <Progress value={62} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Dependencies</span>
                      <span className="text-sm font-bold text-blue-400">4.1/10</span>
                    </div>
                    <Progress value={41} className="h-2" />
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Estimated development time: 120-150 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Identified Gaps */}
            <Card className="bg-surface-elevated border border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Identified Gaps</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Security Audit</p>
                      <p className="text-xs text-muted-foreground">Penetration testing required</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Rate Limiting</p>
                      <p className="text-xs text-muted-foreground">Anti-brute force measures</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Monitoring</p>
                      <p className="text-xs text-muted-foreground">Auth failure analytics</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Documentation</p>
                      <p className="text-xs text-muted-foreground">API docs and testing guide</p>
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
              onClick={() => navigate('/user-stories')}
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