import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Link, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  acceptsUrl?: boolean;
  acceptsFile?: boolean;
  fileTypes?: string[];
  placeholder?: string;
}

export const UploadCard = ({ 
  title, 
  description, 
  icon, 
  acceptsUrl = false, 
  acceptsFile = false,
  fileTypes = [],
  placeholder = "Enter URL or upload file..."
}: UploadCardProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    setIsUploaded(true);
    toast({
      title: "File uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setIsUploaded(true);
      toast({
        title: "URL added",
        description: `${title} URL has been added successfully.`,
      });
      setUrlInput("");
    }
  };

  return (
    <Card 
      className={`p-6 transition-all duration-300 hover:shadow-elegant ${
        isDragOver ? 'border-primary bg-surface-subtle' : 'hover:border-primary/50'
      } ${isUploaded ? 'border-green-500 bg-green-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${isUploaded ? 'bg-green-100 text-green-600' : 'bg-surface-subtle text-primary'}`}>
          {isUploaded ? <CheckCircle className="h-6 w-6" /> : icon}
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {!isUploaded && (
            <div className="space-y-3">
              {acceptsUrl && (
                <div className="flex space-x-2">
                  <Input
                    placeholder={placeholder}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleUrlSubmit} size="sm">
                    <Link className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              )}

              {acceptsFile && (
                <div className="flex items-center justify-center border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drop files here or{" "}
                      <button className="text-primary hover:underline">browse</button>
                    </p>
                    {fileTypes.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports: {fileTypes.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {isUploaded && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Successfully uploaded</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};