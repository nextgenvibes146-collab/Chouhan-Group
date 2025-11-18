
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Lead } from '../types';
import { ModeOfEnquiry } from '../types';

interface LeadSourceChartProps {
  leads: Lead[];
}

const COLORS = ['#f19f21', '#3b82f6', '#16a34a', '#8b5cf6', '#14b8a6', '#ef4444', '#f59e0b'];

const LeadSourceChart: React.FC<LeadSourceChartProps> = ({ leads }) => {
  const chartData = useMemo(() => {
    const sourceCounts = leads.reduce((acc, lead) => {
      const source = lead.modeOfEnquiry || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sourceCounts)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  if (chartData.length === 0) {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-muted-content">No lead source data.</p>
        </div>
    );
  }

  return (
    <>
      <h3 className="text-lg font-bold text-base-content mb-4">Leads by Source</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
            }}
          />
          <Legend iconType="circle" />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </>
  );
};

export default LeadSourceChart;