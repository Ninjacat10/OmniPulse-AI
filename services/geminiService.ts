
import { GoogleGenAI } from "@google/genai";
import { FinancialReport, AlphaPick } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean JSON from markdown fences and conversational text
const cleanJson = (text: string): string => {
    // First, remove markdown code blocks
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Find the first occurrence of '{' or '['
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    
    let start = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
        start = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
        start = firstBrace;
    } else if (firstBracket !== -1) {
        start = firstBracket;
    }
    
    if (start === -1) return cleaned;
    
    // Find the last occurrence of '}' or ']'
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    
    const end = Math.max(lastBrace, lastBracket);
    
    if (end !== -1 && end > start) {
        return cleaned.substring(start, end + 1);
    }
    
    return cleaned;
};

export const analyzeAsset = async (query: string): Promise<FinancialReport> => {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
    You are OmniPulse AI, an advanced financial intelligence engine. 
    Perform a deep-dive analysis on the asset: "${query}".
    
    Use Google Search to find the latest REAL-TIME price, news, sentiment, macro data, and technical analysis reports.
    
    CRITICAL: You MUST return the result as valid JSON. Do not include any conversational text outside the JSON object.
    
    The JSON must match this structure exactly:
    {
      "ticker": "string (e.g., TSLA)",
      "name": "string (Asset Name)",
      "currentPrice": number,
      "priceChangePercent": number (24h change),
      "sentiment": {
        "score": number (0-100, where 0 is extreme fear, 100 is extreme greed),
        "label": "string (e.g., Neutral, Greed)",
        "retailHype": number (0-100),
        "institutionalTone": number (0-100),
        "fearGreedIndex": number (0-100),
        "momentum": number (0-100, combined velocity of price action and social volume)
      },
      "technicalAnalysis": {
        "signal": "string ('strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell')",
        "summary": "string (One sentence technical summary)",
        "supportLevels": [number, number],
        "resistanceLevels": [number, number],
        "indicators": [
          {
            "name": "string (e.g. 'RSI 14')",
            "value": "string (e.g. '58')",
            "signal": "string ('bullish' | 'bearish' | 'neutral')"
          },
          {
            "name": "string (e.g. 'MACD')",
            "value": "string (e.g. 'Crossover')",
            "signal": "string ('bullish' | 'bearish' | 'neutral')"
          },
          {
            "name": "string (e.g. '200 SMA')",
            "value": "string (e.g. 'Price Above')",
            "signal": "string ('bullish' | 'bearish' | 'neutral')"
          }
        ]
      },
      "whyExplanation": "string (A concise, high-level summary of why the price is moving the way it is right now. Mention specific news or catalysts found in search.)",
      "deepDive": [
        {
          "title": "string (e.g., Insider Activity, Job Postings, Web Traffic)",
          "value": "string (e.g., 'Selling', '+15% MoM')",
          "trend": "string ('up' | 'down' | 'neutral')",
          "insight": "string (Brief implication)"
        }
        // ... provide 3 distinct metrics
      ],
      "macroContext": "string (How this asset relates to current CPI, Inflation, or Interest Rates)",
      "predictions": [
        {
          "type": "Bear",
          "priceTarget": number,
          "probability": number (percentage 0-100),
          "description": "string (The bear case scenario)",
          "timeframe": "7 Days"
        },
        {
          "type": "Base",
          "priceTarget": number,
          "probability": number,
          "description": "string (The most likely scenario)",
          "timeframe": "7 Days"
        },
        {
          "type": "Bull",
          "priceTarget": number,
          "probability": number,
          "description": "string (The breakout scenario)",
          "timeframe": "7 Days"
        }
      ],
      "chartData": [
        // Generate an array of objects representing the last 14 days of price action (approximated/simulated based on real trend) + the next 3 days of PREDICTED data.
        // For history points: { "date": "MM-DD", "price": number, "type": "history" }
        // For forecast points: { "date": "MM-DD", "bear": number, "base": number, "bull": number, "type": "forecast" }
        // IMPORTANT: The first forecast point should align with the last history point or current price to ensure line continuity.
        // The "bear", "base", and "bull" values should fan out over the forecast days.
      ]
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");

        // Extract grounding URLs if available
        const groundingUrls: string[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
            chunks.forEach(chunk => {
                if (chunk.web?.uri) {
                    groundingUrls.push(chunk.web.uri);
                }
            });
        }

        const jsonString = cleanJson(text);
        const data = JSON.parse(jsonString) as FinancialReport;
        
        // Attach grounding URLs to the data object
        data.groundingUrls = Array.from(new Set(groundingUrls)).slice(0, 5);

        return data;
    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        throw new Error("Failed to decode the noise. Please try again.");
    }
};

export const scanMarket = async (): Promise<AlphaPick[]> => {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
    You are OmniPulse AI. Scan the current global market conditions to identify 3-5 high-conviction asymmetric trading opportunities.
    
    Look for assets (Stocks, Crypto, Forex) that show strong signals based on:
    1. Insider Buying / Whale Accumulation
    2. Government Contracts / Regulatory shifts
    3. Technical Breakouts
    4. Neglected/Undervalued status with upcoming catalysts
    
    CRITICAL: Return the result as a strictly valid JSON ARRAY of objects. 
    DO NOT output any conversational text, markdown formatting, or explanations outside the JSON array.
    
    Structure:
    [
      {
        "ticker": "string",
        "name": "string",
        "reason": "string (Why is this a pick? Max 20 words)",
        "conviction": "High" | "Medium" | "Speculative",
        "potential": "string (e.g. '+20% Short Term')",
        "risk": "string (e.g. 'Earnings Volatility')",
        "catalyst": "string (e.g. 'FDA Approval next week')"
      }
    ]
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        
        console.log("Raw Scan Response:", text); // Debugging
        const jsonString = cleanJson(text);
        return JSON.parse(jsonString) as AlphaPick[];

    } catch (error) {
        console.error("Market Scan Failed:", error);
        throw new Error("Scan failed. The AI response was not in the expected format.");
    }
}
