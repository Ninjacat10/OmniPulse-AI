
import React, { useEffect, useState } from 'react';
import { AlphaPick } from '../types';
import { scanMarket } from '../services/geminiService';
import { AlertTriangle, TrendingUp, ShieldAlert, Zap, X, Loader } from 'lucide-react';

interface AlphaScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAsset: (ticker: string) => void;
}

export const AlphaScanner: React.FC<AlphaScannerProps> = ({ isOpen, onClose, onSelectAsset }) => {
    const [picks, setPicks] = useState<AlphaPick[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && picks.length === 0) {
            handleScan();
        }
    }, [isOpen]);

    const handleScan = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await scanMarket();
            setPicks(data);
        } catch (e) {
            setError("Failed to scan market. Access denied or nodes busy.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Zap className="text-cyan-400" /> 
                            OmniPulse <span className="text-cyan-400 font-light">Scanner</span>
                        </h2>
                        <p className="text-slate-400 text-sm font-mono mt-1">
                            Detecting asymmetric opportunities via insider/gov/technical signals.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 relative min-h-[300px]">
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/80 z-10">
                            <Loader className="animate-spin text-cyan-500" size={40} />
                            <div className="font-mono text-cyan-500 text-sm animate-pulse">
                                Scanning Global Indices...
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-center text-red-400 font-mono mt-10">
                            <AlertTriangle className="mx-auto mb-2" />
                            {error}
                            <button onClick={handleScan} className="block mx-auto mt-4 text-sm underline hover:text-red-300">Retry Scan</button>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {picks.map((pick, idx) => (
                                <div key={idx} className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-5 group transition-all duration-300 hover:shadow-lg hover:shadow-cyan-900/20 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{pick.ticker}</h3>
                                                <span className="text-xs text-slate-500 font-mono uppercase">{pick.name}</span>
                                            </div>
                                            <span className={`text-[10px] px-2 py-1 rounded font-mono uppercase font-bold ${
                                                pick.conviction === 'High' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                                                pick.conviction === 'Medium' ? 'bg-yellow-950 text-yellow-400 border border-yellow-900' :
                                                'bg-purple-950 text-purple-400 border border-purple-900'
                                            }`}>
                                                {pick.conviction} Conviction
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-3 mb-4">
                                            <p className="text-sm text-slate-300 leading-snug">
                                                {pick.reason}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                                                <Zap size={12} className="text-yellow-500" />
                                                Catalyst: {pick.catalyst}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-3 border-t border-slate-800">
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-slate-500 flex items-center gap-1"><TrendingUp size={12}/> Pot.</span>
                                            <span className="text-emerald-400">{pick.potential}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-slate-500 flex items-center gap-1"><ShieldAlert size={12}/> Risk</span>
                                            <span className="text-red-400">{pick.risk}</span>
                                        </div>
                                        <button 
                                            onClick={() => { onClose(); onSelectAsset(pick.ticker); }}
                                            className="w-full mt-2 bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                                        >
                                            Analyze Asset
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
                    <span className="text-[10px] text-slate-600 font-mono">
                        AI GENERATED • NOT FINANCIAL ADVICE • DATA LATENCY 5-15s
                    </span>
                    <button onClick={handleScan} className="text-xs text-cyan-500 hover:text-cyan-300 font-mono underline decoration-dotted">
                        REFRESH SCAN
                    </button>
                </div>
            </div>
        </div>
    );
};
