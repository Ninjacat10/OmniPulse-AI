
import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  ComposedChart,
  Line
} from 'recharts';
import { ChartPoint } from '../types';

interface PriceChartProps {
  data: ChartPoint[];
  currentPrice: number;
  supportLevels?: number[];
  resistanceLevels?: number[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isForecast = payload[0]?.payload?.type === 'forecast';
    const point = payload[0].payload;

    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl font-mono text-xs z-50">
        <p className="text-slate-400 mb-2">{label}</p>
        
        {isForecast ? (
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-emerald-400">Bull: ${point.bull?.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span className="text-white font-bold">Base: ${point.base?.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-red-400">Bear: ${point.bear?.toFixed(2)}</span>
                </div>
            </div>
        ) : (
             <p className="text-cyan-400 font-bold text-lg">${point.price?.toFixed(2)}</p>
        )}
      </div>
    );
  }
  return null;
};

export const PriceChart: React.FC<PriceChartProps> = ({ data, currentPrice, supportLevels, resistanceLevels }) => {
  
  // Transform data for the "Probability Cloud"
  // Recharts Stacked Area strategy:
  // Layer 1 (Invisible): 'bear' value.
  // Layer 2 (Visible Cloud): 'spread' value (bull - bear).
  const processedData = data.map(d => {
      if (d.type === 'forecast' && d.bear !== undefined && d.bull !== undefined) {
          return {
              ...d,
              spread: d.bull - d.bear,
              // For the Line components
              lineBear: d.bear,
              lineBase: d.base,
              lineBull: d.bull
          };
      }
      return {
          ...d,
          // History points map to price
          price: d.price
      };
  });

  const allPrices = data.flatMap(d => {
      if (d.type === 'history') return [d.price || 0];
      return [d.bear || 0, d.bull || 0];
  }).filter(p => p > 0);

  const minPrice = Math.min(...allPrices) * 0.95;
  const maxPrice = Math.max(...allPrices) * 1.05;

  return (
    <div className="w-full h-full min-h-[300px] relative group">
      <div className="absolute top-2 left-4 z-10 pointer-events-none">
        <h3 className="text-slate-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
            Price Action <span className="text-slate-600">|</span> Probability Cloud
        </h3>
        <div className="flex gap-3 mt-1 text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-emerald-500"></div>Bull</span>
            <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-cyan-400"></div>Base</span>
            <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-red-500"></div>Bear</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cloudGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#475569" 
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
            tickFormatter={(val) => val.slice(5)} // Show MM-DD
            minTickGap={30}
          />
          <YAxis 
            domain={[minPrice, maxPrice]} 
            orientation="right" 
            stroke="#475569"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
            tickFormatter={(val) => `$${val.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
          
          <ReferenceLine y={currentPrice} stroke="#06b6d4" strokeDasharray="3 3" opacity={0.3} />
          
           {/* Render Support Levels */}
           {supportLevels && supportLevels.map((level, i) => (
             <ReferenceLine key={`sup-${i}`} y={level} stroke="#10b981" strokeDasharray="2 2" opacity={0.2} label={{ position: 'insideLeft', value: 'SUP', fill: '#10b981', fontSize: 8, opacity: 0.5 }} />
          ))}
          
          {/* Render Resistance Levels */}
          {resistanceLevels && resistanceLevels.map((level, i) => (
             <ReferenceLine key={`res-${i}`} y={level} stroke="#ef4444" strokeDasharray="2 2" opacity={0.2} label={{ position: 'insideLeft', value: 'RES', fill: '#ef4444', fontSize: 8, opacity: 0.5 }} />
          ))}

          {/* Historical Data */}
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#06b6d4" 
            strokeWidth={2}
            fill="url(#historyGradient)" 
          />

          {/* Probability Cloud Construction */}
          {/* Invisible base area to push the spread up */}
          <Area 
             type="monotone"
             dataKey="lineBear"
             stackId="1"
             stroke="none"
             fill="none"
             legendType="none"
             tooltipType="none"
             connectNulls
          />
          {/* Visible Cloud (Spread between Bull and Bear) */}
           <Area 
             type="monotone"
             dataKey="spread"
             stackId="1"
             stroke="none"
             fill="url(#cloudGradient)" 
             connectNulls
          />

          {/* Forecast Lines */}
           <Line 
             type="monotone"
             dataKey="lineBull"
             stroke="#10b981"
             strokeWidth={1}
             strokeDasharray="4 4"
             dot={false}
             connectNulls
          />
          <Line 
             type="monotone"
             dataKey="lineBase"
             stroke="#ffffff"
             strokeWidth={2}
             strokeDasharray="4 4"
             dot={{ r: 3, fill: '#fff' }}
             connectNulls
          />
           <Line 
             type="monotone"
             dataKey="lineBear"
             stroke="#ef4444"
             strokeWidth={1}
             strokeDasharray="4 4"
             dot={false}
             connectNulls
          />

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
