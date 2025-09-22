import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  Settings, 
  User, 
  Upload, 
  Link, 
  FileText, 
  Figma, 
  Mic, 
  BarChart3,
  Eye,
  Plus
} from "lucide-react";

const Homepage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prdLink, setPrdLink] = useState("");
  const [figmaLink, setFigmaLink] = useState("");
  const [transcriptLink, setTranscriptLink] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnalyze = () => {
    // Here you would typically send the data to your backend for analysis
    console.log("Analyzing:", { selectedFile, prdLink, figmaLink, transcriptLink });
    // Navigate to features page or show loading state
    navigate('/features');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b border-border bg-surface-elevated">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Project Impact Analysis
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload your project artifacts or provide links to generate comprehensive impact analysis
            </p>
          </div>

          {/* Upload Section */}
          <Card className="bg-surface-elevated border border-border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-primary" />
                <span>Add Project Artifact</span>
              </CardTitle>
              <CardDescription>
                Upload PRD files or provide links to your project resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-surface-subtle">
                  <TabsTrigger value="upload" className="data-[state=active]:bg-surface-elevated">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="links" className="data-[state=active]:bg-surface-elevated">
                    <Link className="h-4 w-4 mr-2" />
                    Provide Links
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload" className="text-sm font-medium text-foreground">
                        Upload PRD Document
                      </Label>
                      <div className="mt-2 flex items-center justify-center w-full">
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-surface-subtle hover:bg-surface-elevated transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileText className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PDF, DOCX, MD (MAX. 20MB)
                            </p>
                          </div>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.docx,.md"
                            onChange={handleFileUpload}
                          />
                        </label>
                      </div>
                      {selectedFile && (
                        <p className="mt-2 text-sm text-primary">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="links" className="mt-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="prd-link" className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>PRD Link</span>
                      </Label>
                      <Input
                        id="prd-link"
                        placeholder="https://confluence.example.com/prd..."
                        value={prdLink}
                        onChange={(e) => setPrdLink(e.target.value)}
                        className="bg-surface-subtle border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="figma-link" className="flex items-center space-x-2">
                        <Figma className="h-4 w-4 text-primary" />
                        <span>Figma Design Link</span>
                      </Label>
                      <Input
                        id="figma-link"
                        placeholder="https://figma.com/file/..."
                        value={figmaLink}
                        onChange={(e) => setFigmaLink(e.target.value)}
                        className="bg-surface-subtle border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transcript-link" className="flex items-center space-x-2">
                        <Mic className="h-4 w-4 text-primary" />
                        <span>Meeting Transcript Link</span>
                      </Label>
                      <Input
                        id="transcript-link"
                        placeholder="https://meet.google.com/transcript/..."
                        value={transcriptLink}
                        onChange={(e) => setTranscriptLink(e.target.value)}
                        className="bg-surface-subtle border-border"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleAnalyze}
                  className="bg-gradient-primary text-white hover:opacity-90 transition-all duration-300"
                  disabled={!selectedFile && !prdLink && !figmaLink && !transcriptLink}
                >
                  Start Analysis
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* View Features Section */}
          <Card className="bg-surface-elevated border border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  View Analyzed Features
                </h3>
                <p className="text-muted-foreground mb-6">
                  Review all the features you've previously analyzed and their impact reports
                </p>
                <Button 
                  onClick={() => navigate('/features')}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Features
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Homepage;