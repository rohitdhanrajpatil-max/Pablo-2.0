
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
        detectedRating: { type: Type.NUMBER, description: "The current OTA rating of the target hotel found during search, normalized to a 5-point scale." },
        detectedADR: { type: Type.STRING, description: "The current best available rate of the target hotel found during search." }
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
          rating: { type: Type.NUMBER, description: "The current rating of the target property on this specific OTA, MUST BE normalized to a 5.0 scale (e.g., 8.0/10 becomes 4.0)." },
          history: {
            type: Type.ARRAY,
            description: "A historical trend of ratings for the last 4-6 data points, normalized to 5.0 scale.",
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "The time period (e.g., 'Jan', 'Feb')." },
                value: { type: Type.NUMBER, description: "The rating during that period (Scale 0-5)." }
              },
              required: ["label", "value"]
            }
          },
          blockers: { type: Type.ARRAY, items: { type: Type.STRING } },
          recoveryPlan: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["channel", "status", "rating", "blockers", "recoveryPlan"]
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
          rating: { type: Type.NUMBER, description: "Normalized 5.0 scale rating for competitor." },
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
    "executiveSummary", 
    "scorecard", 
    "otaAudit", 
    "roomTypes",
    "competitors", 
    "topCorporates", 
    "topTravelAgents", 
    "keyRisks", 
    "commercialUpside", 
    "finalRecommendation", 
    "hardStopFlag"
  ]
};

export async function evaluateHotel(input: HotelInput): Promise<EvaluationResult> {
  const prompt = `
    You are a Senior Commercial & Strategy Leader at Treebo Hotels. 
    Evaluate the following hotel by searching online (Google Search, OTAs like MakeMyTrip, Goibibo, Booking.com, TripAdvisor, Agoda) for its current and historical data.
    
    Target Hotel: ${input.hotelName} in ${input.city}
    Status: ${input.status}
    ${input.rawDetails ? `Additional User Context: ${input.rawDetails}` : ''}
    
    CRITICAL INSTRUCTIONS FOR ACCURACY:
    1. Search Verification: Strictly identify "${input.hotelName}" in "${input.city}". Do not use ratings for similar-sounding hotels.
    2. Rating Normalization: ALL ratings (OTA Audit, Competitors, Executive Summary) MUST be reported on a 5.0 scale. 
       - If a source is out of 10 (like Booking.com 8.2), divide by 2 (result: 4.1). 
       - If a source is out of 5 (like TripAdvisor 4.0), keep it as 4.0.
       - NEVER return a rating higher than 5.0.
    3. Live Data: Only use data found in current search snippets (e.g., "MakeMyTrip 4.1/5 (1200 reviews)").
    
    Objective:
    - Use search to find: Room inventory/config, current detected ADR (pricing), current guest reviews (rating), location strengths, and competition in the micro-market.
    - Evaluate based on Treebo standards.
    
    Evaluation Rules:
    1. Score ONLY these 6 parameters (0-10) for the scorecard:
       - Location & micro-market strength
       - City demand & seasonality
       - Room inventory & configuration
       - Pricing power (ADR potential)
       - Revenue & RevPAR upside
       - Brand fit with Treebo standards
    
    2. Explicit Brand Check: Evaluate alignment with positioning, maintenance quality, and professionalism.
    
    3. Decision Thresholds: >= 7.0 Approve, 5.0-6.9 Conditional, < 5.0 Reject.
    
    4. OTA Performance Audit: You MUST evaluate exactly these four channels: MakeMyTrip, Booking.com, Agoda, and Google. Identify 'Channel Blockers', the property's current rating, a 'Recovery Plan', AND approximate historical rating trends for the last 4-6 months/data points.
    
    5. Room Type Detailed Audit: Find specific room categories available on OTAs.
    
    6. Competitive Landscape: Identify competitors within 2km.
    
    7. City Demand Analysis: Identify Top 5 Corporates and Travel Agents.
    
    8. Hard Stops: Flag critical brand misfits or safety issues as AUTO REJECT.
    
    Output exactly in the provided JSON schema. Ensure 'detectedRating' and 'detectedADR' for the target property are included.
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

    // --- MANUALLY NORMALIZE RATINGS (POST-PROCESSING GUARD) ---
    const normalize = (val: number | undefined) => {
      if (val === undefined) return val;
      return val > 5.0 ? val / 2.0 : val;
    };

    if (parsed.executiveSummary) {
      parsed.executiveSummary.detectedRating = normalize(parsed.executiveSummary.detectedRating);
    }

    if (parsed.otaAudit) {
      parsed.otaAudit = parsed.otaAudit.map(item => ({
        ...item,
        rating: normalize(item.rating),
        history: item.history?.map(h => ({ ...h, value: normalize(h.value) || 0 }))
      }));
    }

    if (parsed.competitors) {
      parsed.competitors = parsed.competitors.map(comp => ({
        ...comp,
        rating: normalize(comp.rating) || 0
      }));
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
