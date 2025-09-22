import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { 
  Settings, 
  User, 
  Search,
  Filter,
  ArrowLeft,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Figma,
  Users
} from "lucide-react";

const Features = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for analyzed features
  const features = [
    {
      id: 1,
      title: "User Authentication System",
      description: "Complete user registration, login, and password reset functionality",
      status: "completed",
      priority: "high",
      lastAnalyzed: "2024-01-15",
      impactScore: 85,
      sourceType: "PRD",
      teamSize: 3,
      estimatedHours: 120,
    },
    {
      id: 2,
      title: "Real-time Chat Feature",
      description: "WebSocket-based messaging system with file sharing capabilities",
      status: "in-progress",
      priority: "medium",
      lastAnalyzed: "2024-01-14",
      impactScore: 72,
      sourceType: "Figma",
      teamSize: 2,
      estimatedHours: 80,
    },
    {
      id: 3,
      title: "Advanced Search & Filtering",
      description: "Elasticsearch integration with complex filtering and sorting options",
      status: "pending",
      priority: "low",
      lastAnalyzed: "2024-01-13",
      impactScore: 45,
      sourceType: "Meeting Transcript",
      teamSize: 2,
      estimatedHours: 60,
    },
    {
      id: 4,
      title: "Payment Gateway Integration",
      description: "Stripe integration with subscription management and billing",
      status: "completed",
      priority: "high",
      lastAnalyzed: "2024-01-12",
      impactScore: 90,
      sourceType: "PRD",
      teamSize: 4,
      estimatedHours: 150,
    },
    {
      id: 5,
      title: "Mobile App Responsive Design",
      description: "Complete mobile optimization and progressive web app features",
      status: "in-progress",
      priority: "medium",
      lastAnalyzed: "2024-01-11",
      impactScore: 65,
      sourceType: "Figma",
      teamSize: 3,
      estimatedHours: 100,
    },
    {
      id: 6,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics with charts, reports, and data visualization",
      status: "pending",
      priority: "medium",
      lastAnalyzed: "2024-01-10",
      impactScore: 55,
      sourceType: "PRD",
      teamSize: 2,
      estimatedHours: 90,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in-progress":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "pending":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "PRD":
        return <FileText className="h-4 w-4" />;
      case "Figma":
        return <Figma className="h-4 w-4" />;
      case "Meeting Transcript":
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredFeatures = features.filter(feature =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                onClick={() => navigate('/homepage')}
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Analyzed Features
          </h1>
          <p className="text-lg text-muted-foreground">
            Review and manage all your analyzed project features and their impact assessments
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface-subtle border-border"
            />
          </div>
          <Button variant="outline" className="border-border hover:bg-surface-subtle">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => (
            <Card 
              key={feature.id} 
              className="bg-surface-elevated border border-border hover:shadow-elegant transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/feature/${feature.id}`)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getSourceIcon(feature.sourceType)}
                    <Badge variant="secondary" className="text-xs">
                      {feature.sourceType}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={`text-xs border ${getPriorityColor(feature.priority)}`}>
                      {feature.priority}
                    </Badge>
                    <Badge className={`text-xs border ${getStatusColor(feature.status)}`}>
                      {feature.status}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="text-muted-foreground mb-4 line-clamp-3">
                  {feature.description}
                </CardDescription>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Impact Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-surface-subtle rounded-full h-2">
                        <div 
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${feature.impactScore}%` }}
                        />
                      </div>
                      <span className="text-foreground font-medium">{feature.impactScore}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{feature.teamSize} devs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{feature.estimatedHours}h</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                    Last analyzed: {new Date(feature.lastAnalyzed).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFeatures.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No features found
            </h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search query" : "Start by analyzing your first feature"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Features;