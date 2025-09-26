const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

// Real API for impact analysis
export const impactAnalysisAPI = {
  async startAnalysis(data: {
    featureId: string;
    fileUrl: string;
    prdLink?: string;
    figmaLink?: string;
    transcriptLink?: string;
  }) {
   
    
    try {
      const response = await fetch(`${BACKEND_API_URL}/report/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prd_url: data.fileUrl || data.prdLink
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Return in the expected format for compatibility with existing code
      return {
        success: true,
        analysisId: `analysis_${Date.now()}`,
        status: 'completed',
        impactAnalysis: result,
        message: 'Impact analysis completed successfully'
      };
    } catch (error) {
      console.error('Impact analysis API error:', error);
      throw new Error(`Failed to analyze feature: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// API for user stories generation
export const userStoriesAPI = {
  async generateUserStories(data: {
    featureId: string;
    prdLink: string;
  }) {
    
    
    try {
      const response = await fetch(`${BACKEND_API_URL}/user_stories/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prd_url: data.prdLink
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Expected API response structure should match dummy stories format:
      // [
      //   {
      //     title: string,
      //     description: string,
      //     acceptance_criteria: string[],
      //     priority: "high" | "medium" | "low",
      //     estimated_hours: number,
      //     status: "draft" | "in_progress" | "completed",
      //     test_cases: [
      //       {
      //         name: string,
      //         description: string,
      //         steps: string[],
      //         expected_result: string,
      //         priority: "high" | "medium" | "low"
      //       }
      //     ]
      //   }
      // ]
      
      // Return in the expected format for compatibility with existing code
      // API returns the array directly, not wrapped in user_stories property
      return {
        success: true,
        userStories: result, // result is already the array of user stories
        message: 'User stories generated successfully'
      };
    } catch (error) {
      console.error('User stories API error:', error);
      throw new Error(`Failed to generate user stories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// API for chatbot
export const chatbotAPI = {
  async sendMessage(data: {
    message: string;
    conversationId?: string;
  }) {
    
    
    try {
      const response = await fetch(`${BACKEND_API_URL}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: data.message,
          conversation_id: data.conversationId || null
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Expected API response structure:
      // {
      //   reply: string,
      //   conversation_id?: string
      // }
      
      return {
        success: true,
        response: result.reply || result.response || result.message || "I'm here to help!",
        conversationId: result.conversation_id || result.conversationId,
        message: 'Message sent successfully'
      };
    } catch (error) {
      console.error('Chatbot API error:', error);
      
      // Return a fallback response instead of throwing
      return {
        success: false,
        response: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        conversationId: data.conversationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};