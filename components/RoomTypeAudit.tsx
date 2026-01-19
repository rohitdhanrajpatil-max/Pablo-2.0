
import React from 'react';
import { RoomType } from '../types';

interface Props {
  rooms?: RoomType[];
}

const RoomTypeAudit: React.FC<Props> = ({ rooms = [] }) => {
  if (!rooms || rooms.length === 0) {
    return (
      <div className="mt-20">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Room Type Detailed Audit</h3>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
          <div className="max-w-xs mx-auto">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-slate-500 font-bold text-sm">Real-time scan did not identify specific categorized inventory. Standard inventory distribution assumed for market-level benchmarks.</p>
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
            <div className="p-8 pb-4 flex-none">
              <div className="flex justify-between items-start mb-4 gap-4">
                <h4 className="text-xl font-black text-slate-800 leading-tight group-hover:text-[#c54b2a] transition-colors line-clamp-2">
                  {room.name || 'Standard Unit'}
                </h4>
                <div className="bg-orange-50 text-[#c54b2a] px-2.5 py-1 rounded-lg text-[9px] font-black uppercase whitespace-nowrap border border-orange-100 flex-shrink-0">
                  OTA Verified
                </div>
              </div>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-3 min-h-[3rem]">
                {room.description || 'Verified commercial unit category with standard market-specific configurations.'}
              </p>
            </div>

            <div className="px-8 py-6 bg-slate-50/50 flex-grow border-y border-slate-100/50">
              <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Revenue-Drivers / Amenities</h5>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(room.inclusions) && room.inclusions.length > 0 ? (
                  room.inclusions.slice(0, 6).map((inc, i) => (
                    <span key={i} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm">
                      {inc}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 italic">Standard Commercial Package</span>
                )}
                {room.inclusions && room.inclusions.length > 6 && (
                  <span className="text-[10px] font-bold text-[#c54b2a] bg-orange-50 px-2 py-1 rounded-lg">+{room.inclusions.length - 6} more</span>
                )}
              </div>
            </div>

            <div className="p-8 bg-white flex-none">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Live Market ADR</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">{room.price || 'N/A'}</span>
                    <span className="text-[10px] font-bold text-slate-300">/ night</span>
                  </div>
                </div>
                <div className="no-print bg-slate-900 text-white p-3 rounded-2xl group-hover:bg-[#c54b2a] transition-all shadow-lg shadow-slate-200 group-hover:shadow-orange-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomTypeAudit;
