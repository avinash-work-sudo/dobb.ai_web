import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Clock,
  Figma,
  FileText,
  Filter,
  Search,
  Settings,
  TrendingUp,
  User,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        // Fetch features with their impact analysis
        const { data: featuresData, error: featuresError } = await supabase
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
          `);

        if (featuresError) {
          console.error('Error fetching features:', featuresError);
          return;
        }

        // Transform the data to match the expected format
        const transformedFeatures = featuresData?.map((feature: any) => {
          const impactData = feature.impact_analysis?.[0]?.impact_json || {};
          
          // Determine source type based on available links
          let sourceType = "PRD";
          if (feature.figma_link) sourceType = "Figma";
          else if (feature.transcript_link) sourceType = "Meeting Transcript";
          else if (feature.file_url) sourceType = "Document";

          // Extract information from the actual impact_json structure
          // Handle both summary as string and impactScore as object
          let summary, impactScore, estimatedEffort, riskLevel;
          
          if (typeof impactData.summary === 'string') {
            // When summary is a string, impactScore is an object
            summary = impactData.summary;
            const impactScoreObj = impactData.impactScore || {};
            impactScore = impactScoreObj.totalImpactScore || 0;
            estimatedEffort = impactScoreObj.estimatedEffort || "0 weeks";
            riskLevel = impactScoreObj.riskLevel || "Medium";
          } else {
            // When summary is an object (old format)
            const summaryObj = impactData.summary || impactData.impactScore || {};
            summary = "Impact analysis completed";
            impactScore = summaryObj.totalImpactScore || 0;
            estimatedEffort = summaryObj.estimatedEffort || "0 weeks";
            riskLevel = summaryObj.riskLevel || "Medium";
          }
          
          // Convert estimated effort to hours (rough estimation: 1 week = 40 hours)
          const estimatedHours = estimatedEffort.includes("week") 
            ? parseInt(estimatedEffort) * 40 
            : 0;

          // Derive priority from risk level
          const priority = riskLevel === "High" ? "high" : riskLevel === "Low" ? "low" : "medium";

          // Calculate team size based on impacted modules (rough estimation)
          const impactedModules = impactData.impactedModules || [];
          const teamSize = Math.max(1, Math.min(5, impactedModules.length));

          return {
            id: feature.id,
            title: impactData.title || `Feature Analysis ${feature.id.slice(0, 8)}`,
            description: summary, // Now always a string
            status: feature.status || "pending",
            priority: priority.toLowerCase(),
            lastAnalyzed: new Date(feature.updated_at).toISOString().split('T')[0],
            impactScore: Math.round(impactScore * 10), // Convert to 0-100 scale
            sourceType,
            teamSize,
            estimatedHours,
          };
        }) || [];

        setFeatures(transformedFeatures);
      } catch (error) {
        console.error('Error fetching features:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, []);

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
                onClick={() => navigate('/homepage')}
                className="text-purple-200 hover:text-white hover:bg-purple-500/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-amber-500 rounded-lg flex items-center justify-center">
                <img src="/head.png" alt="DOBB.ai" className="w-5 h-5 rounded" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-amber-300 bg-clip-text text-transparent">DOBB.ai</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-purple-200 hover:text-white hover:bg-purple-500/20">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-purple-200 hover:text-white hover:bg-purple-500/20">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-amber-200 bg-clip-text text-transparent mb-2">
            Analyzed Features
          </h1>
          <p className="text-lg text-purple-200">
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
              className="pl-10 bg-purple-900/20 border-purple-500/30 text-white placeholder:text-purple-300"
            />
          </div>
          <Button variant="outline" className="border-purple-400/30 text-purple-200 hover:bg-purple-500/20">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Features Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-surface-subtle rounded animate-pulse" />
                      <div className="h-5 w-16 bg-surface-subtle rounded animate-pulse" />
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-5 w-12 bg-surface-subtle rounded animate-pulse" />
                      <div className="h-5 w-16 bg-surface-subtle rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-6 w-3/4 bg-surface-subtle rounded animate-pulse mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-surface-subtle rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-surface-subtle rounded animate-pulse" />
                    <div className="h-8 w-full bg-surface-subtle rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feature) => (
            <Card 
              key={feature.id} 
              className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm hover:bg-purple-900/40 hover:shadow-purple-glow transition-all duration-300 cursor-pointer group"
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
                <CardTitle className="text-lg font-semibold text-white line-clamp-2">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="text-purple-200 mb-4 line-clamp-3">
                  {feature.description}
                </CardDescription>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-200">Impact Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-surface-subtle rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-amber-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${feature.impactScore}%` }}
                        />
                      </div>
                      <span className="text-white font-medium">{feature.impactScore}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-purple-200">{feature.teamSize} devs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-purple-200">{feature.estimatedHours}h</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-purple-300 pt-2 border-t border-purple-500/30">
                    Last analyzed: {new Date(feature.lastAnalyzed).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {!loading && filteredFeatures.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No features found
            </h3>
            <p className="text-purple-200">
              {searchQuery ? "Try adjusting your search query" : "Start by analyzing your first feature"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Features;