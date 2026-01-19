
import React from 'react';
import { DecisionType } from '../types';

interface Props {
  decision: string;
  size?: 'sm' | 'md' | 'lg';
}

const DecisionBadge: React.FC<Props> = ({ decision, size = 'md' }) => {
  const getStyles = () => {
    const d = decision.toLowerCase();
    if (d.includes('auto') || d.includes('reject') || d.includes('exit')) {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    if (d.includes('conditional')) {
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }
    if (d.includes('approve') || d.includes('continue')) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-0.5';
      case 'lg': return 'text-lg px-6 py-2 font-bold';
      default: return 'text-sm px-3 py-1 font-medium';
    }
  };

  return (
    <span className={`${getStyles()} ${getSizeClasses()} border rounded-full inline-flex items-center justify-center uppercase tracking-wider`}>
      {decision}
    </span>
  );
};

export default DecisionBadge;
