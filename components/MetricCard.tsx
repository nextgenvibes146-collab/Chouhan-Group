
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'teal' | 'orange';
}

const colorMap = {
    blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-500/10' },
    green: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-500/10' },
    red: { bg: 'bg-rose-50', iconBg: 'bg-rose-100', text: 'text-rose-600', ring: 'ring-rose-500/10' },
    purple: { bg: 'bg-violet-50', iconBg: 'bg-violet-100', text: 'text-violet-600', ring: 'ring-violet-500/10' },
    teal: { bg: 'bg-teal-50', iconBg: 'bg-teal-100', text: 'text-teal-600', ring: 'ring-teal-500/10' },
    orange: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600', ring: 'ring-amber-500/10' },
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => {
  const styles = colorMap[color];

  // Mock trend calculation for visuals
  const isPositive = Math.random() > 0.4;
  const trendValue = (Math.random() * 10).toFixed(1);

  return (
    <div className="card p-5 relative overflow-hidden group hover:border-slate-300 hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${styles.iconBg} ${styles.text} transition-transform group-hover:scale-110 duration-300`}>
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-6 h-6` })}
        </div>
      </div>
      
      <div className="mt-4 flex items-center text-xs font-medium">
        <span className={`flex items-center ${isPositive ? 'text-emerald-600' : 'text-rose-600'} bg-white px-2 py-1 rounded-full border border-slate-100 shadow-sm`}>
            {isPositive ? (
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ) : (
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
            )}
            {trendValue}%
        </span>
        <span className="ml-2 text-slate-400">vs last month</span>
      </div>
    </div>
  );
};

export default MetricCard;
