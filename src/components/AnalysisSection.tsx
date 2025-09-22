import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Download, RefreshCw } from "lucide-react";

export const AnalysisSection = () => {
  return (
    <Card className="p-6 shadow-soft">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Impact Analysis</h2>
            <p className="text-muted-foreground">Generate comprehensive analysis from your uploaded data</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 shadow-elegant">
            <Play className="h-4 w-4 mr-2" />
            Run Analysis
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-subtle p-4 rounded-lg border">
            <h3 className="font-medium text-foreground mb-2">Dependencies</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Components</span>
                <span className="text-sm font-medium">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Features</span>
                <span className="text-sm font-medium">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">APIs</span>
                <span className="text-sm font-medium">5</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-subtle p-4 rounded-lg border">
            <h3 className="font-medium text-foreground mb-2">Risk Assessment</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Low Risk: 60%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Medium Risk: 30%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">High Risk: 10%</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-subtle p-4 rounded-lg border">
            <h3 className="font-medium text-foreground mb-2">Effort Estimation</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Development</span>
                  <span className="font-medium">8-12 days</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Testing</span>
                  <span className="font-medium">3-5 days</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-analyze
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">Last updated: 2 hours ago</span>
        </div>
      </div>
    </Card>
  );
};