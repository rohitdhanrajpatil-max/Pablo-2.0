
import React from 'react';
import { RoomType } from '../types';

interface Props {
  rooms?: RoomType[];
}

const RoomTypeAudit: React.FC<Props> = ({ rooms = [] }) => {
  if (!rooms || rooms.length === 0) {
    return (
      <div className="mt-20 no-print">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Room Type Detailed Audit</h3>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center">
          <p className="text-slate-400 font-bold">No specific room configurations were found during the real-time OTA scan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20">
      <div className="flex items-center gap-4 mb-10">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Room Type Detailed Audit</h3>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room, idx) => (
          <div key={idx} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col group hover:border-[#c54b2a] transition-all break-inside-avoid">
            <div className="p-8 pb-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-black text-slate-800 leading-tight group-hover:text-[#c54b2a] transition-colors">
                  {room.name || 'Standard Room'}
                </h4>
                <div className="bg-orange-50 text-[#c54b2a] px-3 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap">
                  LIVE OTA DATA
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium line-clamp-2">
                {room.description || 'No description available for this category.'}
              </p>
            </div>

            <div className="px-8 py-6 bg-slate-50/50 flex-1 border-y border-slate-100">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Key Inclusions</h5>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(room.inclusions) && room.inclusions.length > 0 ? (
                  room.inclusions.map((inc, i) => (
                    <span key={i} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md">
                      {inc}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">Standard Amenities</span>
                )}
              </div>
            </div>

            <div className="p-8 bg-white mt-auto">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Live ADR</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">{room.price || 'N/A'}</span>
                </div>
                <div className="no-print bg-[#3e1d15] text-white p-3 rounded-xl group-hover:bg-[#c54b2a] transition-all">
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
