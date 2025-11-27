
import React, { useState } from 'react';
import { Watchlist } from '../types';
import { Plus, Trash2, List, X, Play, Scan } from 'lucide-react';

interface WatchlistSidebarProps {
  watchlists: Watchlist[];
  onCreateList: (name: string) => void;
  onDeleteList: (id: string) => void;
  onAddAsset: (listId: string, asset: string) => void;
  onRemoveAsset: (listId: string, asset: string) => void;
  onSelectAsset: (asset: string) => void;
  onOpenScanner: () => void;
  currentTicker: string | null;
}

export const WatchlistSidebar: React.FC<WatchlistSidebarProps> = ({
  watchlists,
  onCreateList,
  onDeleteList,
  onAddAsset,
  onRemoveAsset,
  onSelectAsset,
  onOpenScanner,
  currentTicker,
}) => {
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      onCreateList(newListName.trim());
      setNewListName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 border-r border-slate-800 overflow-hidden">
      <div className="p-4 space-y-4 border-b border-slate-800">
        
        {/* Scanner Button */}
        <button 
            onClick={onOpenScanner}
            className="w-full flex items-center justify-between px-3 py-3 bg-gradient-to-r from-cyan-900/20 to-slate-900 border border-cyan-900/50 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] rounded text-cyan-400 hover:text-cyan-300 transition-all group"
        >
            <div className="flex items-center gap-2">
                <Scan size={18} className="text-cyan-500" />
                <div className="flex flex-col items-start">
                    <span className="text-xs font-bold font-mono tracking-wider">MARKET SCANNER</span>
                    <span className="text-[9px] text-cyan-500/60 font-mono">FIND ALPHA PICKS</span>
                </div>
            </div>
            <Play size={10} className="fill-current opacity-50 group-hover:opacity-100" />
        </button>

        <div className="h-px bg-slate-800 w-full"></div>

        <h2 className="text-slate-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
          <List size={14} /> Intelligence Watchlists
        </h2>
        
        {!isCreating ? (
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-white text-xs py-2 rounded border border-slate-800 hover:border-slate-600 transition-all font-mono"
          >
            <Plus size={14} /> NEW LIST
          </button>
        ) : (
          <form onSubmit={handleCreate} className="flex gap-2">
            <input 
              type="text" 
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="LIST NAME..."
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2 py-1 rounded focus:border-cyan-500 outline-none font-mono"
              autoFocus
            />
            <button type="submit" className="text-cyan-500 hover:text-cyan-400">
              <Plus size={16} />
            </button>
            <button type="button" onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-slate-400">
              <X size={16} />
            </button>
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {watchlists.length === 0 && (
            <div className="text-center p-4 text-slate-600 text-xs font-mono">
                No active watchlists.
            </div>
        )}
        
        {watchlists.map(list => (
          <div key={list.id} className="bg-slate-900/50 rounded border border-slate-800/50 overflow-hidden group">
            <div className="flex items-center justify-between p-2 bg-slate-900 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 font-mono pl-1">{list.name}</span>
              <button 
                onClick={() => onDeleteList(list.id)}
                className="text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={12} />
              </button>
            </div>
            
            <div className="p-1 space-y-1">
              {list.assets.map(asset => (
                <div key={asset} className="flex items-center justify-between group/asset p-1.5 hover:bg-slate-800 rounded cursor-pointer">
                  <span 
                    onClick={() => onSelectAsset(asset)}
                    className="text-xs text-slate-400 group-hover/asset:text-cyan-400 font-mono flex-1 flex items-center gap-2"
                  >
                    <Play size={8} className="fill-current opacity-0 group-hover/asset:opacity-100" />
                    {asset}
                  </span>
                  <button 
                    onClick={() => onRemoveAsset(list.id, asset)}
                    className="text-slate-700 hover:text-red-400 opacity-0 group-hover/asset:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {list.assets.length === 0 && (
                 <div className="text-[10px] text-slate-700 p-2 text-center font-mono">Empty List</div>
              )}
            </div>
            
            {currentTicker && !list.assets.includes(currentTicker) && (
                <button 
                    onClick={() => onAddAsset(list.id, currentTicker)}
                    className="w-full text-[10px] text-slate-500 hover:text-cyan-400 hover:bg-slate-800 py-1 border-t border-slate-800 font-mono transition-colors"
                >
                    + ADD {currentTicker}
                </button>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-slate-800 text-[10px] text-slate-600 font-mono text-center">
         SECURE STORAGE: LOCAL
      </div>
    </div>
  );
};
