
import React, { useState, useMemo } from 'react';
import { Competitor } from '../types';

interface Props {
  targetName: string;
  targetRating?: number;
  targetADR?: string;
  competitors: Competitor[];
}

type MetricType = 'rating' | 'adr' | 'distance';

const CompetitiveLandscape: React.FC<Props> = ({ targetName, targetRating = 0, targetADR = '0', competitors }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('rating');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Unique categories for filtering
  const categories = useMemo(() => {
    const cats = new Set(competitors.map(c => c.category));
    return ['All', ...Array.from(cats)].filter(Boolean);
  }, [competitors]);

  // Parser for ADR (e.g. "₹2,500" -> 2500)
  const parseADR = (adrStr: string) => {
    const numeric = parseFloat(adrStr.replace(/[^0-9.]/g, ''));
    return isNaN(numeric) ? 0 : numeric;
  };

  // Parser for Distance (e.g. "1.2km" -> 1.2, "500m" -> 0.5)
  const parseDistance = (distStr: string) => {
    let numeric = parseFloat(distStr.replace(/[^0-9.]/g, ''));
    if (distStr.toLowerCase().includes('m') && !distStr.toLowerCase().includes('k')) {
      numeric = numeric / 1000; // convert meters to km
    }
    return isNaN(numeric) ? 0 : numeric;
  };

  // Filtered list based on category
  const filteredCompetitors = useMemo(() => {
    if (selectedCategory === 'All') return competitors;
    return competitors.filter(c => c.category === selectedCategory);
  }, [competitors, selectedCategory]);

  // Memoized data for the chart and benchmarks
  const benchmarkData = useMemo(() => {
    const targetVal = 
      selectedMetric === 'rating' ? targetRating : 
      selectedMetric === 'adr' ? parseADR(targetADR) : 
      0; // Distance for target is usually 0 relative to itself

    const items = [
      { name: targetName, value: targetVal, isTarget: true, original: selectedMetric === 'adr' ? targetADR : targetVal.toString(), category: 'Target' },
      ...filteredCompetitors.map(c => ({
        name: c.name,
        value: selectedMetric === 'rating' ? c.rating : selectedMetric === 'adr' ? parseADR(c.adr) : parseDistance(c.distance),
        isTarget: false,
        original: selectedMetric === 'rating' ? c.rating.toString() : selectedMetric === 'adr' ? c.adr : c.distance,
        category: c.category
      }))
    ];

    // For distance, we filter out target (0) for market average and sorting
    const marketItems = selectedMetric === 'distance' ? items.filter(i => !i.isTarget) : items;
    
    // Sort logic: Distance is "lower is better", others are "higher is better"
    const sorted = [...items].sort((a, b) => selectedMetric === 'distance' ? a.value - b.value : b.value - a.value);
    
    const marketAvg = marketItems.length > 0 ? marketItems.reduce((acc, curr) => acc + curr.value, 0) / marketItems.length : 0;
    const targetRank = sorted.findIndex(i => i.isTarget) + 1;
    
    // Deviation calculation
    const deviation = targetVal > 0 && marketAvg > 0 ? ((targetVal - marketAvg) / marketAvg) * 100 : 0;

    return { items, sorted, marketAvg, targetRank, targetVal, deviation };
  }, [selectedMetric, targetName, targetRating, targetADR, filteredCompetitors]);

  const maxValue = Math.max(...benchmarkData.items.map(d => d.value), 1);

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'rating': return 'OTA Rating';
      case 'adr': return 'Estimated ADR';
      case 'distance': return 'Distance (KM)';
      default: return '';
    }
  };

  return (
    <div className="mt-20">
      <div className="flex items-center gap-4 mb-10">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Micro-Market Competition</h3>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8 no-print">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Filter by Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-[10px] font-black uppercase rounded-full border transition-all ${
              selectedCategory === cat
                ? 'bg-[#c54b2a] text-white border-[#c54b2a] shadow-md shadow-orange-100'
                : 'bg-white text-slate-500 border-slate-200 hover:border-[#c54b2a] hover:text-[#c54b2a]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Table View */}
        <div className="lg:col-span-7">
          <div className="overflow-x-auto border border-slate-200 rounded-[2rem] bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Competitor Name</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Rating</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Current Rate</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Proximity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompetitors.length > 0 ? filteredCompetitors.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-800 text-base group-hover:text-[#c54b2a] transition-colors">{comp.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Via {comp.otaName} • {comp.category}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-base font-black text-slate-800">{comp.rating}</span>
                        <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="text-lg font-black text-[#c54b2a]">{comp.adr}</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-600 font-bold bg-slate-100/50 py-1 px-3 rounded-full ml-auto w-fit">
                        {comp.distance}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold">
                      No competitors found in the selected category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Dashboard */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Benchmarking</h4>
              <div className="flex bg-slate-100 p-1 rounded-xl no-print">
                {(['rating', 'adr', 'distance'] as MetricType[]).map((m) => (
                  <button 
                    key={m}
                    onClick={() => setSelectedMetric(m)}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${selectedMetric === m ? 'bg-white text-[#c54b2a] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-[#3e1d15] p-6 rounded-[1.5rem] text-white">
                <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1">Target Rank</p>
                <p className="text-3xl font-black">#{benchmarkData.targetRank}<span className="text-sm opacity-50 ml-1">of {benchmarkData.sorted.length}</span></p>
              </div>
              <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Market Avg</p>
                <p className="text-2xl font-black text-slate-900">
                  {selectedMetric === 'rating' ? benchmarkData.marketAvg.toFixed(1) : 
                   selectedMetric === 'adr' ? `₹${Math.round(benchmarkData.marketAvg).toLocaleString()}` : 
                   `${benchmarkData.marketAvg.toFixed(1)}km`}
                </p>
              </div>
            </div>

            {/* Market Comparison Logic */}
            {selectedMetric !== 'distance' && benchmarkData.marketAvg > 0 && (
              <div className={`mb-8 p-4 rounded-2xl flex items-center justify-between ${benchmarkData.deviation >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${benchmarkData.deviation >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {benchmarkData.deviation >= 0 ? 
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg> :
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                    }
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tight">vs {selectedCategory === 'All' ? 'Micro-Market' : selectedCategory} Avg</span>
                </div>
                <span className="text-xl font-black">{Math.abs(Math.round(benchmarkData.deviation))}%</span>
              </div>
            )}

            {/* Visual Bar Chart */}
            <div className="space-y-6">
              <div className="flex justify-between items-end mb-2">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{getMetricLabel()} Distribution</h5>
              </div>
              
              <div className="space-y-5">
                {benchmarkData.items.map((data, idx) => {
                  const widthPercentage = (data.value / maxValue) * 100;
                  return (
                    <div key={idx} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[11px] font-bold uppercase truncate max-w-[180px] transition-colors ${data.isTarget ? 'text-[#c54b2a] font-black' : 'text-slate-500 group-hover:text-slate-700'}`}>
                          {data.isTarget ? 'Target' : data.name}
                        </span>
                        <span className={`text-xs font-black ${data.isTarget ? 'text-[#c54b2a]' : 'text-slate-700'}`}>
                          {data.original}
                        </span>
                      </div>
                      <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 relative">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out absolute left-0 top-0 ${data.isTarget ? 'bg-[#c54b2a] shadow-lg shadow-orange-500/30' : 'bg-slate-300'}`}
                          style={{ width: `${Math.max(widthPercentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-orange-100 flex items-center justify-center text-[#c54b2a] flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/></svg>
                </div>
                <p className="text-[10px] font-bold text-slate-400 italic leading-relaxed">
                  {selectedMetric === 'rating' ? 'Commercial strategy requires a rating of >4.2 for sustainable RevPAR growth.' : 
                   selectedMetric === 'adr' ? 'Market median is critical for volume-driven micro-markets.' : 
                   'Competition within 1km poses the highest immediate risk to corporate segment retention.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveLandscape;
