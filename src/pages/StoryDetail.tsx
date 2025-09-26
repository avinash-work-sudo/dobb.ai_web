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
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  FileText,
  Home,
  Play,
  RefreshCw,
  Settings,
  TestTube,
  User,
  XCircle
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


interface TestCase {
  id: number;
  name: string;
  status: string;
  description: string;
  steps: string[];
  expectedResult: string;
  priority: string;
}

const StoryDetail = () => {
  const { id, storyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTestCases, setSelectedTestCases] = useState<number[]>([]);
  const [showTestStepsModal, setShowTestStepsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [story, setStory] = useState<any>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [featureTitle, setFeatureTitle] = useState("Feature Analysis");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to fetch story and test cases data from database
  const fetchStoryData = useCallback(async (showRefreshIndicator = false) => {
    if (!storyId) return;

    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }

    try {
      // Fetch user story from database
      const { data: storyData, error: storyError } = await supabase
        .from('user_stories')
        .select('*')
        .eq('id', storyId)
        .single();

      if (storyError) {
        console.error('Error fetching user story:', storyError);
        toast({
          title: "Error",
          description: "Failed to load user story data",
          variant: "destructive",
        });
        return;
      }

      // Fetch test cases for this story
      const { data: testCasesData, error: testCasesError } = await supabase
        .from('test_cases')
        .select('*')
        .eq('user_story_id', storyId)
        .order('created_at', { ascending: true });

      if (testCasesError) {
        console.error('Error fetching test cases:', testCasesError);
        toast({
          title: "Error",
          description: "Failed to load test cases",
          variant: "destructive",
        });
      }

      // Fetch feature info for breadcrumb
      if (id) {
        const { data: featureData, error: featureError } = await supabase
          .from('features')
          .select(`
            id,
            impact_analysis (
              impact_json
            )
          `)
          .eq('id', id)
          .single();

        if (!featureError && featureData?.impact_analysis?.[0]) {
          const analysisData = featureData.impact_analysis[0].impact_json as any;
          setFeatureTitle(analysisData?.title || `Feature ${id.slice(0, 8)}`);
        }
      }

      // Transform story data for UI
      const transformedStory = {
        id: storyData.id,
        title: storyData.title,
        description: storyData.description,
        acceptanceCriteria: storyData.acceptance_criteria || [],
        priority: storyData.priority?.charAt(0).toUpperCase() + storyData.priority?.slice(1) || "Medium",
        estimatedHours: storyData.estimated_hours || 0,
      };

      // Transform test cases data for UI
      const transformedTestCases = (testCasesData || []).map((testCase: any) => ({
        id: testCase.id,
        name: testCase.name,
        status: testCase.status || "not_executed",
        description: testCase.description || "",
        steps: testCase.steps || [],
        expectedResult: testCase.expected_result || "",
        priority: testCase.priority?.charAt(0).toUpperCase() + testCase.priority?.slice(1) || "Medium"
      }));

      setStory(transformedStory);
      setTestCases(transformedTestCases);

    } catch (error) {
      console.error('Error fetching story data:', error);
      toast({
        title: "Error",
        description: "Failed to load story data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (showRefreshIndicator) {
        setIsRefreshing(false);
      }
    }
  }, [storyId, id, toast]);

  // Manual refresh function
  const handleRefresh = async () => {
    await fetchStoryData(true);
    toast({
      title: "Refreshed",
      description: "Test case data has been refreshed",
    });
  };

  // Initial data fetch
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchStoryData();
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [storyId, id, toast, fetchStoryData]);

  // Refresh data when window gains focus or becomes visible (e.g., when returning from test runner)
  useEffect(() => {
    const handleFocus = async () => {
      console.log('Window focused, refreshing test case data...');
      await fetchStoryData();
    };

    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing test case data...');
        await fetchStoryData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchStoryData]);

  // Update test cases state after successful edit
  const updateTestCaseInState = (updatedTestCase: any) => {
    setTestCases(prevTestCases => 
      prevTestCases.map(tc => 
        tc.id === updatedTestCase.id 
          ? {
              ...tc,
              name: updatedTestCase.name,
              description: updatedTestCase.description,
              expectedResult: updatedTestCase.expected_result,
              priority: updatedTestCase.priority?.charAt(0).toUpperCase() + updatedTestCase.priority?.slice(1) || "Medium",
              status: updatedTestCase.status,
              steps: updatedTestCase.steps
            }
          : tc
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "not_executed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />;
      case "not_executed":
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleSelectTestCase = (testCaseId: number, checked: boolean) => {
    if (checked) {
      setSelectedTestCases([...selectedTestCases, testCaseId]);
    } else {
      setSelectedTestCases(selectedTestCases.filter(id => id !== testCaseId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTestCases(testCases.map(test => test.id));
    } else {
      setSelectedTestCases([]);
    }
  };

  const handleRunTest = async (testCaseId: number) => {
    // Navigate to the TestCaseRunner page
    navigate(`/feature/${id}/stories/${storyId}/test-case/${testCaseId}`);
  };

  const handleViewTestCase = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setShowTestStepsModal(true);
  };

  const handleEditTestCase = (testCase: TestCase) => {
    setEditingTestCase({
      ...testCase,
      steps: testCase.steps || [],
      expected_result: testCase.expectedResult
    });
    setShowEditModal(true);
  };

  const handleSaveTestCase = async () => {
    if (!editingTestCase) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('test_cases')
        .update({
          name: editingTestCase.name?.trim(),
          description: editingTestCase.description?.trim(),
          steps: editingTestCase.steps || [],
          expected_result: editingTestCase.expected_result?.trim(),
          priority: editingTestCase.priority,
          status: editingTestCase.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTestCase.id);

      if (error) {
        console.error('Error updating test case:', error);
        toast({
          title: "Update Failed",
          description: "Failed to update test case",
          variant: "destructive",
        });
        return;
      }

      // Update the test case in local state
      updateTestCaseInState(editingTestCase);

      toast({
        title: "Test Case Updated",
        description: "Test case has been updated successfully",
      });

      setShowEditModal(false);
      setEditingTestCase(null);

    } catch (error) {
      console.error('Error saving test case:', error);
      toast({
        title: "Error",
        description: "Failed to save test case",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingTestCase(null);
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

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-surface-elevated">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate(`/feature/${id}/stories`)}
                  className="hover:bg-surface-subtle"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Button>
                <div className="p-2 rounded-lg shadow-elegant">
                  <img src="/head.png" alt="dobb.ai" className="size-10" />
                </div>
                <h1 className="text-xl font-bold text-foreground">dobb.ai</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-surface-elevated border border-border">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="animate-spin h-16 w-16 text-primary mx-auto mb-6 border-4 border-primary border-t-transparent rounded-full"></div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Loading User Story
                  </h3>
                  <p className="text-muted-foreground">
                    Fetching story details and test cases...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Show error state if story not found
  if (!story) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-surface-elevated">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate(`/feature/${id}/stories`)}
                  className="hover:bg-surface-subtle"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Button>
                <div className="p-2 rounded-lg shadow-elegant">
                  <img src="/head.png" alt="dobb.ai" className="size-10" />
                </div>
                <h1 className="text-xl font-bold text-foreground">dobb.ai</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">User Story Not Found</h1>
            <p className="text-muted-foreground mb-6">The requested user story could not be found.</p>
            <Button onClick={() => navigate(`/feature/${id}/stories`)}>
              Back to Stories
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
                onClick={() => navigate(`/feature/${id}/stories`)}
                className="hover:bg-purple-500/20 text-purple-200 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-amber-500 rounded-lg flex items-center justify-center">
                <img src="/head.png" alt="dobb.ai" className="w-5 h-5 rounded" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-amber-300 bg-clip-text text-transparent">dobb.ai</h1>
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
        <div className="max-w-7xl mx-auto">
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
                    {featureTitle}
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
                  <BreadcrumbPage>{story.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Story Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Badge className={`text-xs border ${getPriorityColor(story.priority)}`}>
                {story.priority} Priority
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                {story.estimatedHours}h estimated
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {story.title}
            </h1>
            
            {/* Story Description */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-300" />
                  <span className="text-white">Story Description</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-100 leading-relaxed mb-4">
                  {story.description}
                </p>
                
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Acceptance Criteria:</h4>
                  <ul className="space-y-1">
                    {story.acceptanceCriteria.map((criteria, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-purple-200">{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Cases Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300">{testCases.length}</div>
                  <div className="text-sm text-purple-200">Total Tests</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {testCases.filter(test => test.status === "passed").length}
                  </div>
                  <div className="text-sm text-purple-200">Passed</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {testCases.filter(test => test.status === "failed").length}
                  </div>
                  <div className="text-sm text-purple-200">Failed</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">
                    {testCases.filter(test => test.status === "not_executed").length}
                  </div>
                  <div className="text-sm text-purple-200">Not Executed</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Summary Button - Show if any tests have been executed */}
          {(testCases.some(test => test.status === "passed" || test.status === "failed")) && (
            <div className="mb-6 text-center">
              <Button 
                onClick={() => navigate(`/feature/${id}/stories/${storyId}/test-summary`)}
                className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white transition-all duration-300 shadow-2xl shadow-purple-500/25"
                size="lg"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Test Summary
              </Button>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedTestCases.length === testCases.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select All ({selectedTestCases.length} selected)
              </span>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                title="Refresh test case data"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button 
                variant="outline"
                disabled={selectedTestCases.length === 0}
                className="border-amber-500/50 text-amber-300 hover:bg-amber-500/20"
                onClick={() => {
                  if (selectedTestCases.length > 0) {
                    const firstTestCase = selectedTestCases[0];
                    if (selectedTestCases.length > 1) {
                      toast({
                        title: "Running First Test Case",
                        description: `Running test case ${firstTestCase}. You can run others individually.`,
                      });
                    }
                    handleRunTest(firstTestCase);
                  }
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                Run Selected ({selectedTestCases.length})
              </Button>
            </div>
          </div>

          {/* Test Cases Table */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5 text-purple-300" />
                <span className="text-white">Test Cases</span>
              </CardTitle>
              <CardDescription className="text-purple-200">
                Generated test cases for validating the user story requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-500/30">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="text-white">Test Case</TableHead>
                    <TableHead className="text-white w-24">Priority</TableHead>
                    <TableHead className="text-white w-32">Status</TableHead>
                    <TableHead className="text-white w-40">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testCases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <TestTube className="h-12 w-12 text-muted-foreground opacity-50" />
                          <div className="space-y-2">
                            <h3 className="text-lg font-medium text-white">No Test Cases Found</h3>
                            <p className="text-sm text-purple-200">
                              No test cases have been generated for this user story yet.
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    testCases.map((testCase) => (
                    <TableRow key={testCase.id} className="border-purple-500/30 hover:bg-purple-500/10">
                      <TableCell>
                        <Checkbox
                          checked={selectedTestCases.includes(testCase.id)}
                          onCheckedChange={(checked) => handleSelectTestCase(testCase.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <h4 className="font-medium text-white">{testCase.name}</h4>
                          <p className="text-sm text-purple-200 line-clamp-2">
                            {testCase.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border ${getPriorityColor(testCase.priority)}`}>
                          {testCase.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(testCase.status)}
                          <Badge className={`text-xs border ${getStatusColor(testCase.status)}`}>
                            {testCase.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewTestCase(testCase)}
                            className="hover:bg-purple-500/20 text-purple-200"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                           <Button 
                             variant="ghost" 
                             size="sm"
                             onClick={() => handleEditTestCase(testCase)}
                             className="hover:bg-purple-500/20 text-purple-200"
                             title="Edit test case"
                           >
                             <Edit className="h-4 w-4" />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="sm"
                             onClick={() => handleRunTest(testCase.id)}
                             className="hover:bg-purple-500/20 text-purple-200"
                             title="Run test case"
                           >
                             <Play className="h-4 w-4" />
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Test Steps Modal */}
      <Dialog open={showTestStepsModal} onOpenChange={setShowTestStepsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-gradient-to-br from-slate-900 to-purple-950 border-purple-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <TestTube className="h-5 w-5 text-primary" />
              <span>Test Case Details</span>
            </DialogTitle>
            <DialogDescription>
              {selectedTestCase?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTestCase && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Description:</h4>
                <p className="text-sm text-purple-200">{selectedTestCase.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Test Steps:</h4>
                <div className="space-y-3">
                  {selectedTestCase.steps.map((step: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-purple-900/30 rounded-lg">
                      <div className="bg-gradient-to-r from-purple-500 to-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm text-white">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Expected Result:</h4>
                <p className="text-sm text-purple-200 bg-purple-900/30 p-3 rounded-lg">
                  {selectedTestCase.expectedResult}
                </p>
              </div>
              
              <div className="flex items-center space-x-4 pt-4 border-t border-purple-500/30">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-white">Priority:</span>
                  <Badge className={`text-xs border ${getPriorityColor(selectedTestCase.priority)}`}>
                    {selectedTestCase.priority}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-white">Status:</span>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(selectedTestCase.status)}
                    <Badge className={`text-xs border ${getStatusColor(selectedTestCase.status)}`}>
                      {selectedTestCase.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Case Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-purple-950 border-purple-500/30 text-white">
          <DialogHeader>
            <DialogTitle>Edit Test Case</DialogTitle>
            <DialogDescription>
              Update the details of this test case.
            </DialogDescription>
          </DialogHeader>
          
          {editingTestCase && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testcase-name">Name</Label>
                <Input
                  id="testcase-name"
                  value={editingTestCase.name || ""}
                  onChange={(e) => setEditingTestCase({...editingTestCase, name: e.target.value})}
                  className="bg-purple-900/30 border-purple-500/30 text-white"
                  maxLength={200}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="testcase-description">Description</Label>
                <Textarea
                  id="testcase-description"
                  value={editingTestCase.description || ""}
                  onChange={(e) => setEditingTestCase({...editingTestCase, description: e.target.value})}
                  className="bg-purple-900/30 border-purple-500/30 min-h-[80px] text-white"
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testcase-expected">Expected Result</Label>
                <Textarea
                  id="testcase-expected"
                  value={editingTestCase.expected_result || ""}
                  onChange={(e) => setEditingTestCase({...editingTestCase, expected_result: e.target.value})}
                  className="bg-purple-900/30 border-purple-500/30 min-h-[60px] text-white"
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testcase-priority">Priority</Label>
                  <select
                    id="testcase-priority"
                    value={editingTestCase.priority || "medium"}
                    onChange={(e) => setEditingTestCase({...editingTestCase, priority: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-md border border-purple-500/30 bg-purple-900/30 text-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="testcase-status">Status</Label>
                  <select
                    id="testcase-status"
                    value={editingTestCase.status || "not_executed"}
                    onChange={(e) => setEditingTestCase({...editingTestCase, status: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-md border border-purple-500/30 bg-purple-900/30 text-white"
                  >
                    <option value="not_executed">Not Executed</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Test Steps</Label>
                <div className="space-y-2">
                  {(editingTestCase.steps || []).map((step: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...(editingTestCase.steps || [])];
                          newSteps[index] = e.target.value;
                          setEditingTestCase({...editingTestCase, steps: newSteps});
                        }}
                        className="bg-purple-900/30 border-purple-500/30 text-white"
                        placeholder={`Step ${index + 1}`}
                        maxLength={200}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newSteps = (editingTestCase.steps || []).filter((_: any, i: number) => i !== index);
                          setEditingTestCase({...editingTestCase, steps: newSteps});
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingTestCase({
                        ...editingTestCase,
                        steps: [...(editingTestCase.steps || []), ""]
                      });
                    }}
                  >
                    Add Step
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTestCase}
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoryDetail;