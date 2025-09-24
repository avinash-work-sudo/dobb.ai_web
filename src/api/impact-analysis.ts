// Mock API for impact analysis
export const impactAnalysisAPI = {
  async startAnalysis(data: {
    featureId: string;
    fileUrl: string;
    prdLink?: string;
    figmaLink?: string;
    transcriptLink?: string;
  }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful response
    return {
      success: true,
      analysisId: `analysis_${Date.now()}`,
      status: 'started',
      estimatedCompletionTime: '2-3 minutes',
      message: 'Impact analysis has been started successfully'
    };
  }
};