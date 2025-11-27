import React, { useEffect, useState } from 'react';
import { LoadingState } from '../types';

interface LoadingScreenProps {
  state: LoadingState;
  ticker: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ state, ticker }) => {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    if (!ticker) return;

    setLogs([]);
    const sequence = [
      { text: `Initializing OmniPulse Protocol...`, delay: 0 },
      { text: `Connecting to Global Data Streams...`, delay: 600 },
      { text: `Accessing Node: ${ticker.toUpperCase()}`, delay: 1200 },
      { text: `Scanning Twitter/X Firehose for Sentiment...`, delay: 2000 },
      { text: `Scraping SEC Filings & Regulatory Docs...`, delay: 2800 },
      { text: `Computing Technical Indicators (RSI/MACD)...`, delay: 3400 },
      { text: `Cross-referencing Macro-Economic Indicators...`, delay: 4000 },
      { text: `Calculating Probability Clouds...`, delay: 4800 },
      { text: `Compiling Alpha Dashboard...`, delay: 5500 },
    ];

    let timeouts: ReturnType<typeof setTimeout>[] = [];

    sequence.forEach(({ text, delay }) => {
      const timeout = setTimeout(() => {
        setLogs(prev => [...prev, `> ${text}`]);
      }, delay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [ticker]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full p-4">
       <div className="relative w-16 h-16 mb-8">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-cyan-500/20 rounded-full animate-pulse"></div>
       </div>
       
       <div className="w-full max-w-md bg-slate-900 rounded p-4 font-mono text-xs md:text-sm text-cyan-500/80 border border-slate-800 shadow-2xl h-64 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-b from-transparent via-transparent to-slate-900 z-10"></div>
            <div className="flex flex-col justify-end h-full gap-1">
                {logs.map((log, i) => (
                    <div key={i} className="animate-fade-in">{log}</div>
                ))}
                <div className="animate-pulse">_</div>
            </div>
       </div>
    </div>
  );
};