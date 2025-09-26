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
      
      <Header />
      
      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-amber-200 bg-clip-text text-transparent mb-2">
            AI Test Automation Dashboard
          </h1>
          <p className="text-lg text-purple-200">
            Execute complex web automation tasks using natural language with Midscene + UI-TARS
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-300">1</div>
                  <div className="text-xs text-purple-200">Framework Available</div>
                </div>
                <div className="flex space-x-1">
                  <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-200">🎭 Playwright</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900/30 to-slate-900/30 border-amber-500/30 backdrop-blur-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-amber-300">Live</div>
                  <div className="text-xs text-amber-200">Real-time Updates</div>
                </div>
                <Zap className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-amber-900/30 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">AI</div>
                  <div className="text-xs text-purple-200">Natural Language</div>
                </div>
                <TestTube className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/30 to-purple-900/30 border-slate-500/30 backdrop-blur-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-amber-300">100%</div>
                  <div className="text-xs text-amber-200">Automated</div>
                </div>
                <TrendingUp className="h-8 w-8 text-amber-400" />
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
            <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                  <span>Supported Frameworks</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-purple-500/30 rounded-lg p-3 bg-purple-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">🎭 Playwright</span>
                    <Badge variant="default" className="text-xs bg-gradient-to-r from-purple-600 to-amber-600">Recommended</Badge>
                  </div>
                  <p className="text-sm text-purple-200 mb-2">
                    Multi-browser support (Chrome, Firefox, Safari, Edge)
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-200">Auto-wait</Badge>
                    <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-200">Mobile testing</Badge>
                    <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-200">Network mock</Badge>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Example Tasks */}
            <Card className="bg-gradient-to-br from-amber-900/30 to-slate-900/30 border-amber-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <TestTube className="h-5 w-5 text-amber-400" />
                  <span>Example Tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium mb-1 text-white">🛒 E-commerce</div>
                  <p className="text-amber-200 text-xs">
                    "Login, search for laptop under $1000, add to cart, apply coupon"
                  </p>
                </div>

                <div className="text-sm">
                  <div className="font-medium mb-1 text-white">📝 Content Management</div>
                  <p className="text-amber-200 text-xs">
                    "Create new blog post, add title and content, upload image, publish"
                  </p>
                </div>

                <div className="text-sm">
                  <div className="font-medium mb-1 text-white">🔍 Data Extraction</div>
                  <p className="text-amber-200 text-xs">
                    "Search for news about AI, find latest article, extract headline"
                  </p>
                </div>

                <div className="text-sm">
                  <div className="font-medium mb-1 text-white">📱 Social Media</div>
                  <p className="text-amber-200 text-xs">
                    "Post a tweet with text and hashtag, like recent posts from followers"
                  </p>
                </div>

                <div className="text-sm">
                  <div className="font-medium mb-1 text-white">⚙️ Admin Tasks</div>
                  <p className="text-amber-200 text-xs">
                    "Create user account, assign role, send welcome email"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-gradient-to-br from-slate-900/30 to-purple-900/30 border-slate-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <CheckCircle className="h-5 w-5 text-purple-400" />
                  <span>Key Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-purple-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Natural language processing</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-purple-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Real-time progress updates</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-purple-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Visual HTML reports</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-purple-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Screenshot capture</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-purple-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Error handling & debugging</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-purple-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Headless & headed modes</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-amber-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <ExternalLink className="h-5 w-5 text-amber-400" />
                  <span>Quick Links</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start border-purple-400/30 text-purple-200 hover:bg-purple-500/20"
                  onClick={() => window.open('http://localhost:3001/health', '_blank')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Backend Health Check
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start border-purple-400/30 text-purple-200 hover:bg-purple-500/20"
                  onClick={() => window.open('http://localhost:3001/api/test-results', '_blank')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Test Results API
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start border-purple-400/30 text-purple-200 hover:bg-purple-500/20"
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