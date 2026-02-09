
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

  const categories = useMemo(() => {
    const cats = new Set(competitors.map(c => c.category));
    return ['All', ...Array.from(cats)].filter(Boolean);
  }, [competitors]);

  const parseADR = (adrStr: string) => {
    const numeric = parseFloat(adrStr.replace(/[^0-9.]/g, ''));
    return isNaN(numeric) ? 0 : numeric;
  };

  const parseDistance = (distStr: string) => {
    let numeric = parseFloat(distStr.replace(/[^0-9.]/g, ''));
    if (distStr.toLowerCase().includes('m') && !distStr.toLowerCase().includes('k')) {
      numeric = numeric / 1000;
    }
    return isNaN(numeric) ? 0 : numeric;
  };

  const filteredCompetitors = useMemo(() => {
    if (selectedCategory === 'All') return competitors;
    return competitors.filter(c => c.category === selectedCategory);
  }, [competitors, selectedCategory]);

  const benchmarkData = useMemo(() => {
    const targetVal = 
      selectedMetric === 'rating' ? targetRating : 
      selectedMetric === 'adr' ? parseADR(targetADR) : 
      0;

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

    const marketItems = selectedMetric === 'distance' ? items.filter(i => !i.isTarget) : items;
    const sorted = [...items].sort((a, b) => selectedMetric === 'distance' ? a.value - b.value : b.value - a.value);
    const marketAvg = marketItems.length > 0 ? marketItems.reduce((acc, curr) => acc + curr.value, 0) / marketItems.length : 0;
    const targetRank = sorted.findIndex(i => i.isTarget) + 1;
    const deviation = targetVal > 0 && marketAvg > 0 ? ((targetVal - marketAvg) / marketAvg) * 100 : 0;

    return { items, sorted, marketAvg, targetRank, targetVal, deviation };
  }, [selectedMetric, targetName, targetRating, targetADR, filteredCompetitors]);

  const maxValue = Math.max(...benchmarkData.items.map(d => d.value), 1);

  return (
    <div className="mt-20">
      <div className="flex items-center gap-4 mb-10">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Competition Analysis</h3>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8 no-print">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-[10px] font-black uppercase rounded-full border transition-all ${
              selectedCategory === cat
                ? 'bg-[#c54b2a] text-white border-[#c54b2a] shadow-md'
                : 'bg-white text-slate-500 border-slate-200 hover:border-[#c54b2a]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <div className="overflow-x-auto border border-slate-200 rounded-[2rem] bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Entity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Rating</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Rate</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Distance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompetitors.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-800 text-base group-hover:text-[#c54b2a] transition-colors">{comp.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">{comp.category}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-base font-black text-slate-800">{comp.rating}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="text-lg font-black text-[#c54b2a]">{comp.adr}</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="text-slate-600 font-bold bg-slate-100/50 py-1 px-3 rounded-full ml-auto w-fit">{comp.distance}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-slate-900 p-6 rounded-[1.5rem] text-white">
                <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1">Rank</p>
                <p className="text-3xl font-black">#{benchmarkData.targetRank}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Market Avg</p>
                <p className="text-2xl font-black text-slate-900">{benchmarkData.marketAvg.toFixed(1)}</p>
              </div>
            </div>

            <div className="space-y-5">
              {benchmarkData.items.map((data, idx) => {
                const widthPercentage = (data.value / maxValue) * 100;
                return (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[11px] font-bold uppercase truncate max-w-[180px] ${data.isTarget ? 'text-[#c54b2a] font-black' : 'text-slate-500'}`}>
                        {data.isTarget ? 'Target' : data.name}
                      </span>
                      <span className="text-xs font-black text-slate-700">{data.original}</span>
                    </div>
                    <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div 
                        className={`h-full transition-all duration-1000 ${data.isTarget ? 'bg-[#c54b2a]' : 'bg-slate-300'}`}
                        style={{ width: `${Math.max(widthPercentage, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveLandscape;
