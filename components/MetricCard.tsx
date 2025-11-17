import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'teal' | 'orange';
}

const colorMap = {
    blue: { bg: 'bg-accent-blue/10', text: 'text-accent-blue', border: 'border-accent-blue' },
    green: { bg: 'bg-accent-green/10', text: 'text-accent-green', border: 'border-accent-green' },
    red: { bg: 'bg-accent-red/10', text: 'text-accent-red', border: 'border-accent-red' },
    purple: { bg: 'bg-accent-purple/10', text: 'text-accent-purple', border: 'border-accent-purple' },
    teal: { bg: 'bg-accent-teal/10', text: 'text-accent-teal', border: 'border-accent-teal' },
    orange: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary' },
};


const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => {
  const { bg, text, border } = colorMap[color];

  return (
    <div className={`card p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 border-t-4 ${border}`}>
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-muted-content">{title}</p>
        <div className={`flex-shrink-0 rounded-lg p-2 ${bg}`}>
          {/* Fix: Corrected the type assertion for the 'icon' prop to resolve the TypeScript error. */}
          {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-6 h-6 ${text}` })}
        </div>
      </div>
      <div>
        <p className={`text-4xl font-extrabold text-base-content mt-2`}>{value}</p>
      </div>
    </div>
  );
};

export default MetricCard;