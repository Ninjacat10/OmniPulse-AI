import React from 'react';
import { TechnicalAnalysis as TechnicalAnalysisType } from '../types';
import { Crosshair, ArrowUp, ArrowDown, Minus, Target } from 'lucide-react';

interface TechnicalAnalysisProps {
  data: TechnicalAnalysisType;
}

export const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ data }) => {
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'strong_buy': return 'text-emerald-400 bg-emerald-950/30 border-emerald-900';
      case 'buy': return 'text-emerald-400/80 bg-emerald-950/20 border-emerald-900';
      case 'strong_sell': return 'text-red-500 bg-red-950/30 border-red-900';
      case 'sell': return 'text-red-400 bg-red-950/20 border-red-900';
      default: return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  const getSignalText = (signal: string) => {
    return signal.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="space-y-4">
      
      {/* Main Signal Banner */}
      <div className={`flex items-center justify-between p-4 rounded-lg border ${getSignalColor(data.signal)}`}>
        <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest opacity-70">Technical Consensus</span>
            <span className="text-xl font-bold font-mono tracking-tight">{getSignalText(data.signal)}</span>
        </div>
        <Target size={24} className="opacity-80" />
      </div>

      <p className="text-xs text-slate-400 leading-relaxed font-mono">
        {data.summary}
      </p>

      {/* Levels */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
            <span className="text-[10px] text-emerald-500 uppercase tracking-widest block mb-1">Support</span>
            {data.supportLevels.map((level, i) => (
                <div key={i} className="text-sm font-mono text-slate-300 border-b border-slate-800 last:border-0 py-1">
                    ${level.toLocaleString()}
                </div>
            ))}
        </div>
        <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
            <span className="text-[10px] text-red-500 uppercase tracking-widest block mb-1">Resistance</span>
            {data.resistanceLevels.map((level, i) => (
                <div key={i} className="text-sm font-mono text-slate-300 border-b border-slate-800 last:border-0 py-1">
                    ${level.toLocaleString()}
                </div>
            ))}
        </div>
      </div>

      {/* Indicators List */}
      <div className="space-y-2">
        {data.indicators.map((indicator, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/30 rounded border border-slate-800/50">
                <span className="text-xs text-slate-400 font-mono">{indicator.name}</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{indicator.value}</span>
                    {indicator.signal === 'bullish' && <ArrowUp size={12} className="text-emerald-500" />}
                    {indicator.signal === 'bearish' && <ArrowDown size={12} className="text-red-500" />}
                    {indicator.signal === 'neutral' && <Minus size={12} className="text-slate-500" />}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};