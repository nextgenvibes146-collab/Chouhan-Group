


import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SalesTarget } from '../types';

interface PerformanceChartProps {
  targets: SalesTarget[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ targets }) => {
  const chartData = targets.map(t => ({
      name: t.name,
      Target: t.targets.bookings,
      Achieved: t.achieved.bookings,
  }));
    
  return (
    <div>
      <h3 className="text-lg font-bold text-base-content mb-4">Sales Performance (Bookings)</h3>
       <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
                contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem'
                }}
            />
            <Legend wrapperStyle={{fontSize: "14px"}} />
            <Bar dataKey="Target" fill="#a0aec0" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Achieved" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;