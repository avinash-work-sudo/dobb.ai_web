import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  Eye
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
}

const EXAMPLE_TASKS = [
  "Navigate to Google, search for 'React testing', and click on the first result",
  "Go to GitHub, sign in, and create a new repository named 'test-automation'",
  "Visit an e-commerce site, add a product to cart, and proceed to checkout",
  "Open a social media platform, create a new post with text 'Hello World!'",
  "Navigate to a news website, find the technology section, and read the latest article"
];

export function AutomationRunner() {
  const [task, setTask] = useState('');
  const [framework, setFramework] = useState<'playwright' | 'puppeteer'>('playwright');
  const [headless, setHeadless] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AutomationResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);

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
    setCurrentStep('Starting automation...');

    try {
      const response = await fetch('http://localhost:3001/api/automation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          task: task.trim(), 
          framework,
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
      } else {
        setIsRunning(false);
        setResult(data);
        setCurrentStep('Failed to start automation');
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
            setCurrentStep(data.execution.status === 'passed' ? 'Completed successfully!' : 'Automation failed');
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

  return (
    <div className="space-y-6">
      {/* Main Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-primary" />
            <span>AI-Powered Test Automation</span>
          </CardTitle>
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
              Task Description (Natural Language):
            </label>
            <Textarea
              placeholder="Example: Go to Google, search for 'React testing', and click on the first result"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={isRunning}
            />
          </div>
          
          {/* Example Tasks */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_TASKS.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setTask(example)}
                  disabled={isRunning}
                  className="text-xs h-auto py-1 px-2"
                >
                  {example.length > 60 ? `${example.substring(0, 60)}...` : example}
                </Button>
              ))}
            </div>
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
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run with {framework === 'playwright' ? 'Playwright' : 'Puppeteer'}
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
                <span>Test Results</span>
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
  );
}
