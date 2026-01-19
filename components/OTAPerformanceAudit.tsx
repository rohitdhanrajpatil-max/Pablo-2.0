
import React from 'react';
import { OTAAuditItem } from '../types';

interface Props {
  audit: OTAAuditItem[];
}

const RatingTrendChart: React.FC<{ history: { label: string; value: number }[] }> = ({ history }) => {
  if (!history || history.length < 2) return null;

  const width = 200;
  const height = 40;
  
  // Normalize data for chart visuals: if any value is > 5, assume it needs dividing by 2
  const processedHistory = history.map(h => ({
    ...h,
    value: h.value > 5 ? h.value / 2 : h.value
  }));

  const maxRating = 5; 
  const minRating = 0;

  // Calculate points
  const points = processedHistory.map((h, i) => {
    const x = (i / (processedHistory.length - 1)) * width;
    const y = height - ((h.value - minRating) / (maxRating - minRating)) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="mt-4 mb-6">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">6M Rating Trend</span>
        <span className="text-[9px] font-bold text-slate-500">Scale 0-5.0</span>
      </div>
      <div className="relative h-12 w-full bg-slate-50 rounded-lg overflow-hidden border border-slate-100 p-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {/* Fill Area */}
          <polyline
            points={areaPoints}
            fill="url(#gradient)"
            opacity="0.2"
          />
          {/* Main Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#c54b2a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#c54b2a" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex justify-between mt-1 px-0.5">
        {processedHistory.map((h, i) => (
          <span key={i} className="text-[7px] font-black text-slate-400 uppercase">{h.label}</span>
        ))}
      </div>
    </div>
  );
};

const OTACard: React.FC<{ item: OTAAuditItem }> = ({ item }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'FAIL': return 'bg-red-50 text-red-600 border-red-200';
      case 'WARNING': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'PASS': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  // Safe normalization for display: strictly use 5.0 scale
  const displayRating = (item.rating && item.rating > 5) ? item.rating / 2 : item.rating;

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-2xl font-black text-slate-800 tracking-tight">{item.channel}</h4>
          {displayRating !== undefined && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-sm font-black text-slate-900">{displayRating.toFixed(1)}</span>
              <div className="flex items-center gap-0.5">
                <svg className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-[10px] font-bold text-slate-300">/ 5.0</span>
              </div>
            </div>
          )}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusStyle(item.status)}`}>
          <div className={`w-2 h-2 rounded-full ${item.status === 'FAIL' ? 'bg-red-500' : item.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest">{item.status}</span>
        </div>
      </div>

      {item.history && <RatingTrendChart history={item.history} />}

      <div className="flex-1 space-y-8 mt-4">
        <section>
          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Channel Blockers</h5>
          <ul className="space-y-3">
            {item.blockers.map((blocker, idx) => (
              <li key={idx} className="flex gap-3 items-start group">
                <span className="text-red-500 mt-1 flex-shrink-0">•</span>
                <span className="text-xs font-bold text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">{blocker}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Recovery Plan</h5>
          <ul className="space-y-3">
            {item.recoveryPlan.map((step, idx) => (
              <li key={idx} className="flex gap-3 items-start group">
                <span className="text-amber-600 mt-0.5 flex-shrink-0 font-bold">→</span>
                <span className="text-xs font-bold italic text-amber-900/70 leading-snug group-hover:text-amber-900 transition-colors">{step}</span>
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
    <div className="mt-20">
      <div className="flex items-center gap-4 mb-10">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">OTA Performance Audit</h3>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {audit.map((item, idx) => (
          <OTACard key={idx} item={item} />
        ))}
      </div>
    </div>
  );
};

export default OTAPerformanceAudit;
