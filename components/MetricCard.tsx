import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  isAlert?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, isAlert }) => {
  const isIncrease = changeType === 'increase';
  const changeColor = isIncrease ? 'text-green-500' : 'text-red-500';
  const changeIcon = isIncrease ? '▲' : '▼';
  const valueColor = isAlert ? 'text-red-500' : 'text-brand-dark';

  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between">
      <p className="text-sm font-medium text-brand-gray">{title}</p>
      <div className="mt-2">
        <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
        {change && (
            <p className={`text-sm font-semibold ${changeColor} mt-1`}>
                {changeIcon} {change} vs last month
            </p>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
