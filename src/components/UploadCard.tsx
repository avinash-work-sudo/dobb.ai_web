import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Link, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UploadCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  acceptsUrl?: boolean;
  acceptsFile?: boolean;
  fileTypes?: string[];
  placeholder?: string;
  onFileUpload?: (url: string) => void;
  onUrlSubmit?: (url: string) => void;
}

export const UploadCard = ({ 
  title, 
  description, 
  icon, 
  acceptsUrl = false, 
  acceptsFile = false,
  fileTypes = [],
  placeholder = "Enter URL or upload file...",
  onFileUpload,
  onUrlSubmit
}: UploadCardProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileUpload = async (file: File) => {
    if (!acceptsFile) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      setIsUploaded(true);
      onFileUpload?.(urlData.publicUrl);
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setIsUploaded(true);
      onUrlSubmit?.(urlInput.trim());
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
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Drop files here or{" "}
                          <label className="text-primary hover:underline cursor-pointer">
                            browse
                            <input
                              type="file"
                              className="hidden"
                              accept={fileTypes.map(type => `.${type}`).join(',')}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file);
                              }}
                            />
                          </label>
                        </p>
                        {fileTypes.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Supports: {fileTypes.join(", ")}
                          </p>
                        )}
                      </>
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