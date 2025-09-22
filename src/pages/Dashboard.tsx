import { Header } from "@/components/Header";
import { UploadCard } from "@/components/UploadCard";
import { AnalysisSection } from "@/components/AnalysisSection";
import { Figma, FileText, Bug, BookOpen } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Project Impact Analysis
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload your project artifacts to generate comprehensive impact analysis and risk assessment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UploadCard
            title="Figma Design"
            description="Upload Figma links to analyze design changes and component dependencies"
            icon={<Figma className="h-6 w-6" />}
            acceptsUrl={true}
            placeholder="https://figma.com/file/..."
          />
          
          <UploadCard
            title="Confluence Pages"
            description="Link confluence documentation to understand requirements and specifications"
            icon={<BookOpen className="h-6 w-6" />}
            acceptsUrl={true}
            placeholder="https://confluence.atlassian.net/..."
          />
          
          <UploadCard
            title="Product Requirements Document"
            description="Upload PRD files to analyze feature scope and business impact"
            icon={<FileText className="h-6 w-6" />}
            acceptsFile={true}
            fileTypes={["PDF", "DOCX", "MD"]}
          />
          
          <UploadCard
            title="Jira Tickets"
            description="Import Jira data to understand development scope and dependencies"
            icon={<Bug className="h-6 w-6" />}
            acceptsUrl={true}
            acceptsFile={true}
            fileTypes={["JSON", "CSV"]}
            placeholder="https://jira.atlassian.net/browse/..."
          />
        </div>

        <AnalysisSection />
      </main>
    </div>
  );
};

export default Index;
