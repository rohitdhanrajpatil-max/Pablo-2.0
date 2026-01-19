
import React from 'react';
import { CityEntity } from '../types';

interface Props {
  corporates: CityEntity[];
  travelAgents: CityEntity[];
}

const MarketIntelligence: React.FC<Props> = ({ corporates, travelAgents }) => {
  return (
    <div className="mt-20">
      <div className="flex items-center gap-4 mb-10">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">City Demand Intelligence</h3>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Top Corporates */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
          </div>
          <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
            <span className="w-2 h-6 bg-purple-700 rounded-full"></span>
            Top 5 Corporates
          </h4>
          <div className="space-y-4">
            {corporates.map((corp, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-purple-200 transition-colors">
                <span className="font-bold text-slate-700">{corp.name}</span>
                <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">{corp.relevance}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Travel Agents */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>
          </div>
          <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
            <span className="w-2 h-6 bg-emerald-700 rounded-full"></span>
            Top 5 Travel Agents
          </h4>
          <div className="space-y-4">
            {travelAgents.map((agent, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors">
                <span className="font-bold text-slate-700">{agent.name}</span>
                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">{agent.relevance}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligence;
