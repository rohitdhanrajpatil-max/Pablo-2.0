
import React from 'react';
import { OTAAuditItem } from '../types';

interface Props {
  audit: OTAAuditItem[];
}

const RatingTrendChart: React.FC<{ history: { label: string; value: number }[], maxScale: number }> = ({ history, maxScale }) => {
  if (!history || history.length < 2) return null;

  const width = 200;
  const height = 40;
  const maxRating = maxScale; 
  const minRating = 0;

  // Calculate points
  const points = history.map((h, i) => {
    const x = (i / (history.length - 1)) * width;
    const y = height - ((h.value - minRating) / (maxRating - minRating)) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="mt-4 mb-6 chart-wrapper">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trend (0-{maxScale})</span>
        <span className="text-[8px] font-bold text-slate-300">Historical</span>
      </div>
      <div className="relative h-12 w-full bg-slate-50 rounded-lg overflow-hidden border border-slate-100 p-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <polyline points={areaPoints} fill="url(#gradient)" opacity="0.2" />
          <polyline points={points} fill="none" stroke="#c54b2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#c54b2a" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex justify-between mt-1 px-0.5">
        {history.map((h, i) => (
          <span key={i} className="text-[7px] font-black text-slate-400 uppercase">{h.label}</span>
        ))}
      </div>
    </div>
  );
};

const OTACard: React.FC<{ item: OTAAuditItem }> = ({ item }) => {
  const isTenScale = ['booking.com', 'agoda'].includes(item.channel.toLowerCase());
  const maxScale = isTenScale ? 10 : 5;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'FAIL': return 'bg-red-50 text-red-600 border-red-200';
      case 'WARNING': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'PASS': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow break-inside-avoid ota-card">
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0">
          <h4 className="text-xl font-black text-slate-800 tracking-tight truncate mb-1">{item.channel}</h4>
          <div className="flex flex-col">
             {item.rating !== undefined && (
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-slate-900">{item.rating.toFixed(1)}</span>
                <span className="text-[10px] font-bold text-slate-300">/ {maxScale}.0</span>
              </div>
            )}
            {item.reviewCount && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.reviewCount}</span>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border flex-shrink-0 ${getStatusStyle(item.status)}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'FAIL' ? 'bg-red-500' : item.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
          <span className="text-[9px] font-black uppercase tracking-widest">{item.status}</span>
        </div>
      </div>

      {item.history && <RatingTrendChart history={item.history} maxScale={maxScale} />}

      <div className="flex-1 space-y-5 mt-2 overflow-hidden">
        <section>
          <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5">Blockers</h5>
          <ul className="space-y-2">
            {item.blockers.slice(0, 3).map((blocker, idx) => (
              <li key={idx} className="flex gap-2 items-start">
                <span className="text-red-400 text-xs flex-shrink-0 mt-0.5">•</span>
                <span className="text-[10px] font-bold text-slate-600 leading-snug line-clamp-2">{blocker}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5">Recovery</h5>
          <ul className="space-y-2">
            {item.recoveryPlan.slice(0, 2).map((step, idx) => (
              <li key={idx} className="flex gap-2 items-start">
                <span className="text-emerald-500 text-[9px] flex-shrink-0 mt-0.5 font-bold">✔</span>
                <span className="text-[10px] font-bold text-slate-700 leading-snug italic line-clamp-2">{step}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

const OTAPerformanceAudit: React.FC<Props> = ({ audit }) => {
  return (
    <div className="mt-16 break-before-page section-ota-audit">
      <div className="flex items-center gap-4 mb-10">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Channel Performance Audit</h3>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 ota-grid">
        {audit.map((item, idx) => (
          <OTACard key={idx} item={item} />
        ))}
      </div>
    </div>
  );
};

export default OTAPerformanceAudit;
