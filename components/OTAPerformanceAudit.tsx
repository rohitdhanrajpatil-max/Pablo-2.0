
import React from 'react';
import { OTAAuditItem } from '../types';

interface Props {
  audit: OTAAuditItem[];
}

const RatingTrendChart: React.FC<{ history: { label: string; value: number }[], maxScale: number, color: string }> = ({ history, maxScale, color }) => {
  if (!history || history.length < 2) return null;

  const width = 240;
  const height = 48;
  const maxRating = maxScale; 
  const minRating = 0;

  const points = history.map((h, i) => {
    const x = (i / (history.length - 1)) * width;
    const y = height - ((h.value - minRating) / (maxRating - minRating)) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="mt-4 mb-6 chart-container">
      <div className="flex justify-between items-end mb-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Performance Velocity</span>
        <span className="text-[8px] font-bold text-slate-300">Historical Benchmarks</span>
      </div>
      <div className="relative h-14 w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-100 p-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${color.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline points={areaPoints} fill={`url(#gradient-${color.replace('#','')})`} />
          <polyline 
            points={points} 
            fill="none" 
            stroke={color} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>
      <div className="flex justify-between mt-2 px-1">
        {history.map((h, i) => (
          <span key={i} className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">{h.label}</span>
        ))}
      </div>
    </div>
  );
};

const OTACard: React.FC<{ item: OTAAuditItem }> = ({ item }) => {
  const channelLower = item.channel.toLowerCase();
  
  const getChannelTheme = () => {
    if (channelLower.includes('agoda')) return { color: '#8b5cf6', theme: 'purple' }; // Agoda Purple
    if (channelLower.includes('booking')) return { color: '#2563eb', theme: 'blue' }; // Booking Blue
    if (channelLower.includes('mmt') || channelLower.includes('makemytrip')) return { color: '#dc2626', theme: 'red' }; // MMT Red
    if (channelLower.includes('google')) return { color: '#10b981', theme: 'emerald' }; // Google Green
    return { color: '#c54b2a', theme: 'orange' };
  };

  const theme = getChannelTheme();
  const maxScale = item.maxScale || (channelLower.includes('agoda') || channelLower.includes('booking') ? 10 : 5);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'FAIL': return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-500' };
      case 'WARNING': return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-500' };
      case 'PASS': return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-500' };
      default: return { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', dot: 'bg-slate-400' };
    }
  };

  const config = getStatusConfig(item.status);

  return (
    <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-lg transition-all group break-inside-avoid ota-card">
      <div className="flex justify-between items-start mb-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: theme.color }}></div>
            <h4 className="text-xl font-black text-slate-800 tracking-tight truncate">
              {item.channel}
            </h4>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter">
                {item.rating?.toFixed(1) || 'N/A'}
              </span>
              <span className="text-[10px] font-bold text-slate-300 uppercase">/ {maxScale.toFixed(1)} Scale</span>
            </div>
            {item.reviewCount && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                  {item.reviewCount}
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Global Reach</span>
              </div>
            )}
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 ${config.bg} ${config.border} ${config.text} flex-shrink-0 shadow-sm`}>
          <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.status}</span>
        </div>
      </div>

      {item.history && <RatingTrendChart history={item.history} maxScale={maxScale} color={theme.color} />}

      <div className="flex-1 flex flex-col space-y-6">
        <section className="min-h-[110px]">
          <div className="flex items-center gap-2 mb-3">
            <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Growth Barriers</h5>
          </div>
          <ul className="space-y-2.5">
            {item.blockers.length > 0 ? item.blockers.slice(0, 3).map((blocker, idx) => (
              <li key={idx} className="flex gap-2.5 items-start">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-100 flex-shrink-0"></div>
                <span className="text-[11px] font-bold text-slate-600 leading-snug">{blocker}</span>
              </li>
            )) : (
              <li className="text-[11px] font-bold text-slate-400 italic">No structural barriers.</li>
            )}
          </ul>
        </section>

        <section className="min-h-[100px]">
          <div className="flex items-center gap-2 mb-3">
            <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Strategy Pivot</h5>
          </div>
          <ul className="space-y-2.5">
            {item.recoveryPlan.length > 0 ? item.recoveryPlan.slice(0, 2).map((step, idx) => (
              <li key={idx} className="flex gap-2.5 items-start p-2.5 rounded-xl" style={{ backgroundColor: `${theme.color}08`, border: `1px solid ${theme.color}15` }}>
                <span className="text-[10px] font-black" style={{ color: theme.color }}>✓</span>
                <span className="text-[11px] font-bold text-slate-700 leading-snug italic">{step}</span>
              </li>
            )) : (
              <li className="text-[11px] font-bold text-slate-400 italic">Optimize existing yield.</li>
            )}
          </ul>
        </section>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Efficiency Index</span>
        <div className="flex gap-1.5">
          {[1,2,3,4,5,6,7,8,9,10].map(i => {
             const normalizedRating = ((item.rating || 0) / maxScale) * 10;
             return (
               <div key={i} className={`w-1 h-2.5 rounded-full transition-colors`} style={{ backgroundColor: i <= Math.round(normalizedRating) ? theme.color : '#f1f5f9', opacity: i <= Math.round(normalizedRating) ? 0.6 : 1 }}></div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

const OTAPerformanceAudit: React.FC<Props> = ({ audit }) => {
  if (!audit || audit.length === 0) return null;

  return (
    <div className="mt-20 section-ota-audit">
      <div className="flex items-center gap-4 mb-10">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Strategic Channel Audit</h3>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ota-grid">
        {audit.map((item, idx) => (
          <OTACard key={idx} item={item} />
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <p className="text-[9px] font-bold text-slate-400 italic uppercase tracking-wider">Cross-Channel Normalization: Active</p>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Market Signal
        </div>
      </div>
    </div>
  );
};

export default OTAPerformanceAudit;
