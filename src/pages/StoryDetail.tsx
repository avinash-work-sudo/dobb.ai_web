import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TestCase {
  id: number;
  name: string;
  status: string;
  description: string;
  steps: string[];
  expectedResult: string;
  priority: string;
}
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
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  TestTube,
  Eye,
  Edit,
  FileText,
  Home
} from "lucide-react";

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

  // Mock story data
  const story = {
    id: 1,
    title: "User Registration with Email Verification",
    description: "As a new user, I want to register with my email address and verify it through a confirmation link so that I can access the platform securely.",
    acceptanceCriteria: [
      "User can enter valid email and password",
      "System sends verification email within 30 seconds",
      "User can click verification link to activate account",
      "System prevents login until email is verified",
      "User receives confirmation message upon successful verification"
    ],
    priority: "High",
    estimatedHours: 16,
  };

  // Mock test cases data
  const testCases = [
    {
      id: 1,
      name: "Successful User Registration with Valid Email",
      status: "passed",
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
    },
    {
      id: 2,
      name: "Registration Fails with Invalid Email Format",
      status: "failed",
      description: "Verify that registration fails when user enters invalid email format",
      steps: [
        "Navigate to registration page",
        "Enter invalid email format (test@invalid)",
        "Enter valid password",
        "Click 'Register' button",
        "Verify error message is displayed"
      ],
      expectedResult: "Registration fails with appropriate error message",
      priority: "High"
    },
    {
      id: 3,
      name: "Email Verification Link Functionality",
      status: "not_executed",
      description: "Verify that clicking the verification link activates the user account",
      steps: [
        "Complete successful registration",
        "Check email inbox for verification message",
        "Click verification link in email",
        "Verify redirect to success page",
        "Attempt to login with registered credentials",
        "Verify successful login"
      ],
      expectedResult: "Account is activated and user can login successfully",
      priority: "High"
    },
    {
      id: 4,
      name: "Weak Password Validation",
      status: "passed",
      description: "Verify that system rejects weak passwords during registration",
      steps: [
        "Navigate to registration page",
        "Enter valid email address",
        "Enter weak password (e.g., '123')",
        "Attempt to register",
        "Verify password strength error message"
      ],
      expectedResult: "Registration fails with password strength requirements message",
      priority: "Medium"
    },
    {
      id: 5,
      name: "Duplicate Email Registration Prevention",
      status: "not_executed",
      description: "Verify that system prevents registration with already registered email",
      steps: [
        "Register with email address",
        "Attempt to register again with same email",
        "Verify error message about existing account",
        "Check that no duplicate account is created"
      ],
      expectedResult: "System prevents duplicate registration and shows appropriate message",
      priority: "Medium"
    },
    {
      id: 6,
      name: "Registration Form Field Validation",
      status: "not_executed",
      description: "Verify all form fields have proper validation",
      steps: [
        "Navigate to registration page",
        "Submit form with empty fields",
        "Verify required field error messages",
        "Enter mismatched passwords",
        "Verify password mismatch error"
      ],
      expectedResult: "All form validation works correctly",
      priority: "Low"
    }
  ];

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
                onClick={() => navigate(`/feature/${id}/stories`)}
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
            <Card className="bg-surface-elevated border border-border mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Story Description</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed mb-4">
                  {story.description}
                </p>
                
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Acceptance Criteria:</h4>
                  <ul className="space-y-1">
                    {story.acceptanceCriteria.map((criteria, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Cases Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-surface-elevated border border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{testCases.length}</div>
                  <div className="text-sm text-muted-foreground">Total Tests</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-surface-elevated border border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {testCases.filter(test => test.status === "passed").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-surface-elevated border border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {testCases.filter(test => test.status === "failed").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-surface-elevated border border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">
                    {testCases.filter(test => test.status === "not_executed").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Not Executed</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Summary Button - Show if any tests have been executed */}
          {(testCases.some(test => test.status === "passed" || test.status === "failed")) && (
            <div className="mb-6 text-center">
              <Button 
                onClick={() => navigate(`/feature/${id}/stories/${storyId}/test-summary`)}
                className="bg-gradient-primary text-white hover:opacity-90 transition-all duration-300"
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
                disabled={selectedTestCases.length === 0}
                className="border-border hover:bg-surface-subtle"
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
          <Card className="bg-surface-elevated border border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5 text-primary" />
                <span>Test Cases</span>
              </CardTitle>
              <CardDescription>
                Generated test cases for validating the user story requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="text-foreground">Test Case</TableHead>
                    <TableHead className="text-foreground w-24">Priority</TableHead>
                    <TableHead className="text-foreground w-32">Status</TableHead>
                    <TableHead className="text-foreground w-40">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testCases.map((testCase) => (
                    <TableRow key={testCase.id} className="border-border hover:bg-surface-subtle">
                      <TableCell>
                        <Checkbox
                          checked={selectedTestCases.includes(testCase.id)}
                          onCheckedChange={(checked) => handleSelectTestCase(testCase.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <h4 className="font-medium text-foreground">{testCase.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
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
                            className="hover:bg-surface-subtle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                           <Button 
                             variant="ghost" 
                             size="sm"
                             onClick={() => handleEditTestCase(testCase)}
                             className="hover:bg-surface-subtle"
                             title="Edit test case"
                           >
                             <Edit className="h-4 w-4" />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="sm"
                             onClick={() => handleRunTest(testCase.id)}
                             className="hover:bg-surface-subtle"
                             title="Run test case"
                           >
                             <Play className="h-4 w-4" />
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Test Steps Modal */}
      <Dialog open={showTestStepsModal} onOpenChange={setShowTestStepsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-surface-elevated border border-border">
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
                <h4 className="text-sm font-semibold text-foreground mb-2">Description:</h4>
                <p className="text-sm text-muted-foreground">{selectedTestCase.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Test Steps:</h4>
                <div className="space-y-3">
                  {selectedTestCase.steps.map((step: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-surface-subtle rounded-lg">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm text-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Expected Result:</h4>
                <p className="text-sm text-muted-foreground bg-surface-subtle p-3 rounded-lg">
                  {selectedTestCase.expectedResult}
                </p>
              </div>
              
              <div className="flex items-center space-x-4 pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground">Priority:</span>
                  <Badge className={`text-xs border ${getPriorityColor(selectedTestCase.priority)}`}>
                    {selectedTestCase.priority}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground">Status:</span>
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-surface-elevated border border-border">
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
                  className="bg-surface-subtle border-border"
                  maxLength={200}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="testcase-description">Description</Label>
                <Textarea
                  id="testcase-description"
                  value={editingTestCase.description || ""}
                  onChange={(e) => setEditingTestCase({...editingTestCase, description: e.target.value})}
                  className="bg-surface-subtle border-border min-h-[80px]"
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testcase-expected">Expected Result</Label>
                <Textarea
                  id="testcase-expected"
                  value={editingTestCase.expected_result || ""}
                  onChange={(e) => setEditingTestCase({...editingTestCase, expected_result: e.target.value})}
                  className="bg-surface-subtle border-border min-h-[60px]"
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
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface-subtle text-foreground"
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
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface-subtle text-foreground"
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
                        className="bg-surface-subtle border-border"
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
              className="bg-gradient-primary text-white hover:opacity-90"
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