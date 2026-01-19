
import React from 'react';
import { ScorecardItem } from '../types';

interface Props {
  scores: ScorecardItem[];
}

const ScorecardTable: React.FC<Props> = ({ scores }) => {
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-emerald-600 font-bold';
    if (score >= 5) return 'text-amber-600 font-bold';
    return 'text-red-600 font-bold';
  };

  const getScoreBg = (score: number) => {
    if (score >= 7) return 'bg-emerald-50';
    if (score >= 5) return 'bg-amber-50';
    return 'bg-red-50';
  };

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-tight">Parameter</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-tight text-center">Score</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-tight">Strategic Context</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {scores.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.parameter}</td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-block w-10 h-10 leading-10 rounded-full ${getScoreBg(item.score)} ${getScoreColor(item.score)} border border-slate-100 text-sm`}>
                  {item.score}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 italic">
                {item.reason}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScorecardTable;
