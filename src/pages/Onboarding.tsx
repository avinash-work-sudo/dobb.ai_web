import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Github, Figma, Settings, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useOAuth } from "@/hooks/useOAuth";

const Onboarding = () => {
  const navigate = useNavigate();
  const { connectedAccounts, isConnected, connectProvider, disconnectProvider, isLoading } = useOAuth();

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
      connectProvider(accountId);
    }
  };

  const canProceed = accounts
    .filter(account => account.required)
    .every(account => isConnected(account.id));

  const handleContinue = () => {
    navigate('/homepage');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface-elevated">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-primary p-2 rounded-lg shadow-elegant">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">DOBB.ai</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Connect Your Project Accounts
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect your development tools to enable comprehensive impact analysis and automated insights across your project ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {accounts.map((account) => {
              const accountConnected = isConnected(account.id);
              
              return (
                <Card key={account.id} className="relative bg-surface-elevated border border-border hover:shadow-elegant transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${accountConnected ? 'bg-green-500/20' : 'bg-gradient-primary'}`}>
                          {accountConnected ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          ) : (
                            <div className="text-white">{account.icon}</div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-foreground">
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
                    <CardDescription className="text-muted-foreground mb-4">
                      {account.description}
                    </CardDescription>
                    
                    <Button
                      onClick={() => handleConnect(account.id)}
                      disabled={isLoading}
                      className={`w-full ${
                        accountConnected 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-gradient-primary text-white hover:opacity-90'
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
            <div className="bg-surface-elevated border border-border rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="flex space-x-2">
                  {accounts.filter(acc => acc.required).map((account) => (
                    <div
                      key={account.id}
                      className={`w-3 h-3 rounded-full ${
                        isConnected(account.id)
                          ? 'bg-green-500'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {connectedAccounts.filter(id => accounts.find(acc => acc.id === id)?.required).length} of {accounts.filter(acc => acc.required).length} required connections
                </span>
              </div>
              
              <Button
                onClick={handleContinue}
                disabled={!canProceed}
                size="lg"
                className="bg-gradient-primary text-white hover:opacity-90 transition-all duration-300 shadow-elegant"
              >
                Continue to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              {!canProceed && (
                <p className="text-sm text-muted-foreground mt-3">
                  Please connect all required accounts to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;