// Mock API for impact analysis
export const impactAnalysisAPI = {
  async startAnalysis(data: {
    featureId: string;
    fileUrl: string;
    prdLink?: string;
    figmaLink?: string;
    transcriptLink?: string;
  }) {
    // Simulate API delay for processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock comprehensive impact analysis result
    const mockImpactAnalysis = {
      summary: "The User Authentication System is a critical infrastructure component that requires careful implementation across multiple application layers. The analysis reveals significant dependencies on the database layer, API gateway, and frontend components. This feature introduces moderate complexity with high business value and requires coordination between backend and frontend teams.",
      refined_prd: `# Enhanced User Authentication System

## Overview
This document outlines the requirements for implementing a comprehensive user authentication system that includes registration, login, password reset, and session management capabilities.

## Features
1. **User Registration**
   - Email/username validation
   - Password strength requirements
   - Email verification process
   - Terms of service acceptance

2. **User Login**
   - Multi-factor authentication support
   - Remember me functionality
   - Account lockout after failed attempts
   - Social login integration (Google, GitHub)

3. **Password Management**
   - Secure password reset via email
   - Password history tracking
   - Password expiration policies
   - Account recovery options

## Technical Requirements
- JWT token-based authentication
- HTTPS encryption for all auth endpoints
- Rate limiting on authentication attempts
- Audit logging for security events

## Success Metrics
- 99.9% authentication uptime
- < 500ms average response time
- Zero security incidents
- 95% user satisfaction score`,
      impactScore: {
        totalImpactScore: 8.5,
        riskLevel: "Medium",
        estimatedEffort: "3-4 weeks",
        confidence: 0.85
      },
      impactedModules: [
        {
          name: "User Authentication",
          impact: "High",
          description: "Changes required to user login flow and session management",
          effort: "1 week"
        },
        {
          name: "Payment Processing",
          impact: "Medium", 
          description: "Updates needed for payment validation and error handling",
          effort: "3 days"
        },
        {
          name: "Data Analytics",
          impact: "Low",
          description: "Minor updates to tracking events",
          effort: "1 day"
        }
      ],
      technicalImpacts: [
        {
          category: "Database",
          changes: ["New user_preferences table", "Index optimization on user_sessions"],
          complexity: "Medium"
        },
        {
          category: "API",
          changes: ["3 new endpoints", "2 modified endpoints", "Updated authentication middleware"],
          complexity: "High"
        },
        {
          category: "Frontend",
          changes: ["New settings page", "Updated login component", "Enhanced error handling"],
          complexity: "Medium"
        }
      ],
      identifiedGaps: [
        {
          type: "Security",
          description: "Need to implement rate limiting for new API endpoints",
          priority: "High",
          recommendation: "Add Redis-based rate limiting before deployment"
        },
        {
          type: "Testing",
          description: "Missing integration tests for payment flow",
          priority: "Medium", 
          recommendation: "Create comprehensive test suite for payment processing"
        },
        {
          type: "Documentation",
          description: "API documentation needs updates",
          priority: "Low",
          recommendation: "Update OpenAPI specs and add code examples"
        }
      ],
      recommendations: [
        "Implement feature flags for gradual rollout",
        "Set up monitoring for new payment endpoints",
        "Consider A/B testing for user interface changes",
        "Plan database migration during low-traffic hours"
      ],
      dependencies: [
        {
          name: "Redis Cache",
          type: "Infrastructure",
          required: true,
          timeline: "Week 1"
        },
        {
          name: "Payment Gateway API Update",
          type: "External",
          required: true,
          timeline: "Week 2"
        }
      ]
    };
    
    // Mock successful response
    return {
      success: true,
      analysisId: `analysis_${Date.now()}`,
      status: 'completed',
      impactAnalysis: mockImpactAnalysis,
      message: 'Impact analysis completed successfully'
    };
  }
};