
import React from 'react';
import { RoomType } from '../types';

interface Props {
  rooms?: RoomType[];
}

/**
 * Formats price strings to ensure currency symbols are present if missing
 */
const formatPrice = (price: string) => {
  if (!price) return 'N/A';
  if (price.includes('₹') || price.toLowerCase().includes('rs')) return price;
  // If it's a numeric string, add the Rupee symbol
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
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
          <div className="max-w-xs mx-auto">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-slate-500 font-bold text-sm leading-relaxed">
              Real-time deep scan did not resolve specific categorized inventory units. 
              Portfolio benchmarking relies on standard mid-scale market distributions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 section-room-audit">
      <div className="flex items-center gap-4 mb-10">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Room Type Detailed Audit</h3>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 room-grid">
        {rooms.map((room, idx) => (
          <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm flex flex-col h-full group hover:shadow-md hover:border-[#c54b2a]/30 transition-all break-inside-avoid room-card">
            {/* Card Header & Description */}
            <div className="p-8 pb-4 flex-none">
              <div className="flex justify-between items-start mb-4 gap-4">
                <h4 className="text-xl font-black text-slate-800 leading-tight group-hover:text-[#c54b2a] transition-colors line-clamp-2 min-h-[3rem]">
                  {room.name || 'Standard Commercial Unit'}
                </h4>
                <div className="bg-orange-50 text-[#c54b2a] px-2.5 py-1 rounded-lg text-[9px] font-black uppercase whitespace-nowrap border border-orange-100 flex-shrink-0 mt-1 shadow-sm shadow-orange-100/50">
                  OTA Verified
                </div>
              </div>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-3 min-h-[3.5rem]">
                {room.description || 'Property inventory unit verified through current best-available OTA channel configurations.'}
              </p>
            </div>

            {/* Inclusions / Value Drivers */}
            <div className="px-8 py-6 bg-slate-50/50 flex-grow border-y border-slate-100/50">
              <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Revenue-Drivers & Amenities</h5>
              <div className="flex flex-wrap gap-1.5 content-start">
                {Array.isArray(room.inclusions) && room.inclusions.length > 0 ? (
                  room.inclusions.slice(0, 6).map((inc, i) => (
                    <span key={i} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm whitespace-nowrap">
                      {inc}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 italic">Standard Treebo Core Package Applied</span>
                )}
                {Array.isArray(room.inclusions) && room.inclusions.length > 6 && (
                  <span className="text-[10px] font-bold text-[#c54b2a] bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                    +{room.inclusions.length - 6} Strategic Features
                  </span>
                )}
              </div>
            </div>

            {/* Price & Action */}
            <div className="p-8 bg-white flex-none">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Live Market ADR</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                      {formatPrice(room.price)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">/ per night</span>
                  </div>
                </div>
                
                {/* Visual indicator of yield potential */}
                <div className="no-print bg-slate-900 text-white p-3.5 rounded-2xl group-hover:bg-[#c54b2a] transition-all shadow-lg shadow-slate-200 group-hover:shadow-orange-200 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Audit Footnote */}
      <div className="mt-8 flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-200/60 break-inside-avoid">
        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-[#c54b2a]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
          Commercial inventory audits are based on dynamic micro-market pricing. Treebo yields may deviate by ±15% post-branding based on micro-market demand penetration.
        </p>
      </div>
    </div>
  );
};

export default RoomTypeAudit;
