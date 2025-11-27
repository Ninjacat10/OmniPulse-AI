
import { GoogleGenAI } from "@google/genai";
import { FinancialReport, AlphaPick } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean JSON from markdown fences
const cleanJson = (text: string): string => {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
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
    
    Return the result as a JSON array of objects. No markdown.
    
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
        
        const jsonString = cleanJson(text);
        return JSON.parse(jsonString) as AlphaPick[];

    } catch (error) {
        console.error("Market Scan Failed:", error);
        throw new Error("Scan failed.");
    }
}
