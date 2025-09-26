import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
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
        // Fetch features with their impact analysis, ordered by latest first
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
          `)
          .order('created_at', { ascending: false });

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
          let summary, riskLevel;
          
          if (typeof impactData.summary === 'string') {
            // When summary is a string, impactScore is an object
            summary = impactData.summary;
            const impactScoreObj = impactData.impactScore || {};
            riskLevel = impactScoreObj.riskLevel || "Medium";
          } else {
            // When summary is an object (old format)
            const summaryObj = impactData.summary || impactData.impactScore || {};
            summary = "Impact analysis completed";
            riskLevel = summaryObj.riskLevel || "Medium";
          }
          
          // Derive priority from risk level
          const priority = riskLevel === "High" ? "high" : riskLevel === "Low" ? "low" : "medium";

          return {
            id: feature.id,
            title: impactData.title || `Feature Analysis ${feature.id.slice(0, 8)}`,
            description: summary, // Now always a string
            status: feature.status || "pending",
            priority: priority.toLowerCase(),
            lastAnalyzed: new Date(feature.updated_at).toISOString().split('T')[0],
            sourceType,
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
              <div className="p-2 rounded-lg shadow-elegant">
                <img src="/head.png" alt="dobb.ai" className="size-10" />
              </div>
              <h1 className="text-xl font-bold text-foreground">dobb.ai</h1>
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-surface-elevated border border-border">
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
                <CardDescription className="text-muted-foreground mb-4 line-clamp-3 h-16 overflow-hidden">
                  {feature.description}
                </CardDescription>
                
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border">
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