import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  Play, 
  Square, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock,
  ExternalLink,
  Download,
  RefreshCw,
  Eye,
  ArrowLeft,
  TestTube,
  Settings,
  User,
  BarChart3,
  Home,
  FileText
} from 'lucide-react';

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

  // Mock test case data - in real app, this would be fetched based on testCaseId
  const testCase = {
    id: parseInt(testCaseId || '1'),
    name: "Successful User Registration with Valid Email",
    status: "not_executed",
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
    expectedResult: "User account is created and verification email is sent",
    priority: "High"
  };

  // Convert test steps to automation task
  const convertStepsToTask = (steps: string[]) => {
    return steps.join('. ') + '. ' + testCase.expectedResult;
  };

  // Initialize with test case steps
  useEffect(() => {
    const automationTask = convertStepsToTask(testCase.steps);
    setTask(automationTask);
  }, [testCaseId]);

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

  const handleAutomationUpdate = (update: any) => {
    if (update.status === 'progress') {
      setCurrentStep(update.step || 'Processing...');
      setProgress(prev => Math.min(prev + 10, 90));
    } else if (update.status === 'completed' || update.status === 'failed' || update.status === 'error') {
      setIsRunning(false);
      setProgress(100);
      setCurrentStep(update.status === 'completed' ? 'Completed successfully!' : 'Automation failed');
      
      // Fetch final results
      if (result?.executionId) {
        fetchExecutionStatus(result.executionId);
      }
    }
  };

  const runAutomation = async () => {
    if (!task.trim()) return;

    setIsRunning(true);
    setResult(null);
    setProgress(5);
    setCurrentStep('Starting test case automation...');

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
    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/automation/status/${executionId}`);
        const data = await response.json();
        
        if (data.success) {
          setResult(data);
          
          if (data.isComplete) {
            setIsRunning(false);
            setProgress(100);
            setCurrentStep(data.execution.status === 'passed' ? 'Test completed successfully!' : 'Test failed');
            
            toast({
              title: data.execution.status === 'passed' ? "Test Passed" : "Test Failed",
              description: `Test case "${testCase.name}" execution completed`,
              variant: data.execution.status === 'passed' ? "default" : "destructive"
            });
            return;
          }
        }
        
        // Continue polling if not complete
        if (isRunning) {
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };
    
    poll();
  };

  const fetchExecutionStatus = async (executionId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/automation/status/${executionId}`);
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const stopAutomation = async () => {
    if (!result?.executionId) return;

    try {
      await fetch(`http://localhost:3001/api/automation/stop/${result.executionId}`, {
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
                    User Authentication System
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
                    User Registration
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
                    <Select value={framework} onValueChange={setFramework} disabled={isRunning}>
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
                      {result.executionId && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => fetchExecutionStatus(result.executionId)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh
                        </Button>
                      )}
                      
                      {result.artifacts?.find(a => a.artifact_type === 'html_report') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`http://localhost:3001/api/artifacts/${result.executionId}/report`, '_blank')}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Report
                        </Button>
                      )}

                      {result.artifacts?.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`http://localhost:3001/api/artifacts/${result.executionId}/screenshots`, '_blank')}
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
