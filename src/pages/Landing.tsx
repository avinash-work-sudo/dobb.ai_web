import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Zap, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface-elevated">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-primary p-2 rounded-lg shadow-elegant">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">DOBB.ai</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6">
        <section className="py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              DOBB.ai
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Free developers from daily hurdles in the product development cycle with AI-powered automation and intelligent impact analysis
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg" 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-primary text-white hover:opacity-90 transition-all duration-300 shadow-elegant"
              >
                Try It Out
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-surface-elevated rounded-lg p-6 shadow-elegant">
                <div className="bg-gradient-primary p-3 rounded-lg w-fit mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Speed Up Development</h3>
                <p className="text-muted-foreground">
                  Accelerate your product development cycle with automated analysis and intelligent insights
                </p>
              </div>

              <div className="bg-surface-elevated rounded-lg p-6 shadow-elegant">
                <div className="bg-gradient-primary p-3 rounded-lg w-fit mx-auto mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Risk Assessment</h3>
                <p className="text-muted-foreground">
                  Identify potential risks and dependencies before they impact your project timeline
                </p>
              </div>

              <div className="bg-surface-elevated rounded-lg p-6 shadow-elegant">
                <div className="bg-gradient-primary p-3 rounded-lg w-fit mx-auto mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Save Time</h3>
                <p className="text-muted-foreground">
                  Automate manual tasks and focus on what matters most - building great products
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;