import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Free Plan",
      price: "Free",
      description: "Perfect for getting started",
      features: {
        users: "Up to 5",
        fileUpload: true,
        impactAnalysis: "Limited",
        userStories: "Basic",
        qaAutomation: false,
        selfHealingTests: false,
        knowledgeTransfer: false,
        dedicatedSupport: false,
        customIntegrations: false,
      }
    },
    {
      name: "Starter",
      price: "$49/user/month",
      description: "For growing teams",
      features: {
        users: "Unlimited",
        fileUpload: true,
        impactAnalysis: true,
        userStories: true,
        qaAutomation: false,
        selfHealingTests: false,
        knowledgeTransfer: false,
        dedicatedSupport: false,
        customIntegrations: false,
      }
    },
    {
      name: "Pro",
      price: "$149/user/month",
      description: "For advanced teams",
      features: {
        users: "Unlimited",
        fileUpload: true,
        impactAnalysis: true,
        userStories: true,
        qaAutomation: true,
        selfHealingTests: true,
        knowledgeTransfer: true,
        dedicatedSupport: false,
        customIntegrations: false,
      }
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: {
        users: "Unlimited",
        fileUpload: true,
        impactAnalysis: true,
        userStories: true,
        qaAutomation: true,
        selfHealingTests: true,
        knowledgeTransfer: true,
        dedicatedSupport: true,
        customIntegrations: true,
      }
    }
  ];

  const features = [
    { key: "users", label: "Users" },
    { key: "fileUpload", label: "File Upload & Organization" },
    { key: "impactAnalysis", label: "Impact Analysis" },
    { key: "userStories", label: "User Stories Generation" },
    { key: "qaAutomation", label: "QA Automation" },
    { key: "selfHealingTests", label: "Self-healing Tests" },
    { key: "knowledgeTransfer", label: "Knowledge Transfer" },
    { key: "dedicatedSupport", label: "Dedicated Support" },
    { key: "customIntegrations", label: "Custom Integrations" },
  ];

  const renderFeatureValue = (value: boolean | string) => {
    if (value === true) {
      return <Check className="h-5 w-5 text-blue-500" />;
    } else if (value === false) {
      return <X className="h-5 w-5 text-gray-300" />;
    } else {
      return <span className="text-sm text-purple-200">{value}</span>;
    }
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
              <img src="/head.png" alt="dobb.ai" className="w-5 h-5 rounded" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-amber-300 bg-clip-text text-transparent">dobb.ai</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Title and Description */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-amber-200 bg-clip-text text-transparent mb-4">
              Pricing Plans
            </h1>
            <p className="text-lg text-purple-200 max-w-3xl mx-auto">
              Choose the perfect plan for your team. Start free and scale as you grow with our flexible pricing options.
            </p>
          </div>

          {/* Pricing Table */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 relative overflow-hidden">
            {/* Money Tree Background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                {/* Simplified money tree representation */}
                <div className="text-8xl text-green-400">💰</div>
                <div className="text-6xl text-yellow-400 mt-4">🌳</div>
                <div className="text-4xl text-yellow-300 mt-2">🪙🪙🪙</div>
              </div>
            </div>

            <div className="relative z-10">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">Features</h3>
                </div>
                {plans.map((plan) => (
                  <div key={plan.name} className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                    <p className="text-sm text-purple-200 mb-2">({plan.price})</p>
                    <p className="text-xs text-purple-300">{plan.description}</p>
                  </div>
                ))}
              </div>

              {/* Table Rows */}
              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature.key} className="grid grid-cols-5 gap-4 items-center py-3 border-b border-purple-500/20 last:border-b-0">
                    <div className="text-left">
                      <span className="text-white font-medium">{feature.label}</span>
                    </div>
                    {plans.map((plan) => (
                      <div key={`${plan.name}-${feature.key}`} className="flex justify-center items-center">
                        {renderFeatureValue(plan.features[feature.key as keyof typeof plan.features])}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white transition-all duration-300 shadow-2xl shadow-purple-500/25"
              >
                Start Free Trial
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
              >
                Contact Sales
              </Button>
            </div>
            <p className="text-sm text-purple-300 mt-4">
              No credit card required • Cancel anytime • 14-day free trial
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
