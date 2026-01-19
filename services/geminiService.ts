
import { GoogleGenAI, Type } from "@google/genai";
import { HotelInput, EvaluationResult, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: {
      type: Type.OBJECT,
      properties: {
        hotelName: { type: Type.STRING },
        city: { type: Type.STRING },
        status: { type: Type.STRING },
        finalDecision: { type: Type.STRING, description: "Approve / Continue, Conditional, Reject / Exit, or AUTO REJECT / EXIT" },
        averageScore: { type: Type.NUMBER },
        detectedRating: { type: Type.NUMBER, description: "The primary OTA rating normalized to a 5-point scale for consistency." },
        detectedADR: { type: Type.STRING, description: "The current best available rate." }
      },
      required: ["hotelName", "city", "status", "finalDecision", "averageScore", "detectedRating", "detectedADR"]
    },
    scorecard: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          parameter: { type: Type.STRING },
          score: { type: Type.NUMBER },
          reason: { type: Type.STRING }
        },
        required: ["parameter", "score", "reason"]
      }
    },
    otaAudit: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          channel: { type: Type.STRING },
          status: { type: Type.STRING },
          rating: { type: Type.NUMBER, description: "Current rating. Use Scale 10 for Booking.com and Agoda. Use Scale 5 for Google and MMT." },
          reviewCount: { type: Type.STRING, description: "Total number of reviews found, e.g. '1.2k' or '458 reviews'." },
          history: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.NUMBER }
              },
              required: ["label", "value"]
            }
          },
          blockers: { type: Type.ARRAY, items: { type: Type.STRING } },
          recoveryPlan: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["channel", "status", "rating", "reviewCount", "blockers", "recoveryPlan"]
      }
    },
    roomTypes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          price: { type: Type.STRING },
          inclusions: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING }
        },
        required: ["name", "price", "inclusions", "description"]
      }
    },
    competitors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          rating: { type: Type.NUMBER },
          adr: { type: Type.STRING },
          distance: { type: Type.STRING },
          category: { type: Type.STRING },
          otaName: { type: Type.STRING }
        },
        required: ["name", "rating", "adr", "distance", "category", "otaName"]
      }
    },
    topCorporates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          relevance: { type: Type.STRING }
        },
        required: ["name", "relevance"]
      }
    },
    topTravelAgents: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          relevance: { type: Type.STRING }
        },
        required: ["name", "relevance"]
      }
    },
    keyRisks: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    commercialUpside: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    finalRecommendation: { type: Type.STRING },
    conditionalActionPlan: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      nullable: true
    },
    hardStopFlag: { type: Type.BOOLEAN },
    hardStopDetails: { type: Type.STRING, nullable: true }
  },
  required: [
    "executiveSummary", "scorecard", "otaAudit", "roomTypes", "competitors", 
    "topCorporates", "topTravelAgents", "keyRisks", "commercialUpside", 
    "finalRecommendation", "hardStopFlag"
  ]
};

export async function evaluateHotel(input: HotelInput): Promise<EvaluationResult> {
  const prompt = `
    You are a Senior Commercial & Strategy Leader at Treebo Hotels. 
    Evaluate the following hotel by searching online (Google Search, OTAs like MakeMyTrip, Booking.com, TripAdvisor, Agoda) for its current and historical data.
    
    Target Hotel: ${input.hotelName} in ${input.city}
    Status: ${input.status}
    
    CRITICAL INSTRUCTIONS FOR ACCURACY:
    1. OTA Performance Audit: 
       - Evaluate MakeMyTrip, Booking.com, Agoda, and Google.
       - FOR BOOKING.COM & AGODA: Use a 10-point scale for the rating. (e.g., 8.2).
       - FOR GOOGLE & MAKEMYTRIP: Use a 5-point scale for the rating. (e.g., 4.1).
       - MANDATORY: Include the specific review count found on each OTA.
    2. Search Verification: Strictly identify "${input.hotelName}" in "${input.city}".
    3. Competitor Analysis: Identify 3-4 competitors within 2km micro-market.
    4. Market Intelligence: Identify top local corporates and travel agents that drive demand in this specific city/micro-market.
    
    Output exactly in the provided JSON schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        tools: [{ googleSearch: {} }],
      },
    });

    if (!response.text) throw new Error("No response from Gemini");
    
    const parsed: EvaluationResult = JSON.parse(response.text.trim());

    // Basic cleanup logic to ensure no rating is zero if data exists
    if (parsed.executiveSummary.detectedRating === 0 && parsed.otaAudit.length > 0) {
      const google = parsed.otaAudit.find(a => a.channel.toLowerCase().includes('google'));
      if (google) parsed.executiveSummary.detectedRating = google.rating;
    }

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      const sources: GroundingSource[] = chunks
        .filter((c: any) => c.web)
        .map((c: any) => ({
          title: c.web.title || 'Source',
          uri: c.web.uri
        }));
      parsed.groundingSources = sources;
    }

    return parsed;
  } catch (error) {
    console.error("Gemini Evaluation Error:", error);
    throw error;
  }
}
