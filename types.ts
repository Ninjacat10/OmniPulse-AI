
export interface ChartPoint {
    date: string;
    price?: number; // For historical data
    bear?: number; // Forecast low
    base?: number; // Forecast mid
    bull?: number; // Forecast high
    type: 'history' | 'forecast';
}

export interface PredictionScenario {
    type: 'Bear' | 'Base' | 'Bull';
    priceTarget: number;
    probability: number;
    description: string;
    timeframe: string;
}

export interface SentimentData {
    score: number; // 0-100
    label: string; // e.g. "Extreme Greed"
    retailHype: number; // 0-100
    institutionalTone: number; // 0-100
    fearGreedIndex: number; // 0-100
    momentum: number; // 0-100
}

export interface DeepDiveMetric {
    title: string;
    value: string;
    trend: 'up' | 'down' | 'neutral';
    insight: string;
}

export interface TechnicalIndicator {
    name: string;
    value: string;
    signal: 'bullish' | 'bearish' | 'neutral';
}

export interface TechnicalAnalysis {
    signal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
    summary: string;
    supportLevels: number[];
    resistanceLevels: number[];
    indicators: TechnicalIndicator[];
}

export interface FinancialReport {
    ticker: string;
    name: string;
    currentPrice: number;
    priceChangePercent: number;
    sentiment: SentimentData;
    technicalAnalysis: TechnicalAnalysis;
    whyExplanation: string;
    deepDive: DeepDiveMetric[];
    macroContext: string;
    predictions: PredictionScenario[];
    chartData: ChartPoint[];
    groundingUrls?: string[];
}

export interface AlphaPick {
    ticker: string;
    name: string;
    reason: string;
    conviction: 'High' | 'Medium' | 'Speculative';
    potential: string;
    risk: string;
    catalyst: string;
}

export interface Watchlist {
    id: string;
    name: string;
    assets: string[];
}

export type LoadingState = 'idle' | 'scanning' | 'aggregating' | 'analyzing' | 'rendering' | 'complete' | 'error';
