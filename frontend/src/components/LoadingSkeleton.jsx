import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-pulse">
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-3"></div>
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-2/3"></div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3 animate-pulse">
    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-full"></div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-pulse">
    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-6"></div>
    <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full"></div>
  </div>
);
