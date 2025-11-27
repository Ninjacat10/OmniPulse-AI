import React from 'react';
import { SentimentData } from '../types';

interface SentimentGaugeProps {
  data: SentimentData;
}

export const SentimentGauge: React.FC<SentimentGaugeProps> = ({ data }) => {
  // Map score 0-100 to rotation -90deg to 90deg
  const rotation = (data.score / 100) * 180 - 90;

  const getColor = (score: number) => {
    if (score < 30) return 'text-pulse-bear';
    if (score > 70) return 'text-pulse-bull';
    return 'text-slate-400';
  };

  const getBarColor = (score: number) => {
      if (score < 30) return 'bg-pulse-bear';
      if (score > 70) return 'bg-pulse-bull';
      return 'bg-slate-400';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 relative">
      {/* Gauge Semi-Circle */}
      <div className="relative w-48 h-24 overflow-hidden mb-4">
        <div className="absolute w-48 h-48 rounded-full border-[12px] border-slate-800 border-b-0 top-0 left-0"></div>
        {/* Gradient Arc overlay */}
        <div 
            className="absolute w-48 h-48 rounded-full border-[12px] border-transparent border-t-pulse-accent top-0 left-0 transition-all duration-1000 ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
        ></div>
        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-24 bg-white origin-bottom transition-transform duration-1000 ease-out z-10 rounded-full"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-200 rounded-full z-20"></div>
      </div>

      <div className="text-center mt-2">
        <div className={`text-4xl font-mono font-bold ${getColor(data.score)}`}>
          {data.score}
        </div>
        <div className="text-sm text-slate-500 uppercase tracking-widest mt-1">{data.label}</div>
      </div>

      {/* Breakdown Bars */}
      <div className="w-full mt-6 space-y-3 font-mono text-xs">
        
        {/* Fear Index */}
        <div className="flex items-center justify-between">
            <span className="text-slate-400">Fear Index</span>
            <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${getBarColor(100 - data.fearGreedIndex)} transition-all duration-1000`} style={{ width: `${100 - data.fearGreedIndex}%` }}></div>
                </div>
                <span className="w-6 text-right text-slate-300">{100 - data.fearGreedIndex}</span>
            </div>
        </div>

        {/* Momentum */}
        <div className="flex items-center justify-between">
            <span className="text-slate-400">Momentum</span>
            <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${getBarColor(data.momentum)} transition-all duration-1000`} style={{ width: `${data.momentum}%` }}></div>
                </div>
                <span className="w-6 text-right text-slate-300">{data.momentum}</span>
            </div>
        </div>

        {/* Retail Hype */}
        <div className="flex items-center justify-between">
            <span className="text-slate-400">Retail Hype</span>
            <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${getBarColor(data.retailHype)} transition-all duration-1000`} style={{ width: `${data.retailHype}%` }}></div>
                </div>
                <span className="w-6 text-right text-slate-300">{data.retailHype}</span>
            </div>
        </div>

        {/* Institutional Tone */}
        <div className="flex items-center justify-between">
            <span className="text-slate-400">Inst. Tone</span>
            <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${getBarColor(data.institutionalTone)} transition-all duration-1000`} style={{ width: `${data.institutionalTone}%` }}></div>
                </div>
                <span className="w-6 text-right text-slate-300">{data.institutionalTone}</span>
            </div>
        </div>

      </div>
    </div>
  );
};