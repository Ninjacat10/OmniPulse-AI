import React from 'react';
import { FinancialReport } from '../types';
import { SentimentGauge } from './SentimentGauge';
import { PriceChart } from './PriceChart';
import { TechnicalAnalysis } from './TechnicalAnalysis';
import { ArrowUpRight, ArrowDownRight, Activity, Globe, Zap, Database, TrendingUp, AlertTriangle, ExternalLink, Crosshair } from 'lucide-react';

interface DashboardProps {
  data: FinancialReport;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const isPositive = data.priceChangePercent >= 0;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in pb-20">
      
      {/* Header Info */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">{data.ticker}</h1>
             <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded font-mono uppercase">{data.name}</span>
          </div>
          <div className="flex items-center gap-4 mt-2 font-mono">
            <span className="text-3xl text-slate-200">${data.currentPrice.toLocaleString()}</span>
            <span className={`flex items-center text-lg ${isPositive ? 'text-pulse-bull' : 'text-pulse-bear'}`}>
              {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
              {Math.abs(data.priceChangePercent).toFixed(2)}%
            </span>
          </div>
        </div>
        
        {/* Grounding Sources */}
        {data.groundingUrls && data.groundingUrls.length > 0 && (
            <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Live Intelligence Sources</span>
                <div className="flex gap-2">
                    {data.groundingUrls.slice(0, 3).map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-900 border border-slate-800 hover:border-pulse-accent hover:text-pulse-accent text-slate-400 rounded transition-colors" title={url}>
                            <ExternalLink size={12} />
                        </a>
                    ))}
                </div>
            </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: VISUALS */}
        <div className="lg:col-span-8 space-y-6">
            {/* Chart Area */}
            <div className="bg-pulse-card border border-pulse-border rounded-xl p-4 md:p-6 h-[400px] shadow-2xl overflow-hidden relative">
                <PriceChart 
                    data={data.chartData} 
                    currentPrice={data.currentPrice} 
                    supportLevels={data.technicalAnalysis?.supportLevels}
                    resistanceLevels={data.technicalAnalysis?.resistanceLevels}
                />
            </div>

            {/* The "Why" Engine */}
            <div className="bg-pulse-card border border-pulse-border rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-pulse-accent"></div>
                <div className="flex items-start gap-3 mb-3">
                    <Zap className="text-pulse-accent mt-1" size={20} />
                    <h2 className="text-lg font-bold text-white uppercase tracking-wide">The Why Engine</h2>
                </div>
                <p className="text-slate-300 leading-relaxed font-mono text-sm md:text-base">
                    <span className="text-pulse-accent font-bold">Analysis: </span>
                    {data.whyExplanation}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <Activity size={12} />
                    <span>AI-Generated Insight based on real-time correlation of news & sentiment.</span>
                </div>
            </div>

            {/* Prediction Scenarios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.predictions.map((pred) => (
                    <div key={pred.type} className={`border rounded-xl p-4 transition-all duration-300 hover:scale-105 ${
                        pred.type === 'Bear' ? 'bg-slate-900/50 border-red-900/30 hover:border-red-500/50' :
                        pred.type === 'Bull' ? 'bg-slate-900/50 border-emerald-900/30 hover:border-emerald-500/50' :
                        'bg-slate-900/50 border-slate-800 hover:border-slate-500'
                    }`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs font-bold uppercase tracking-widest ${
                                pred.type === 'Bear' ? 'text-red-400' :
                                pred.type === 'Bull' ? 'text-emerald-400' :
                                'text-slate-400'
                            }`}>{pred.type} Case</span>
                            <span className="text-xs bg-slate-950 px-2 py-0.5 rounded text-slate-500 font-mono">{pred.probability}% Prob</span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-white mb-2">${pred.priceTarget.toLocaleString()}</div>
                        <p className="text-xs text-slate-400 leading-relaxed min-h-[60px]">{pred.description}</p>
                        <div className="mt-2 text-[10px] text-slate-600 font-mono text-right">{pred.timeframe} Target</div>
                    </div>
                ))}
            </div>
        </div>

        {/* RIGHT COLUMN: METRICS */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* Sentiment Speedometer */}
            <div className="bg-pulse-card border border-pulse-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={16} /> Sentiment Speedometer
                    </h3>
                </div>
                <SentimentGauge data={data.sentiment} />
            </div>

            {/* Technical Analysis */}
            {data.technicalAnalysis && (
                <div className="bg-pulse-card border border-pulse-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Crosshair size={16} /> Technical Radar
                        </h3>
                    </div>
                    <TechnicalAnalysis data={data.technicalAnalysis} />
                </div>
            )}

            {/* Deep Dive Data */}
            <div className="bg-pulse-card border border-pulse-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Database size={16} /> Deep Dive Scraper
                    </h3>
                </div>
                <div className="space-y-4">
                    {data.deepDive.map((metric, idx) => (
                        <div key={idx} className="group cursor-default">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-slate-400 font-mono uppercase">{metric.title}</span>
                                <span className={`text-sm font-bold font-mono ${
                                    metric.trend === 'up' ? 'text-emerald-400' : 
                                    metric.trend === 'down' ? 'text-red-400' : 'text-slate-200'
                                }`}>
                                    {metric.value}
                                </span>
                            </div>
                            <div className="text-[11px] text-slate-500 border-l-2 border-slate-700 pl-2 group-hover:border-pulse-accent transition-colors">
                                {metric.insight}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Macro Context */}
             <div className="bg-pulse-card border border-pulse-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Globe size={16} /> Macro Correlation
                    </h3>
                </div>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-mono">
                    {data.macroContext}
                </p>
                <div className="mt-4 flex items-center gap-2 p-2 bg-yellow-900/10 border border-yellow-900/30 rounded">
                    <AlertTriangle size={14} className="text-yellow-500" />
                    <span className="text-[10px] text-yellow-500/80">Macro environment high volatility alert</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};