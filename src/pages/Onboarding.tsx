import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useOAuth } from "@/hooks/useOAuth";
import { ArrowRight, CheckCircle2, Figma, Github, Info, Loader2, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const navigate = useNavigate();
  const { connectedAccounts, isConnected, connectProvider, disconnectProvider, isLoading } = useOAuth();
  
  // GitHub modal state
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [gitHubForm, setGitHubForm] = useState({
    username: '',
    repoName: '',
    owner: '',
    pat: ''
  });

  // Atlassian modal state
  const [isAtlassianModalOpen, setIsAtlassianModalOpen] = useState(false);
  const [atlassianForm, setAtlassianForm] = useState({
    apiToken: '',
    email: '',
    siteBaseUrl: '',
    projectKey: ''
  });

  // Figma modal state
  const [isFigmaModalOpen, setIsFigmaModalOpen] = useState(false);
  const [figmaForm, setFigmaForm] = useState({
    accessToken: '',
    fileId: '',
    teamId: ''
  });

  const accounts = [
    {
      id: "github",
      name: "GitHub",
      description: "Connect your repositories to analyze code changes and dependencies",
      icon: <Github className="h-6 w-6" />,
      required: true,
    },
    {
      id: "figma",
      name: "Figma",
      description: "Link design files to understand UI/UX impact and component changes",
      icon: <Figma className="h-6 w-6" />,
      required: true,
    },
    {
      id: "atlassian",
      name: "Atlassian",
      description: "Connect Jira and Confluence for project management and documentation",
      icon: <Settings className="h-6 w-6" />,
      required: false,
    },
  ];

  const handleConnect = (accountId: string) => {
    if (isConnected(accountId)) {
      disconnectProvider(accountId);
    } else {
      // Special handling for GitHub, Figma, and Atlassian - open modals instead of direct connection
      if (accountId === 'github') {
        setIsGitHubModalOpen(true);
      } else if (accountId === 'figma') {
        setIsFigmaModalOpen(true);
      } else if (accountId === 'atlassian') {
        setIsAtlassianModalOpen(true);
      } else {
        connectProvider(accountId);
      }
    }
  };

  const handleGitHubFormChange = (field: string, value: string) => {
    setGitHubForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGitHubSubmit = () => {
    // Validate form
    if (!gitHubForm.username || !gitHubForm.repoName || !gitHubForm.owner || !gitHubForm.pat) {
      alert('Please fill in all fields');
      return;
    }

    // Here you would typically send the data to your backend
    console.log('GitHub connection data:', gitHubForm);
    
    // Simulate connection by directly setting localStorage and updating state
    localStorage.setItem('github_connected', 'true');
    localStorage.setItem('github_token', 'simulated_token_' + Date.now());
    
    // Force a re-render by updating the connected accounts
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'github_connected',
      newValue: 'true'
    }));
    
    // Close modal and reset form
    setIsGitHubModalOpen(false);
    setGitHubForm({ username: '', repoName: '', owner: '', pat: '' });
  };

  const handleGitHubModalClose = () => {
    setIsGitHubModalOpen(false);
    setGitHubForm({ username: '', repoName: '', owner: '', pat: '' });
  };

  const handleAtlassianFormChange = (field: string, value: string) => {
    setAtlassianForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAtlassianSubmit = () => {
    // Validate form
    if (!atlassianForm.apiToken || !atlassianForm.email || !atlassianForm.siteBaseUrl || !atlassianForm.projectKey) {
      alert('Please fill in all fields');
      return;
    }

    // Here you would typically send the data to your backend
    console.log('Atlassian connection data:', atlassianForm);
    
    // Simulate connection by directly setting localStorage and updating state
    localStorage.setItem('atlassian_connected', 'true');
    localStorage.setItem('atlassian_token', 'simulated_token_' + Date.now());
    
    // Force a re-render by updating the connected accounts
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'atlassian_connected',
      newValue: 'true'
    }));
    
    // Close modal and reset form
    setIsAtlassianModalOpen(false);
    setAtlassianForm({ apiToken: '', email: '', siteBaseUrl: '', projectKey: '' });
  };

  const handleAtlassianModalClose = () => {
    setIsAtlassianModalOpen(false);
    setAtlassianForm({ apiToken: '', email: '', siteBaseUrl: '', projectKey: '' });
  };

  const handleFigmaFormChange = (field: string, value: string) => {
    setFigmaForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFigmaSubmit = () => {
    // Validate form
    if (!figmaForm.accessToken || !figmaForm.fileId || !figmaForm.teamId) {
      alert('Please fill in all fields');
      return;
    }

    // Here you would typically send the data to your backend
    console.log('Figma connection data:', figmaForm);
    
    // Simulate connection by directly setting localStorage and updating state
    localStorage.setItem('figma_connected', 'true');
    localStorage.setItem('figma_token', 'simulated_token_' + Date.now());
    
    // Force a re-render by updating the connected accounts
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'figma_connected',
      newValue: 'true'
    }));
    
    // Close modal and reset form
    setIsFigmaModalOpen(false);
    setFigmaForm({ accessToken: '', fileId: '', teamId: '' });
  };

  const handleFigmaModalClose = () => {
    setIsFigmaModalOpen(false);
    setFigmaForm({ accessToken: '', fileId: '', teamId: '' });
  };

  const canProceed = accounts
    .filter(account => account.required)
    .every(account => isConnected(account.id));

  const handleContinue = () => {
    navigate('/homepage');
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

      {/* Header */}
      <header className="relative z-10 border-b border-purple-500/30 bg-gradient-to-r from-slate-900/90 to-purple-950/90 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-amber-500 rounded-lg flex items-center justify-center">
              <img src="/head.png" alt="DOBB.ai" className="w-5 h-5 rounded" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-amber-300 bg-clip-text text-transparent">DOBB.ai</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-amber-200 bg-clip-text text-transparent mb-4">
              Connect Your Project Accounts
            </h1>
            <p className="text-lg text-purple-200 max-w-2xl mx-auto">
              Connect your development tools to enable comprehensive impact analysis and automated insights across your project ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {accounts.map((account) => {
              const accountConnected = isConnected(account.id);
              
              return (
                <Card key={account.id} className="relative bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm hover:bg-purple-900/40 transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${accountConnected ? 'bg-blue-500/20' : 'bg-gradient-to-br from-purple-500 to-amber-500'}`}>
                          {accountConnected ? (
                            <CheckCircle2 className="h-6 w-6 text-blue-500" />
                          ) : (
                            <div className="text-white">{account.icon}</div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-white">
                            {account.name}
                          </CardTitle>
                          {account.required && (
                            <Badge variant="secondary" className="mt-1">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="text-purple-200 mb-4">
                      {account.description}
                    </CardDescription>
                    
                    <Button
                      onClick={() => handleConnect(account.id)}
                      disabled={isLoading}
                      className={`w-full ${
                        accountConnected 
                          ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                          : 'bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white'
                      } transition-all duration-300`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : accountConnected ? (
                        'Connected'
                      ) : (
                        `Connect ${account.name}`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border border-purple-500/30 backdrop-blur-sm rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="flex space-x-2">
                  {accounts.filter(acc => acc.required).map((account) => (
                    <div
                      key={account.id}
                      className={`w-3 h-3 rounded-full ${
                        isConnected(account.id)
                          ? 'bg-blue-500'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-purple-200">
                  {connectedAccounts.filter(id => accounts.find(acc => acc.id === id)?.required).length} of {accounts.filter(acc => acc.required).length} required connections
                </span>
              </div>
              
              <Button
                onClick={handleContinue}
                disabled={!canProceed}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white transition-all duration-300 shadow-2xl shadow-purple-500/25"
              >
                Continue to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              {!canProceed && (
                <p className="text-sm text-purple-200 mt-3">
                  Please connect all required accounts to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* GitHub Connection Modal */}
      <Dialog open={isGitHubModalOpen} onOpenChange={setIsGitHubModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-slate-900 to-purple-950 border-purple-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Github className="h-5 w-5" />
              <span>Connect GitHub Account</span>
            </DialogTitle>
            <DialogDescription>
              Enter your GitHub repository details and Personal Access Token to connect your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={gitHubForm.username}
                onChange={(e) => handleGitHubFormChange('username', e.target.value)}
                placeholder="your-github-username"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="owner" className="text-right">
                Owner
              </Label>
              <Input
                id="owner"
                value={gitHubForm.owner}
                onChange={(e) => handleGitHubFormChange('owner', e.target.value)}
                placeholder="username or organization"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="repoName" className="text-right">
                Repository
              </Label>
              <Input
                id="repoName"
                value={gitHubForm.repoName}
                onChange={(e) => handleGitHubFormChange('repoName', e.target.value)}
                placeholder="repository-name"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor="pat" className="text-right cursor-help">
                      PAT
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Personal Access Token needs repository access permissions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Input
                id="pat"
                type="password"
                value={gitHubForm.pat}
                onChange={(e) => handleGitHubFormChange('pat', e.target.value)}
                placeholder="Personal Access Token"
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleGitHubModalClose}>
              Cancel
            </Button>
            <Button onClick={handleGitHubSubmit} className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white">
              Connect GitHub
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Figma Connection Modal */}
      <Dialog open={isFigmaModalOpen} onOpenChange={setIsFigmaModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-slate-900 to-purple-950 border-purple-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Figma className="h-5 w-5" />
              <span>Connect Figma Account</span>
            </DialogTitle>
            <DialogDescription>
              Enter your Figma access token and file details to connect your design files for UI/UX impact analysis.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="flex items-center justify-end gap-2">
                <Label htmlFor="accessToken" className="text-right">
                  Access Token
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Personal Access Token from your Figma account settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="accessToken"
                type="password"
                value={figmaForm.accessToken}
                onChange={(e) => handleFigmaFormChange('accessToken', e.target.value)}
                placeholder="Figma Access Token"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileId" className="text-right">
                File ID
              </Label>
              <Input
                id="fileId"
                value={figmaForm.fileId}
                onChange={(e) => handleFigmaFormChange('fileId', e.target.value)}
                placeholder="File ID from Figma URL"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="teamId" className="text-right">
                Team ID
              </Label>
              <Input
                id="teamId"
                value={figmaForm.teamId}
                onChange={(e) => handleFigmaFormChange('teamId', e.target.value)}
                placeholder="Team ID from Figma URL"
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleFigmaModalClose}>
              Cancel
            </Button>
            <Button onClick={handleFigmaSubmit} className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white">
              Connect Figma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Atlassian Connection Modal */}
      <Dialog open={isAtlassianModalOpen} onOpenChange={setIsAtlassianModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-slate-900 to-purple-950 border-purple-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Connect Atlassian Account</span>
            </DialogTitle>
            <DialogDescription>
              Enter your Atlassian account details to connect Jira and Confluence for project management and documentation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={atlassianForm.email}
                onChange={(e) => handleAtlassianFormChange('email', e.target.value)}
                placeholder="your-email@company.com"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="flex items-center justify-end gap-2">
                <Label htmlFor="apiToken" className="text-right">
                  API Token
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>API Token from your Atlassian account settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="apiToken"
                type="password"
                value={atlassianForm.apiToken}
                onChange={(e) => handleAtlassianFormChange('apiToken', e.target.value)}
                placeholder="API Token"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="siteBaseUrl" className="text-right">
                Site URL
              </Label>
              <Input
                id="siteBaseUrl"
                value={atlassianForm.siteBaseUrl}
                onChange={(e) => handleAtlassianFormChange('siteBaseUrl', e.target.value)}
                placeholder="https://yourcompany.atlassian.net"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectKey" className="text-right">
                Project Key
              </Label>
              <Input
                id="projectKey"
                value={atlassianForm.projectKey}
                onChange={(e) => handleAtlassianFormChange('projectKey', e.target.value)}
                placeholder="PROJ or Project ID"
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleAtlassianModalClose}>
              Cancel
            </Button>
            <Button onClick={handleAtlassianSubmit} className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white">
              Connect Atlassian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Onboarding;