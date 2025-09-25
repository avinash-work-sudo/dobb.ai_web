import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast, useToast } from '@/hooks/use-toast';
import { url } from 'inspector';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Home,
  Loader2,
  Play,
  RefreshCw,
  Settings,
  Square,
  TestTube,
  User,
  XCircle
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ExecutionStep {
  stepNumber: number;
  instruction: string;
  success: boolean;
  durationMs: number;
  errorMessage?: string;
  screenshotPath?: string;
}

interface AutomationResult {
  executionId: string;
  status: string;
  framework: string;
  steps?: ExecutionStep[];
  artifacts?: any[];
  reportUrl?: string;
  error?: string;
  isComplete?: boolean;
  execution?: any;
}

const TestCaseRunner = () => {
  const { id, storyId, testCaseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Automation states
  const [task, setTask] = useState('');
  const [framework, setFramework] = useState<'playwright' | 'puppeteer'>('playwright');
  const [headless, setHeadless] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AutomationResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [hasShownCompletionToast, setHasShownCompletionToast] = useState(false);
  const [testCase, setTestCase] = useState<any>(null);
  const [isLoadingTestCase, setIsLoadingTestCase] = useState(true);
  const [userStory, setUserStory] = useState<any>(null);
  
  // Use ref for polling interval to avoid closure issues
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Convert test steps to automation task
  const convertStepsToTask = (steps: string[], expectedResult?: string) => {
    const numberedSteps = steps.map((step, index) => `Step ${index + 1}: ${step}.`);
    return numberedSteps.join(`\n`) + (expectedResult ? `\n\nExpected Result: ${expectedResult}` : '');
  };

  // Fetch test case data from database
  useEffect(() => {
    let isMounted = true;

    const fetchTestCaseData = async () => {
      if (!testCaseId || !storyId) return;

      try {
        // Fetch test case from database
        const { data: testCaseData, error: testCaseError } = await supabase
          .from('test_cases')
          .select('*')
          .eq('id', testCaseId)
          .single();

        if (testCaseError) {
          console.error('Error fetching test case:', testCaseError);
          toast({
            title: "Error",
            description: "Failed to load test case data",
            variant: "destructive",
          });
          return;
        }

        // Fetch user story data for additional context
        const { data: storyData, error: storyError } = await supabase
          .from('user_stories')
          .select('*')
          .eq('id', storyId)
          .single();

        if (storyError) {
          console.error('Error fetching user story:', storyError);
        }

        if (!isMounted) return;

        // Transform data for UI
        const transformedTestCase = {
          id: testCaseData.id,
          name: testCaseData.name,
          status: testCaseData.status || "not_executed",
          description: testCaseData.description,
          steps: testCaseData.steps || [],
          expectedResult: testCaseData.expected_result || "",
          priority: testCaseData.priority?.charAt(0).toUpperCase() + testCaseData.priority?.slice(1) || "Medium"
        };

        setTestCase(transformedTestCase);
        setUserStory(storyData);

        // Initialize automation task with test case steps
        if (transformedTestCase.steps.length > 0) {
          const automationTask = convertStepsToTask(transformedTestCase.steps, transformedTestCase.expectedResult);
          setTask(automationTask);
        }

      } catch (error) {
        console.error('Error fetching test case data:', error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to load test case data",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) setIsLoadingTestCase(false);
      }
    };

    fetchTestCaseData();
    return () => { isMounted = false; };
  }, [testCaseId, storyId, toast]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:3001');
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message:', data);
      
      if (data.type === 'automation_update') {
        handleAutomationUpdate(data);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setWs(null);
    };

    return () => {
      websocket.close();
    };
  }, []);
  // Cleanup effect for polling interval
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  const handleAutomationUpdate = (update: any) => {
    if (update.status === 'progress') {
      setCurrentStep(update.step || 'Processing...');
      setProgress(prev => Math.min(prev + 10, 90));
    } else if (update.status === 'completed' || update.status === 'failed' || update.status === 'error') {
      // Stop polling first
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        setPollingInterval(null);
      }
      
      setIsRunning(false);
      setProgress(100);
      setCurrentStep(update.status === 'completed' ? 'Completed successfully!' : 'Automation failed');
      
      // Show completion toast only once per execution
      if (!hasShownCompletionToast) {
        setHasShownCompletionToast(true);
        toast({
          title: update.status === 'completed' ? "Test Passed" : "Test Failed",
          description: `Test case "${testCase.name}" execution completed`,
          variant: update.status === 'completed' ? "default" : "destructive"
        });
      }
      
      // Fetch final results using current execution ID
      if (currentExecutionId) {
        fetchExecutionStatus(currentExecutionId).then(() => {
          // Auto-show report if test completed successfully
          if (update.status === 'completed') {
            setTimeout(() => {
              const url = `http://localhost:3001/api/artifacts/${currentExecutionId}/report`;
              setReportUrl(url);
              setShowReport(true);
            }, 500);
          }
        });
      }
    }
  };

  const runAutomation = async () => {
    if (!task.trim()) return;

    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    setIsRunning(true);
    setResult(null);
    setProgress(5);
    setCurrentStep('Starting test case automation...');
    setShowReport(false);
    setReportUrl(null);
    setCurrentExecutionId(null);
    setHasShownCompletionToast(false); // Reset completion toast flag

    try {
      const response = await fetch('http://localhost:3001/api/automation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          task: task.trim(), 
          framework,
          testCaseId: testCase.id,
          storyId,
          options: { 
            headless,
            viewport: { width: 1280, height: 720 },
            slowMo: 100
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        setCurrentExecutionId(data.executionId);
        setProgress(20);
        
        // Subscribe to WebSocket updates for this execution
        if (ws) {
          ws.send(JSON.stringify({
            type: 'subscribe_to_automation',
            automationId: data.executionId
          }));
        }
        
        // Start polling for status
        pollExecutionStatus(data.executionId);

        toast({
          title: "Test Case Started",
          description: `Running "${testCase.name}" with ${framework}`,
        });
      } else {
        setIsRunning(false);
        setResult(data);
        setCurrentStep('Failed to start automation');
        
        toast({
          title: "Failed to Start",
          description: data.error || "Could not start test automation",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Automation failed:', error);
      setIsRunning(false);
      setResult({ 
        executionId: '',
        status: 'error',
        framework,
        error: error instanceof Error ? error.message : 'Network error'
      });
      setCurrentStep('Network error occurred');
      
      toast({
        title: "Network Error",
        description: "Could not connect to automation service",
        variant: "destructive"
      });
    }
  };

  const pollExecutionStatus = async (executionId: string) => {
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    const poll = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_AUTOMATION_API_URL || 'http://localhost:3001'}/api/automation/status/${executionId}`);
        const data = await response.json();
        
        if (data.success) {
          setResult(data);
          
          if (data.isComplete) {
            // Clear polling interval
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
              setPollingInterval(null);
            }
            
            setIsRunning(false);
            setProgress(100);
            setCurrentStep(data.execution.status === 'passed' ? 'Test completed successfully!' : 'Test failed');
            
            // Show completion toast only if WebSocket didn't already show it
            if (!hasShownCompletionToast) {
              setHasShownCompletionToast(true);
              toast({
                title: data.execution.status === 'passed' ? "Test Passed" : "Test Failed",
                description: `Test case "${testCase.name}" execution completed`,
                variant: data.execution.status === 'passed' ? "default" : "destructive"
              });
            }
            
            // Auto-show report if completed successfully
            if (data.execution.status === 'passed') {
              setTimeout(() => {
                const url = `http://localhost:3001/api/artifacts/${executionId}/report`;
                setReportUrl(url);
                setShowReport(true);
              }, 500);
            }
            return;
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        // Stop polling on error
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setPollingInterval(null);
        }
      }
    };
    
    // Start polling with setInterval instead of setTimeout to avoid stale closures
    const interval = setInterval(poll, 2000);
    pollingIntervalRef.current = interval;
    setPollingInterval(interval);
    
    // Initial poll
    poll();
  };

  const fetchExecutionStatus = async (executionId: string): Promise<void> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_AUTOMATION_API_URL || 'http://localhost:3001'}/api/automation/status/${executionId}`);
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const stopAutomation = async () => {
    if (!currentExecutionId) return;

    // Clear polling first
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    try {
      await fetch(`${import.meta.env.VITE_AUTOMATION_API_URL || 'http://localhost:3001'}/api/automation/stop/${currentExecutionId}`, {
        method: 'POST'
      });
      
      setIsRunning(false);
      setCurrentStep('Stopped by user');
      
      toast({
        title: "Test Stopped",
        description: "Test execution was stopped by user",
      });
    } catch (error) {
      console.error('Error stopping automation:', error);
    }
  };

  const toggleReportView = () => {
    if (!currentExecutionId) return;
    
    if (!showReport) {
      const url = `http://localhost:3001/api/artifacts/${currentExecutionId}/report`;
      setReportUrl(url);
      setShowReport(true);
      
      toast({
        title: "Loading Report",
        description: "Test execution report is loading...",
      });
    } else {
      setShowReport(false);
      setReportUrl(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed':
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'running':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Show loading state while fetching test case data
  if (isLoadingTestCase) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-surface-elevated">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate(`/feature/${id}/stories/${storyId}`)}
                  className="hover:bg-surface-subtle"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Button>
                <div className="bg-gradient-primary p-2 rounded-lg shadow-elegant">
                  <TestTube className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Test Case Runner</h1>
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
                    Loading Test Case
                  </h3>
                  <p className="text-muted-foreground">
                    Fetching test case details...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Show error state if test case not found
  if (!testCase) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-surface-elevated">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate(`/feature/${id}/stories/${storyId}`)}
                  className="hover:bg-surface-subtle"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Button>
                <div className="bg-gradient-primary p-2 rounded-lg shadow-elegant">
                  <TestTube className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Test Case Runner</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Test Case Not Found</h1>
            <p className="text-muted-foreground mb-6">The requested test case could not be found.</p>
            <Button onClick={() => navigate(`/feature/${id}/stories/${storyId}`)}>
              Back to User Story
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
                onClick={() => navigate(`/feature/${id}/stories/${storyId}`)}
                className="hover:bg-surface-subtle"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </Button>
              <div className="bg-gradient-primary p-2 rounded-lg shadow-elegant">
                <TestTube className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Test Case Runner</h1>
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
                  <BreadcrumbLink 
                    onClick={() => navigate(`/feature/${id}`)}
                    className="cursor-pointer"
                  >
                    Feature Analysis
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => navigate(`/feature/${id}/stories`)}
                    className="cursor-pointer"
                  >
                    Stories
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => navigate(`/feature/${id}/stories/${storyId}`)}
                    className="cursor-pointer"
                  >
                    {userStory?.title || "User Story"}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Test Case #{testCase.id}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Test Case Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Badge className={`text-xs border ${getPriorityColor(testCase.priority)}`}>
                {testCase.priority} Priority
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                Test Case #{testCase.id}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {testCase.name}
            </h1>
            
            {/* Test Case Description */}
            <Card className="bg-surface-elevated border border-border mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Test Case Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed mb-4">
                  {testCase.description}
                </p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Test Steps:</h4>
                  <ol className="space-y-1">
                    {testCase.steps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Expected Result:</h4>
                  <p className="text-sm text-muted-foreground bg-surface-subtle p-3 rounded-lg">
                    {testCase.expectedResult}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Automation Control Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="h-5 w-5 text-primary" />
                  <span>AI-Powered Test Automation</span>
                </CardTitle>
                <CardDescription>
                  This test case will be executed using natural language automation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Browser Framework:
                    </label>
                    <Select value={framework} onValueChange={(value) => setFramework(value as 'playwright' | 'puppeteer')} disabled={isRunning}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="playwright">
                          🎭 Playwright (Multi-browser)
                        </SelectItem>
                        <SelectItem value="puppeteer">
                          🐶 Puppeteer (Chrome focus)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="headless"
                      checked={headless}
                      onCheckedChange={setHeadless}
                      disabled={isRunning}
                    />
                    <label htmlFor="headless" className="text-sm font-medium">
                      Run in headless mode
                    </label>
                  </div>
                </div>

                {/* Task Input */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Automation Task (Auto-generated from test steps):
                  </label>
                  <Textarea
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    rows={4}
                    className="resize-none"
                    disabled={isRunning}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This task was automatically generated from the test case steps. You can modify it if needed.
                  </p>
                </div>
                
                {/* Control Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={runAutomation} 
                    disabled={isRunning || !task.trim()}
                    className="flex-1"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running Test Case...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Test with {framework === 'playwright' ? 'Playwright' : 'Puppeteer'}
                      </>
                    )}
                  </Button>
                  
                  {isRunning && (
                    <Button 
                      onClick={stopAutomation}
                      variant="destructive"
                      size="icon"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Progress */}
                {isRunning && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{currentStep}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      {getStatusIcon(result.execution?.status || result.status)}
                      <span>Test Execution Results</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {result.framework}
                      </Badge>
                      <Badge className={`text-xs border ${getStatusColor(result.execution?.status || result.status)}`}>
                        {result.execution?.status || result.status}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Execution Info */}
                    {result.execution && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <div className="font-medium">
                            {result.execution.duration_ms ? `${Math.round(result.execution.duration_ms / 1000)}s` : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Steps:</span>
                          <div className="font-medium">{result.steps?.length || 0}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Started:</span>
                          <div className="font-medium">
                            {result.execution.started_at ? new Date(result.execution.started_at).toLocaleTimeString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Artifacts:</span>
                          <div className="font-medium">{result.artifacts?.length || 0}</div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {currentExecutionId && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => fetchExecutionStatus(currentExecutionId)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh
                        </Button>
                      )}
                      
                      {result.artifacts?.find(a => a.artifact_type === 'html_report') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={toggleReportView}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {showReport ? 'Hide Report' : 'View Report'}
                          {showReport ? (
                            <ChevronUp className="ml-1 h-3 w-3" />
                          ) : (
                            <ChevronDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      )}

                      {result.artifacts?.find(a => a.artifact_type === 'html_report') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`http://localhost:3001/api/artifacts/${currentExecutionId}/report/normal`, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open in New Tab
                        </Button>
                      )}

                      {currentExecutionId && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`http://localhost:3001/api/artifacts/${currentExecutionId}/report/playwright`, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Playwright Trace
                        </Button>
                      )}

                      {result.artifacts?.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`http://localhost:3001/api/artifacts/${currentExecutionId}/screenshots`, '_blank')}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Screenshots
                        </Button>
                      )}

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/feature/${id}/stories/${storyId}/test-summary`)}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View All Results
                      </Button>
                    </div>

                    {/* Inline Report Display */}
                    {showReport && reportUrl && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">Test Execution Report</h4>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowReport(false)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="border border-border rounded-lg overflow-hidden">
                          <iframe
                            src={'../backend/artifacts/reports/report_1758735090797.html'}
                            className="w-full h-96 border-0"
                            title="Test Execution Report"
                            sandbox="allow-scripts allow-same-origin"
                            onLoad={() => {
                              toast({
                                title: "Report Loaded",
                                description: "Test execution report has been loaded successfully",
                              });
                            }}
                            onError={() => {
                              toast({
                                title: "Report Error",
                                description: "Failed to load the test execution report",
                                variant: "destructive"
                              });
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          📊 This report contains detailed execution steps, screenshots, and debugging information.
                        </p>
                      </div>
                    )}

                    {/* Error Message */}
                    {(result.error || result.execution?.error_message) && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm">
                          <strong>Error:</strong> {result.error || result.execution?.error_message}
                        </p>
                      </div>
                    )}

                    {/* Steps Summary */}
                    {result.steps && result.steps.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Execution Steps:</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {result.steps.map((step, index) => (
                            <div key={index} className="flex items-start space-x-3 p-2 rounded border text-sm">
                              {step.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="font-medium">{step.instruction}</div>
                                <div className="text-muted-foreground text-xs">
                                  Step {step.stepNumber} • {step.durationMs}ms
                                  {step.errorMessage && ` • Error: ${step.errorMessage}`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestCaseRunner;

