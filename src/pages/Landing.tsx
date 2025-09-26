import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Zap, Shield, Github, ArrowRight, Star, Users, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// Glow component implementation
const Glow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'top' | 'above' | 'bottom' | 'below' | 'center';
  }
>(({ className, variant = 'top', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute w-full',
      variant === 'top' && 'top-0',
      variant === 'above' && '-top-[128px]',
      variant === 'bottom' && 'bottom-0',
      variant === 'below' && '-bottom-[128px]',
      variant === 'center' && 'top-[50%]',
      className
    )}
    {...props}
  >
    <div
      className={cn(
        'absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_hsl(270_100%_70%/.5)_10%,_transparent_60%)] sm:h-[512px]',
        variant === 'center' && '-translate-y-1/2',
      )}
    />
    <div
      className={cn(
        'absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-[2] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_hsl(45_100%_70%/.3)_10%,_transparent_60%)] sm:h-[256px]',
        variant === 'center' && '-translate-y-1/2',
      )}
    />
  </div>
));
Glow.displayName = 'Glow';

const Landing = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const heroElement = document.getElementById('ai-dev-landing');
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
      return () => heroElement.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <div 
      id="ai-dev-landing"
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white relative"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Glow variant="center" className="animate-pulse opacity-60" />
        
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
        
        {/* Mouse follow glow */}
        <div 
          className="absolute w-64 h-64 bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-3xl transition-all duration-300 pointer-events-none"
          style={{
            left: mousePosition.x - 128,
            top: mousePosition.y - 128,
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-amber-500 rounded-lg flex items-center justify-center">
            <img src="/head.png" alt="dobb.ai" className="w-5 h-5 rounded" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-300 to-amber-300 bg-clip-text text-transparent">
            dobb.ai
          </span>
        </div>
        
        
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-[calc(100vh-120px)] space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-900/50 to-amber-900/50 border border-purple-500/30 backdrop-blur-sm">
          <span className="w-2 h-2 bg-amber-400 rounded-full mr-2 animate-pulse" />
          <span className="text-sm text-purple-200">AI-Powered Development</span>
        </div>

        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-tight max-w-6xl">
          <span className="bg-gradient-to-r from-white via-purple-200 to-amber-200 bg-clip-text text-transparent">
            dobb.ai
          </span>
          <br />
         
        </h1>

        {/* Subtitle */}
        <p className="text-2xl md:text-3xl text-purple-200 max-w-4xl leading-relaxed">
          Free Engineers from daily hurdles in the product development cycle with AI-powered automation and intelligent impact analysis
        </p>

       

        {/* CTA Button */}
        <div className="pt-8">
          <Button 
            size="lg"
            onClick={() => navigate('/onboarding')}
            className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white px-16 py-8 text-xl font-semibold rounded-full shadow-2xl shadow-purple-500/25 transition-all duration-300 hover:scale-105"
          >
            Begin Your Journey
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </main>

      {/* Benefits Section */}
      <section className="relative z-10 px-6 py-16 bg-gradient-to-b from-transparent to-purple-950/20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Why Choose dobb.ai?
          </h2>
        
        </div>
        
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/20 border border-purple-500/20 rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Automated Testing</h3>
            <p className="text-sm text-purple-200">Self-healing tests that adapt to your code changes</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-green-900/20 to-slate-900/20 border border-green-500/20 rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Smart Analysis</h3>
            <p className="text-sm text-purple-200">AI-powered impact analysis for every change</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-amber-900/20 to-slate-900/20 border border-amber-500/20 rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Team Collaboration</h3>
            <p className="text-sm text-purple-200">Seamless integration with your existing tools</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-purple-900/20 to-amber-900/20 border border-purple-500/20 rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-amber-500 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Enterprise Ready</h3>
            <p className="text-sm text-purple-200">Secure, scalable, and compliant solutions</p>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30 backdrop-blur-sm p-8 hover:bg-purple-900/40 transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Speed Up Development</h3>
            <p className="text-purple-200 leading-relaxed">
              Accelerate your product development cycle with automated analysis and intelligent insights
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="bg-gradient-to-br from-amber-900/30 to-slate-900/30 border-amber-500/30 backdrop-blur-sm p-8 hover:bg-amber-900/40 transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Risk Assessment</h3>
            <p className="text-amber-200 leading-relaxed">
              Identify potential risks and dependencies before they impact your project timeline
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-amber-900/30 border-purple-500/30 backdrop-blur-sm p-8 hover:bg-gradient-to-br hover:from-purple-900/40 hover:to-amber-900/40 transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-amber-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Save Time</h3>
            <p className="text-purple-200 leading-relaxed">
              Automate manual tasks and focus on what matters most - building great products
            </p>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 px-6 py-16 bg-gradient-to-b from-purple-950/20 to-transparent">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            What Engineers Say
          </h2>
          <p className="text-lg text-purple-200">
            Real feedback from our community
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-purple-900/20 to-slate-900/20 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-purple-200 mb-4 italic">
              "We're witnessing a paradigm shift in software testing. dobb.ai's AI-driven approach eliminates the traditional bottlenecks that have plagued our industry for decades."
            </p>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                F
              </div>
              <div>
                <p className="text-white font-semibold">Founder, Tech Startup</p>
                <p className="text-purple-300 text-sm">Series A Company</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-900/20 to-slate-900/20 border border-amber-500/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-purple-200 mb-4 italic">
              "The innovation here is revolutionary. We're not just automating tests - we're creating intelligent systems that understand and adapt to our product's evolution in real-time."
            </p>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-amber-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                C
              </div>
              <div>
                <p className="text-white font-semibold">Co-Founder, SaaS Platform</p>
                <p className="text-purple-300 text-sm">Enterprise Software</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/20 to-slate-900/20 border border-green-500/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-purple-200 mb-4 italic">
              "This is the future of quality assurance. We're building products faster than ever while maintaining higher quality standards. The impact analysis alone has transformed how we approach feature development."
            </p>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                E
              </div>
              <div>
                <p className="text-white font-semibold">CEO, Fintech Startup</p>
                <p className="text-purple-300 text-sm">Unicorn Company</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-purple-900/30 to-amber-900/30 border border-purple-500/30 rounded-3xl p-12 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Development Workflow?
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={() => navigate('/onboarding')}
                className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white px-12 py-6 text-lg font-semibold rounded-full shadow-2xl shadow-purple-500/25 transition-all duration-300 hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/pricing')}
                className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10 px-12 py-6 text-lg font-semibold rounded-full"
              >
                View Pricing
              </Button>
            </div>
            <p className="text-sm text-purple-300 mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Landing;