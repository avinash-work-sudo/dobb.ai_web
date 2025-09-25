import { Button } from "@/components/ui/button";
import { FileText, Settings } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border bg-surface-elevated">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg shadow-elegant">
                <img src="/head.png" alt="DOBB.ai" className="size-10" />
              </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Impact Analyzer</h1>
              <p className="text-sm text-muted-foreground">Comprehensive project impact analysis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};