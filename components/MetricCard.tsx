import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  isAlert?: boolean;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, isAlert, icon }) => {
  const valueColor = isAlert ? 'text-red-500' : 'text-text-primary';

  return (
    <div className="card p-5 flex items-center space-x-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="flex-shrink-0 bg-gray-100 rounded-full p-3">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
};

export default MetricCard;