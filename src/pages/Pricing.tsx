import { GradientCard } from "@/components/ui/gradient-card";
import { Check, X, Users, Zap, Shield, Crown } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Free Plan",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "Up to 5 users",
        "File upload & organization",
        "Limited impact analysis",
        "Basic user stories"
      ],
      missingFeatures: [
        "QA automation",
        "Self-healing tests",
        "Dedicated support",
        // "Custom integrations",
        // "Priority feature requests",
        // "SLA guarantees",
        // "On-premise deployment",
      ],
      isPopular: false,
      buttonText: "Get Started Free",
      icon: <Users className="w-5 h-5" />
    },
    {
      name: "Starter",
      price: "$49",
      subtitle: "per user per month",
      description: "For growing teams",
      features: [
        "Everything in Free",
        "Unlimited users",
        "Full impact analysis",
        "Advanced user stories",
        "QA automation"
      ],
      missingFeatures: [
        "Self-healing tests",
      ],
      isPopular: true,
      buttonText: "Start Free Trial",
      icon: <Zap className="w-5 h-5" />
    },
    {
      name: "Pro",
      price: "$149",
      subtitle: "per user per month",
      description: "For advanced teams",
      features: [
        "Everything in Starter",
        "Self-healing tests",
        "Knowledge transfer"
      ],
      missingFeatures: [
        "Dedicated support",
        "Custom integrations",
        "Priority feature requests",
      ],
      isPopular: false,
      buttonText: "Start Free Trial",
      icon: <Shield className="w-5 h-5" />
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Dedicated support",
        "Custom integrations",
        "Priority feature requests",
        "SLA guarantees",
        "On-premise deployment"
      ],
      isPopular: false,
      buttonText: "Contact Sales",
      icon: <Crown className="w-5 h-5" />
    }
  ];


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

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <GradientCard
                key={plan.name}
                plan={plan}
                variant="pricing"
                buttonAction={() => {
                  // Handle button click actions
                  console.log(`Clicked on ${plan.name}`);
                }}
              />
            ))}
          </div>

          {/* Additional Info */}
          <div className="text-center mt-12">
            <p className="text-sm text-purple-300">
              No credit card required for Free plan • Cancel anytime • 14-day free trial for paid plans
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
