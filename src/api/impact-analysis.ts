// Sample PRD text for API calls
const SAMPLE_PRD_TEXT = `Phase 4 – Coupons & Discounts
1. Overview & Objective
This document describes the requirements for Phase 4, which introduces a comprehensive discount and coupon system. The objective is to simulate real-world e-commerce promotions by allowing for product-level discounts and the application of coupon codes at checkout. This will enhance the platform's commercial capabilities and provide a more dynamic pricing structure.
2. Features & Scope
2.1. In Scope
Product-Level Discounts:
Ability to define a discount for an individual product.
Supports both fixed amounts (e.g., ₹100 off) and percentage (e.g., 10% off) discounts.
On the product detail page and in the cart, the original price should be shown (e.g., struck through) alongside the new, discounted price.
Coupon Code System:
Users can enter a coupon code in a dedicated input field during the checkout process.
The system will validate the coupon against a coupons table in Supabase.
Validation logic will check if the coupon is valid, not expired, and if the cart meets the minimum order requirement.
Cart & Checkout Integration:
The cart summary will be updated to show:
Subtotal (pre-discount total).
Discount Applied (line item showing the amount saved from the coupon).
Final Total.
Only one coupon can be active at a time. Applying a new coupon will replace the existing one.
Users must have the option to remove an applied coupon.
User Feedback:
Provide clear, real-time feedback messages to the user upon coupon entry:
"Coupon applied successfully!"
"Error: This coupon is invalid or expired."
"Error: Your order must be at least ₹[amount] to use this coupon."
2.2. Out of Scope
Stacking multiple coupons.
Automatic, campaign-based discounts (e.g., "Summer Sale - 15% off all items").
User-specific or one-time-use coupons.
"Buy One, Get One" (BOGO) or other complex promotion types.
3. Technical Requirements
Tech Stack: React, Supabase (PostgreSQL Database, Edge Functions).
Data Flow and Logic:
Security: Coupon validation and final price calculation must be performed on the backend to prevent client-side manipulation. A Supabase Edge Function is the ideal tool for this. The client will send the cart contents and coupon code to the function, which will validate it against the database and return the final, trustworthy total.
Discount Priority: The system will apply discounts in the following order:
Product-level discounts are calculated first to determine the item's price in the cart.
The cart subtotal is calculated based on these potentially discounted prices.
The coupon discount is then applied to this subtotal.
4. Non-Functional Requirements
Performance: Coupon validation should be near-instantaneous to provide a smooth user experience at checkout.
Accuracy: All calculations involving discounts and totals must be precise to avoid pricing errors.
5. Success Criteria
Product-level discounts are correctly displayed and reflected in the cart's subtotal.
Users can apply a valid coupon, and the cart total updates accurately in real-time.
The system provides clear, correct error messages for invalid, expired, or ineligible coupons.
The orders table correctly records the applied coupon code and the final discount amount for each order.
Backend validation via an Edge Function prevents the creation of orders with invalid discounts.`;

// Real API for impact analysis
export const impactAnalysisAPI = {
  async startAnalysis(data: {
    featureId: string;
    fileUrl: string;
    prdLink?: string;
    figmaLink?: string;
    transcriptLink?: string;
  }) {
    const BACKEND_API_URL = 'http://localhost:8000';
    
    try {
      const response = await fetch(`${BACKEND_API_URL}/report/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prd_text: SAMPLE_PRD_TEXT
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
  }) {
    const BACKEND_API_URL = 'http://localhost:8000';
    
    try {
      const response = await fetch(`${BACKEND_API_URL}/user_stories/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prd_text: SAMPLE_PRD_TEXT
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