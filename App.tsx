
import React, { useState, useEffect } from 'react';
import { analyzeAsset } from './services/geminiService';
import { FinancialReport, LoadingState, Watchlist } from './types';
import { Dashboard } from './components/Dashboard';
import { LoadingScreen } from './components/LoadingScreen';
import { WatchlistSidebar } from './components/WatchlistSidebar';
import { AlphaScanner } from './components/AlphaScanner';
import { Terminal, Zap, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Load Watchlists from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('omnipulse_watchlists');
    if (stored) {
      try {
        setWatchlists(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse watchlists", e);
      }
    } else {
        // Default seed data
        setWatchlists([
            { id: '1', name: 'Core Holdings', assets: ['$TSLA', 'BTC/USD', '$NVDA'] },
            { id: '2', name: 'Speculative', assets: ['PEPE', 'MSTR'] }
        ]);
    }
  }, []);

  // Save Watchlists
  useEffect(() => {
    localStorage.setItem('omnipulse_watchlists', JSON.stringify(watchlists));
  }, [watchlists]);

  // Watchlist Actions
  const handleCreateList = (name: string) => {
    const newList: Watchlist = {
      id: Date.now().toString(),
      name,
      assets: []
    };
    setWatchlists([...watchlists, newList]);
  };

  const handleDeleteList = (id: string) => {
    setWatchlists(watchlists.filter(w => w.id !== id));
  };

  const handleAddAsset = (listId: string, asset: string) => {
    setWatchlists(watchlists.map(list => {
      if (list.id === listId && !list.assets.includes(asset)) {
        return { ...list, assets: [...list.assets, asset] };
      }
      return list;
    }));
  };

  const handleRemoveAsset = (listId: string, asset: string) => {
    setWatchlists(watchlists.map(list => {
      if (list.id === listId) {
        return { ...list, assets: list.assets.filter(a => a !== asset) };
      }
      return list;
    }));
  };

  const executeSearch = async (ticker: string) => {
    if (!ticker.trim()) return;
    setQuery(ticker);
    setLoadingState('scanning');
    setError(null);
    setReport(null);

    try {
      const data = await analyzeAsset(ticker);
      setReport(data);
      setLoadingState('complete');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during intelligence gathering.");
      setLoadingState('error');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div className="min-h-screen bg-pulse-bg text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col h-screen overflow-hidden">
      
      {/* Navbar / Header */}
      <nav className="border-b border-pulse-border bg-pulse-bg/80 backdrop-blur-md z-40 shrink-0 relative">
        <div className="w-full px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white transition-colors">
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setReport(null); setLoadingState('idle'); setQuery(''); }}>
                <div className="w-8 h-8 bg-cyan-500 rounded-sm flex items-center justify-center">
                  <Terminal className="text-slate-900" size={18} />
                </div>
                <span className="font-bold text-xl tracking-tight text-white hidden md:inline">
                  OmniPulse <span className="text-cyan-400 font-light">AI</span>
                </span>
              </div>
          </div>
          
          <div className="hidden md:flex items-center text-xs text-slate-500 gap-6 font-mono">
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">LIVE FEED: CONNECTED</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">LATENCY: 12ms</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">NODES: 14.2M</span>
          </div>
        </div>
      </nav>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar */}
        <div className={`${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'} transition-all duration-300 ease-in-out bg-slate-950 border-r border-slate-800 z-30 absolute md:relative h-full flex shrink-0`}>
             <WatchlistSidebar 
                watchlists={watchlists}
                onCreateList={handleCreateList}
                onDeleteList={handleDeleteList}
                onAddAsset={handleAddAsset}
                onRemoveAsset={handleRemoveAsset}
                onSelectAsset={(asset) => {
                    executeSearch(asset);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                onOpenScanner={() => setIsScannerOpen(true)}
                currentTicker={report?.ticker || null}
             />
        </div>

        {/* Scanner Modal */}
        <AlphaScanner 
            isOpen={isScannerOpen} 
            onClose={() => setIsScannerOpen(false)} 
            onSelectAsset={(asset) => {
                executeSearch(asset);
                setIsScannerOpen(false);
            }}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative w-full">
          
          {loadingState === 'idle' && (
            <div className="min-h-full flex flex-col items-center justify-center p-4 animate-fade-in">
              <div className="text-center max-w-2xl space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">
                      Decode the Noise. <br />
                      <span className="text-cyan-400">Predict the Move.</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-light">
                      The Bloomberg Terminal for the AI Era. Real-time sentiment analysis, deep-web scraping, and high-probability predictive modeling.
                    </p>
                  </div>

                  <form onSubmit={handleSearch} className="relative max-w-lg mx-auto w-full group">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="ENTER TICKER OR ASSET (e.g. $TSLA)"
                      className="relative w-full bg-slate-900/90 border border-slate-700 text-center text-white py-4 px-6 rounded-full text-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono placeholder:text-slate-600"
                      autoFocus
                    />
                    <button 
                      type="submit"
                      className="absolute right-2 top-2 bottom-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 p-3 rounded-full transition-colors flex items-center justify-center"
                    >
                      <Zap size={20} fill="currentColor" />
                    </button>
                  </form>

                  <div className="flex justify-center gap-4 text-xs text-slate-600 font-mono">
                    <span>SUGGESTED:</span>
                    <button onClick={() => executeSearch('$NVDA')} className="hover:text-cyan-400 transition-colors underline decoration-dotted">$NVDA</button>
                    <button onClick={() => executeSearch('BTC/USD')} className="hover:text-cyan-400 transition-colors underline decoration-dotted">BTC/USD</button>
                    <button onClick={() => executeSearch('XAU/USD')} className="hover:text-cyan-400 transition-colors underline decoration-dotted">GOLD</button>
                  </div>
              </div>
            </div>
          )}

          {(loadingState === 'scanning' || loadingState === 'aggregating' || loadingState === 'analyzing') && (
            <div className="min-h-full flex items-center justify-center">
                 <LoadingScreen state={loadingState} ticker={query} />
            </div>
          )}

          {loadingState === 'error' && (
            <div className="min-h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-xl max-w-md">
                  <h3 className="text-red-500 font-bold text-xl mb-2">System Failure</h3>
                  <p className="text-red-200 mb-4">{error}</p>
                  <button 
                      onClick={() => setLoadingState('idle')}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-mono text-sm transition-colors"
                  >
                      RESET SYSTEM
                  </button>
              </div>
            </div>
          )}

          {loadingState === 'complete' && report && (
            <Dashboard data={report} />
          )}

        </main>
      </div>
    </div>
  );
};

export default App;
