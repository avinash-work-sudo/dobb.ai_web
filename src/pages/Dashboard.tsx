import { Header } from "@/components/Header";
import { AutomationRunner } from "@/components/AutomationRunner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TestTube, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Zap,
  ExternalLink
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            AI Test Automation Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Execute complex web automation tasks using natural language with Midscene + UI-TARS
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-surface-elevated border border-border">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">1</div>
                  <div className="text-xs text-muted-foreground">Framework Available</div>
                </div>
                <div className="flex space-x-1">
                  <Badge variant="outline" className="text-xs">🎭 Playwright</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-elevated border border-border">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-400">Live</div>
                  <div className="text-xs text-muted-foreground">Real-time Updates</div>
                </div>
                <Zap className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-elevated border border-border">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">AI</div>
                  <div className="text-xs text-muted-foreground">Natural Language</div>
                </div>
                <TestTube className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-elevated border border-border">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-400">100%</div>
                  <div className="text-xs text-muted-foreground">Automated</div>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Automation Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Automation Runner */}
          <div className="lg:col-span-2">
            <AutomationRunner />
          </div>

          {/* Right Column - Info & Examples */}
          <div className="space-y-6">
            {/* Framework Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Supported Frameworks</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">🎭 Playwright</span>
                    <Badge variant="default" className="text-xs">Recommended</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Multi-browser support (Chrome, Firefox, Safari, Edge)
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">Auto-wait</Badge>
                    <Badge variant="outline" className="text-xs">Mobile testing</Badge>
                    <Badge variant="outline" className="text-xs">Network mock</Badge>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Example Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5 text-primary" />
                  <span>Example Tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium mb-1">🛒 E-commerce</div>
                  <p className="text-muted-foreground text-xs">
                    "Login, search for laptop under $1000, add to cart, apply coupon"
                  </p>
                </div>

                <div className="text-sm">
                  <div className="font-medium mb-1">📝 Content Management</div>
                  <p className="text-muted-foreground text-xs">
                    "Create new blog post, add title and content, upload image, publish"
                  </p>
                </div>

                <div className="text-sm">
                  <div className="font-medium mb-1">🔍 Data Extraction</div>
                  <p className="text-muted-foreground text-xs">
                    "Search for news about AI, find latest article, extract headline"
                  </p>
                </div>

                <div className="text-sm">
                  <div className="font-medium mb-1">📱 Social Media</div>
                  <p className="text-muted-foreground text-xs">
                    "Post a tweet with text and hashtag, like recent posts from followers"
                  </p>
                </div>

                <div className="text-sm">
                  <div className="font-medium mb-1">⚙️ Admin Tasks</div>
                  <p className="text-muted-foreground text-xs">
                    "Create user account, assign role, send welcome email"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Key Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Natural language processing</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Real-time progress updates</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Visual HTML reports</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Screenshot capture</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Error handling & debugging</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Headless & headed modes</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  <span>Quick Links</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => window.open('http://localhost:3001/health', '_blank')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Backend Health Check
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => window.open('http://localhost:3001/api/test-results', '_blank')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Test Results API
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => window.open('https://midscenejs.com', '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Midscene Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;