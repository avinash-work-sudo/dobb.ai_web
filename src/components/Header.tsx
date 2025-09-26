import { Button } from "@/components/ui/button";
import { FileText, Settings } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-purple-500/30 bg-gradient-to-r from-slate-900/90 to-purple-950/90 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-amber-500 rounded-lg flex items-center justify-center">
              <img src="/head.png" alt="dobb.ai" className="w-5 h-5 rounded" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-amber-300 bg-clip-text text-transparent">
                dobb.ai
              </h1>
              <p className="text-sm text-purple-200">AI-Powered Development</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-purple-200 hover:text-white hover:bg-purple-500/20"
            >
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-purple-200 hover:text-white hover:bg-purple-500/20"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};