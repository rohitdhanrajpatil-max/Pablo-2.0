
import React from 'react';
import { RoomType } from '../types';

interface Props {
  rooms?: RoomType[];
}

const formatPrice = (price: string) => {
  if (!price) return 'N/A';
  if (price.includes('₹') || price.toLowerCase().includes('rs')) return price;
  if (/^\d+([,.]\d+)?$/.test(price.replace(/,/g, ''))) {
    return `₹${price}`;
  }
  return price;
};

const RoomTypeAudit: React.FC<Props> = ({ rooms = [] }) => {
  if (!rooms || rooms.length === 0) {
    return (
      <div className="mt-20 break-inside-avoid">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Inventory Configuration Audit</h3>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center text-slate-500 font-bold text-sm">
          No inventory scan results found for this property. Market averages applied for benchmarking.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 section-room-audit">
      <div className="flex items-center gap-4 mb-10">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Inventory Detailed Audit</h3>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 room-grid">
        {rooms.map((room, idx) => (
          <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm flex flex-col h-full group hover:shadow-md hover:border-indigo-600/30 transition-all break-inside-avoid room-card">
            <div className="p-8 pb-4 flex-none">
              <div className="flex justify-between items-start mb-4 gap-4">
                <h4 className="text-xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3rem]">
                  {room.name || 'Commercial Unit'}
                </h4>
                <div className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase whitespace-nowrap border border-indigo-100 flex-shrink-0 mt-1 shadow-sm">
                  Verified
                </div>
              </div>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-3 min-h-[3.5rem]">
                {room.description || 'Inventory unit verified through current micro-market data channels.'}
              </p>
            </div>

            <div className="px-8 py-6 bg-slate-50/50 flex-grow border-y border-slate-100/50">
              <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Value Drivers</h5>
              <div className="flex flex-wrap gap-1.5 content-start">
                {Array.isArray(room.inclusions) && room.inclusions.length > 0 ? (
                  room.inclusions.slice(0, 6).map((inc, i) => (
                    <span key={i} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm">
                      {inc}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 italic">Standard market amenities.</span>
                )}
              </div>
            </div>

            <div className="p-8 bg-white flex-none">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Market ADR</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                      {formatPrice(room.price)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">/ night</span>
                  </div>
                </div>
                
                <div className="no-print bg-slate-900 text-white p-3.5 rounded-2xl group-hover:bg-indigo-600 transition-all shadow-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200/60 break-inside-avoid">
        <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
          Market audits are based on dynamic micro-market pricing. Yields may deviate by ±15% post-implementation based on micro-market demand penetration.
        </p>
      </div>
    </div>
  );
};

export default RoomTypeAudit;
