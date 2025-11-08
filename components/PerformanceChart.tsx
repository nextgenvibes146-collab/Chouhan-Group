
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
      <h3 className="text-lg font-semibold text-brand-dark mb-4">Salesperson Performance (Bookings)</h3>
       <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip
                contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '8px'
                }}
            />
            <Legend />
            <Bar dataKey="Target" fill="#a0aec0" />
            <Bar dataKey="Achieved" fill="#48bb78" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;
