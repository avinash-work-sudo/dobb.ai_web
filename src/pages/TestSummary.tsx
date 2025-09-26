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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Home,
  Settings,
  TrendingUp,
  User,
  XCircle
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const TestSummary = () => {
  const { id, storyId } = useParams();
  const navigate = useNavigate();

  // Mock story data
  const story = {
    id: 1,
    title: "User Registration with Email Verification",
    description: "As a new user, I want to register with my email address and verify it through a confirmation link so that I can access the platform securely.",
  };

  // Mock test cases data with traceability links
  const testCases = [
    {
      id: 1,
      name: "Successful User Registration with Valid Email",
      status: "passed",
      traceabilityLink: "REQ-001",
      requirement: "User Registration Functionality",
      testExecutionDate: "2024-01-15",
      duration: "2.5 min"
    },
    {
      id: 2,
      name: "Registration Fails with Invalid Email Format",
      status: "failed",
      traceabilityLink: "REQ-002", 
      requirement: "Email Validation Requirements",
      testExecutionDate: "2024-01-15",
      duration: "1.8 min"
    },
    {
      id: 3,
      name: "Email Verification Link Functionality",
      status: "not_executed",
      traceabilityLink: "REQ-003",
      requirement: "Email Verification Process",
      testExecutionDate: null,
      duration: null
    },
    {
      id: 4,
      name: "Weak Password Validation",
      status: "passed",
      traceabilityLink: "REQ-004",
      requirement: "Password Security Requirements",
      testExecutionDate: "2024-01-15",
      duration: "1.2 min"
    },
    {
      id: 5,
      name: "Duplicate Email Registration Prevention",
      status: "not_executed",
      traceabilityLink: "REQ-005",
      requirement: "Data Integrity Requirements",
      testExecutionDate: null,
      duration: null
    },
    {
      id: 6,
      name: "Registration Form Field Validation",
      status: "not_executed",
      traceabilityLink: "REQ-006",
      requirement: "Form Validation Requirements",
      testExecutionDate: null,
      duration: null
    }
  ];

  // Calculate statistics
  const passedTests = testCases.filter(test => test.status === "passed").length;
  const failedTests = testCases.filter(test => test.status === "failed").length;
  const notExecutedTests = testCases.filter(test => test.status === "not_executed").length;
  const totalTests = testCases.length;
  const executedTests = passedTests + failedTests;
  const passRate = executedTests > 0 ? Math.round((passedTests / executedTests) * 100) : 0;

  // Pie chart data
  const pieData = [
    { name: "Passed", value: passedTests, color: "#22c55e" },
    { name: "Failed", value: failedTests, color: "#ef4444" },
    { name: "Not Executed", value: notExecutedTests, color: "#6b7280" }
  ].filter(item => item.value > 0);

  // Bar chart data
  const barData = [
    { name: "Passed", count: passedTests, fill: "#22c55e" },
    { name: "Failed", count: failedTests, fill: "#ef4444" },
    { name: "Not Executed", count: notExecutedTests, fill: "#6b7280" }
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-elevated border border-border rounded-lg p-3 shadow-elegant">
          <p className="text-foreground font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className="text-muted-foreground text-sm">
            {`${Math.round((payload[0].value / totalTests) * 100)}% of total tests`}
          </p>
        </div>
      );
    }
    return null;
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
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(`/feature/${id}/stories/${storyId}`)}
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
                  <BreadcrumbLink 
                    onClick={() => navigate(`/feature/${id}/stories/${storyId}`)}
                    className="cursor-pointer"
                  >
                    {story.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Test Summary</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Test Execution Summary
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Comprehensive test results for: {story.title}
            </p>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-300">{totalTests}</div>
                    <div className="text-xs text-purple-200">Total Tests</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-400">{executedTests}</div>
                    <div className="text-xs text-purple-200">Executed</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{passedTests}</div>
                    <div className="text-xs text-purple-200">Passed</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-400">{failedTests}</div>
                    <div className="text-xs text-purple-200">Failed</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-400">{passRate}%</div>
                    <div className="text-xs text-purple-200">Pass Rate</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pie Chart */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-300" />
                  <span className="text-white">Test Status Distribution</span>
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Visual breakdown of test execution results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry) => (
                          <span style={{ color: entry.color }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card className="bg-surface-elevated border border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Test Results Overview</span>
                </CardTitle>
                <CardDescription>
                  Comparative view of test execution outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#f9fafb"
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Traceability Table */}
          <Card className="bg-surface-elevated border border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Test Case Traceability Matrix</span>
              </CardTitle>
              <CardDescription>
                Mapping between test cases and their corresponding requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">Test Case</TableHead>
                    <TableHead className="text-foreground w-32">Status</TableHead>
                    <TableHead className="text-foreground w-32">Traceability Link</TableHead>
                    <TableHead className="text-foreground">Requirement</TableHead>
                    <TableHead className="text-foreground w-32">Execution Date</TableHead>
                    <TableHead className="text-foreground w-24">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testCases.map((testCase) => (
                    <TableRow key={testCase.id} className="border-border hover:bg-surface-subtle">
                      <TableCell>
                        <div className="font-medium text-foreground">{testCase.name}</div>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {testCase.traceabilityLink}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">{testCase.requirement}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">
                          {testCase.testExecutionDate || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {testCase.duration || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TestSummary;