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
import { Card, CardContent } from "@/components/ui/card";
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
  Download,
  Edit,
  Eye,
  Home,
  Loader2,
  Settings,
  TestTube,
  Upload,
  User
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Stories = () => {
  console.log('Stories component loaded'); // Force rebuild
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedStories, setSelectedStories] = useState<number[]>([]);
  const [showJiraModal, setShowJiraModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStory, setEditingStory] = useState<any>(null);
  const [jiraWebhookUrl, setJiraWebhookUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userStories, setUserStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featureTitle, setFeatureTitle] = useState("Feature");

  // Fetch user stories for this specific feature from Supabase
  useEffect(() => {
    let isMounted = true;

    const fetchUserStories = async () => {
      if (!id) return;

      try {
        // Fetch user stories for this feature
        const { data: storiesData, error: storiesError } = await supabase
          .from('user_stories')
          .select('*')
          .eq('feature_id', id)
          .order('created_at', { ascending: true });

        if (storiesError) {
          console.error('Error fetching user stories:', storiesError);
          toast({
            title: "Error",
            description: "Failed to load user stories",
            variant: "destructive",
          });
          return;
        }

        // Fetch test cases for all user stories
        const storyIds = storiesData.map(story => story.id);
        let testCasesData = [];
        
        if (storyIds.length > 0) {
          const { data: testCases, error: testCasesError } = await supabase
            .from('test_cases')
            .select('*')
            .in('user_story_id', storyIds);

          if (testCasesError) {
            console.error('Error fetching test cases:', testCasesError);
          } else {
            testCasesData = testCases || [];
          }
        }

        // Also fetch feature info for the title
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

        if (!isMounted) return;

        // Transform the data for the UI, counting test cases per story
        const transformedStories = storiesData.map((story, index) => {
          const storyTestCases = testCasesData.filter(tc => tc.user_story_id === story.id);
          
          return {
            id: index + 1, // Use index for UI IDs
            dbId: story.id, // Keep original DB ID
            title: story.title,
            description: story.description,
            testCases: storyTestCases.length, // Count of test cases
            priority: story.priority?.charAt(0).toUpperCase() + story.priority?.slice(1) || "Medium",
            estimatedHours: story.estimated_hours || 0,
            acceptanceCriteria: story.acceptance_criteria?.length || 0,
            status: story.status,
          };
        });

        setUserStories(transformedStories);

      } catch (error) {
        console.error('Error fetching data:', error);
        if (isMounted) {
          toast({
            title: "Error", 
            description: "Failed to load user stories",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUserStories();
    return () => { isMounted = false; };
  }, [id, toast]);

  const handleSelectStory = (storyId: number, checked: boolean) => {
    if (checked) {
      setSelectedStories([...selectedStories, storyId]);
    } else {
      setSelectedStories(selectedStories.filter(id => id !== storyId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStories(userStories.map(story => story.id));
    } else {
      setSelectedStories([]);
    }
  };

  const handleEditStory = async (story: any) => {
    try {
      // Fetch the full story data from database
      const { data: fullStoryData, error } = await supabase
        .from('user_stories')
        .select('*')
        .eq('id', story.dbId)
        .single();

      if (error) {
        console.error('Error fetching story details:', error);
        toast({
          title: "Error",
          description: "Failed to load story details for editing",
          variant: "destructive",
        });
        return;
      }

      // Fetch test cases for this story
      const { data: testCasesData, error: testCasesError } = await supabase
        .from('test_cases')
        .select('*')
        .eq('user_story_id', story.dbId);

      if (testCasesError) {
        console.error('Error fetching test cases:', testCasesError);
      }

      setEditingStory({
        ...story,
        title: fullStoryData.title,
        description: fullStoryData.description,
        priority: fullStoryData.priority?.charAt(0).toUpperCase() + fullStoryData.priority?.slice(1) || "Medium",
        estimatedHours: fullStoryData.estimated_hours || 0,
        acceptance_criteria: fullStoryData.acceptance_criteria || [],
        test_cases: testCasesData || [] // Now contains full test case objects
      });
      setShowEditModal(true);

    } catch (error) {
      console.error('Error loading story for editing:', error);
      toast({
        title: "Error",
        description: "Failed to load story details",
        variant: "destructive",
      });
    }
  };

  const handleSaveStory = async () => {
    if (!editingStory) return;
    
    setIsSaving(true);
    try {
      // Find the original story to get the database ID
      const originalStory = userStories.find(s => s.id === editingStory.id);
      if (!originalStory?.dbId) {
        toast({
          title: "Error",
          description: "Could not find story ID to update",
          variant: "destructive",
        });
        return;
      }

      // Update story in database (remove test_cases)
      const { error } = await supabase
        .from('user_stories')
        .update({
          title: editingStory.title,
          description: editingStory.description,
          priority: editingStory.priority?.toLowerCase(),
          estimated_hours: parseInt(editingStory.estimatedHours) || 0,
          acceptance_criteria: editingStory.acceptance_criteria,
          updated_at: new Date().toISOString()
        })
        .eq('id', originalStory.dbId);

      if (error) {
        console.error('Error updating story:', error);
        toast({
          title: "Update Failed",
          description: "Failed to update the user story",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      const updatedStories = userStories.map(story => 
        story.id === editingStory.id 
          ? {
              ...story,
              title: editingStory.title,
              description: editingStory.description,
              priority: editingStory.priority,
              estimatedHours: parseInt(editingStory.estimatedHours) || 0,
              acceptanceCriteria: editingStory.acceptance_criteria?.length || 0,
              testCases: editingStory.test_cases?.length || 0
            }
          : story
      );
      setUserStories(updatedStories);

      toast({
        title: "Story Updated",
        description: "User story has been successfully updated",
      });

      setShowEditModal(false);
      setEditingStory(null);

    } catch (error) {
      console.error('Error saving story:', error);
      toast({
        title: "Save Failed",
        description: "An error occurred while saving the story",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };


  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingStory(null);
  };

  const handleJiraImport = async () => {
    if (!jiraWebhookUrl) {
      toast({
        title: "Error",
        description: "Please enter your JIRA Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    if (selectedStories.length === 0) {
      toast({
        title: "Error", 
        description: "Please select at least one story to import",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const selectedStoriesData = userStories.filter(story => 
        selectedStories.includes(story.id)
      );

      const response = await fetch(jiraWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          stories: selectedStoriesData,
          feature_name: featureTitle,
          total_stories: selectedStoriesData.length
        }),
      });

      toast({
        title: "Import Initiated",
        description: `${selectedStories.length} stories sent to JIRA. Please check your Zap's history to confirm import.`,
      });

      setShowJiraModal(false);
      setSelectedStories([]);
    } catch (error) {
      console.error("Error importing to JIRA:", error);
      toast({
        title: "Error",
        description: "Failed to import stories to JIRA. Please check the webhook URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
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
                  onClick={() => navigate(`/feature/${id}`)}
                  className="hover:bg-surface-subtle"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Button>
                <div className="p-2 rounded-lg shadow-elegant">
                  <img src="/head.png" alt="DOBB.ai" className="size-10" />
                </div>
                <h1 className="text-xl font-bold text-foreground">DOBB.ai</h1>
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
                    Loading User Stories
                  </h3>
                  <p className="text-muted-foreground">
                    Fetching user stories for this feature...
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
                onClick={() => navigate(`/feature/${id}`)}
                className="hover:bg-surface-subtle"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </Button>
              <div className="p-2 rounded-lg shadow-elegant">
                <img src="/head.png" alt="DOBB.ai" className="size-10" />
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
                    {featureTitle}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Stories</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Generated User Stories
            </h1>
            <p className="text-lg text-muted-foreground">
              AI-generated user stories for the {featureTitle} feature
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-surface-elevated border border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{userStories.length}</div>
                  <div className="text-sm text-muted-foreground">Total Stories</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-surface-elevated border border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {userStories.reduce((sum, story) => sum + story.testCases, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Test Cases</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-surface-elevated border border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {userStories.reduce((sum, story) => sum + story.estimatedHours, 0)}h
                  </div>
                  <div className="text-sm text-muted-foreground">Estimated Effort</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-surface-elevated border border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{selectedStories.length}</div>
                  <div className="text-sm text-muted-foreground">Selected</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedStories.length === userStories.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select All ({selectedStories.length} selected)
              </span>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                className="border-border hover:bg-surface-subtle"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                onClick={() => setShowJiraModal(true)}
                disabled={selectedStories.length === 0}
                className="bg-gradient-primary text-white hover:opacity-90"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import to JIRA ({selectedStories.length})
              </Button>
            </div>
          </div>

          {/* Stories Table */}
          <Card className="bg-surface-elevated border border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="text-foreground">Story</TableHead>
                    <TableHead className="text-foreground w-24">Priority</TableHead>
                    <TableHead className="text-foreground w-32">Test Cases</TableHead>
                    <TableHead className="text-foreground w-32">Estimated Hours</TableHead>
                    <TableHead className="text-foreground w-40">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userStories.map((story) => (
                    <TableRow key={story.id} className="border-border hover:bg-surface-subtle">
                      <TableCell>
                        <Checkbox
                          checked={selectedStories.includes(story.id)}
                          onCheckedChange={(checked) => handleSelectStory(story.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <h4 className="font-medium text-foreground">{story.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {story.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {story.acceptanceCriteria} acceptance criteria
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border ${getPriorityColor(story.priority)}`}>
                          {story.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <TestTube className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{story.testCases}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground">{story.estimatedHours}h</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/feature/${id}/stories/${story.id}`)}
                            className="hover:bg-surface-subtle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditStory(story)}
                            className="hover:bg-surface-subtle"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/feature/${id}/stories/${story.id}/tests`)}
                            className="hover:bg-surface-subtle"
                          >
                            <TestTube className="h-4 w-4" />
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

      {/* JIRA Import Modal */}
      <Dialog open={showJiraModal} onOpenChange={setShowJiraModal}>
        <DialogContent className="max-w-2xl bg-surface-elevated border border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>Import Stories to JIRA</span>
            </DialogTitle>
            <DialogDescription>
              Import {selectedStories.length} selected user stories to JIRA using Zapier webhook integration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jira-webhook">JIRA Zapier Webhook URL</Label>
              <Input
                id="jira-webhook"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={jiraWebhookUrl}
                onChange={(e) => setJiraWebhookUrl(e.target.value)}
                className="bg-surface-subtle border-border"
              />
              <p className="text-xs text-muted-foreground">
                Create a Zapier webhook trigger connected to your JIRA workspace to import stories.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4 bg-surface-subtle">
              <h4 className="font-medium text-foreground mb-3">Selected Stories ({selectedStories.length})</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedStories.map(storyId => {
                  const story = userStories.find(s => s.id === storyId);
                  return story ? (
                    <div key={storyId} className="flex items-center justify-between text-sm">
                      <span className="text-foreground truncate">{story.title}</span>
                      <Badge className={`text-xs border ml-2 ${getPriorityColor(story.priority)}`}>
                        {story.priority}
                      </Badge>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowJiraModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleJiraImport}
              disabled={isImporting || !jiraWebhookUrl}
              className="bg-gradient-primary text-white hover:opacity-90"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import to JIRA
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Story Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-surface-elevated border border-border">
          <DialogHeader>
            <DialogTitle>Edit User Story</DialogTitle>
            <DialogDescription>
              Update the details of this user story.
            </DialogDescription>
          </DialogHeader>
          
          {editingStory && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="story-title">Title</Label>
                <Input
                  id="story-title"
                  value={editingStory.title || ""}
                  onChange={(e) => setEditingStory({...editingStory, title: e.target.value})}
                  className="bg-surface-subtle border-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="story-description">Description</Label>
                <Textarea
                  id="story-description"
                  value={editingStory.description || ""}
                  onChange={(e) => setEditingStory({...editingStory, description: e.target.value})}
                  className="bg-surface-subtle border-border min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="story-priority">Priority</Label>
                  <select
                    id="story-priority"
                    value={editingStory.priority || "Medium"}
                    onChange={(e) => setEditingStory({...editingStory, priority: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface-subtle text-foreground"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="story-hours">Estimated Hours</Label>
                  <Input
                    id="story-hours"
                    type="number"
                    value={editingStory.estimatedHours || 0}
                    onChange={(e) => setEditingStory({...editingStory, estimatedHours: e.target.value})}
                    className="bg-surface-subtle border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Acceptance Criteria</Label>
                <div className="space-y-2">
                  {(editingStory.acceptance_criteria || [])?.map((criteria: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={criteria}
                        onChange={(e) => {
                          const newCriteria = [...(editingStory.acceptance_criteria || [])];
                          newCriteria[index] = e.target.value;
                          setEditingStory({...editingStory, acceptance_criteria: newCriteria});
                        }}
                        className="bg-surface-subtle border-border"
                        placeholder="Acceptance criteria"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newCriteria = (editingStory.acceptance_criteria || []).filter((_: any, i: number) => i !== index);
                          setEditingStory({...editingStory, acceptance_criteria: newCriteria});
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
                      setEditingStory({
                        ...editingStory,
                        acceptance_criteria: [...(editingStory.acceptance_criteria || []), ""]
                      });
                    }}
                  >
                    Add Criteria
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
              onClick={handleSaveStory}
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

export default Stories;