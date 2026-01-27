
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
        detectedRating: { type: Type.NUMBER },
        detectedADR: { type: Type.STRING }
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
          channel: { type: Type.STRING },
          status: { type: Type.STRING },
          rating: { type: Type.NUMBER },
          maxScale: { type: Type.NUMBER, description: "Usually 5 or 10 depending on how the rating is displayed on that platform." },
          reviewCount: { type: Type.STRING },
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
        required: ["channel", "status", "rating", "maxScale", "reviewCount", "blockers", "recoveryPlan"]
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
    Conduct a deep-dive commercial evaluation of: ${input.hotelName} in ${input.city}.
    
    CRITICAL: For the OTA Audit, evaluate exactly these four: MakeMyTrip, Google, Booking.com, and Agoda.
    For Agoda specifically, verify if the rating is out of 10.0 or 5.0 in the local market and set 'maxScale' accordingly.
    
    DATA GROUNDING: 
    - Verify property location and branding status.
    - Extract live ADR and room configurations.
    - Analyze the 2km micro-market competition.
    - Identify top local demand drivers.
    
    Ensure the output strictly follows the schema.
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
      parsed.groundingSources = chunks
        .filter((c: any) => c.web)
        .map((c: any) => ({
          title: c.web.title || 'Source',
          uri: c.web.uri
        }));
    }

    return parsed;
  } catch (error) {
    console.error("Gemini Evaluation Error:", error);
    throw error;
  }
}
