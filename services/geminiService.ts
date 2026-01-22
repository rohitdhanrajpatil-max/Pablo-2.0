
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
        detectedRating: { type: Type.NUMBER, description: "The primary OTA rating normalized to a 5-point scale for consistency in the executive badge." },
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
      description: "Mandatory evaluation of four channels: MakeMyTrip, Google, Booking.com, and Agoda.",
      items: {
        type: Type.OBJECT,
        properties: {
          channel: { type: Type.STRING, description: "One of: MakeMyTrip, Google, Booking.com, Agoda" },
          status: { type: Type.STRING },
          rating: { type: Type.NUMBER, description: "Scale 10.0 for Booking.com/Agoda, Scale 5.0 for Google/MakeMyTrip." },
          reviewCount: { type: Type.STRING, description: "Formatted string of total reviews found, e.g., '1,245 reviews'." },
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
    Conduct a deep-dive commercial evaluation of: ${input.hotelName} in ${input.city}.
    
    1. MANDATORY OTA AUDIT: You MUST evaluate exactly these four channels:
       - MakeMyTrip (Scale 5.0)
       - Google (Scale 5.0)
       - Booking.com (Scale 10.0)
       - Agoda (Scale 10.0)
       For each, search and extract the actual rating and total review count.
    
    2. DATA GROUNDING: 
       - Strictly verify the property location in ${input.city}.
       - Identify room configurations and current ADR from OTA listings.
       - Analyze competition in the immediate 2km micro-market.
       - Identify specific local demand drivers (Top 5 Corporates & Travel Agents in ${input.city}).
    
    3. BRAND FIT: Assess if the property matches Treebo standards (maintenance, inventory size, professionalism).
    
    Output results strictly in the provided JSON schema. Ensure historical trends in the OTA audit reflect the found search data where possible.
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
