

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Lead } from '../types';
import { LeadStatus } from '../types';

interface SalesPipelineChartProps {
  leads: Lead[];
}

const SalesPipelineChart: React.FC<SalesPipelineChartProps> = ({ leads }) => {
  const chartData = useMemo(() => {
    const statusOrder = [
      LeadStatus.New,
      LeadStatus.Contacted,
// Fix: Corrected enum member access from 'VisitScheduled' to 'SiteVisitScheduled'.
      LeadStatus.SiteVisitScheduled,
      LeadStatus.Negotiation,
      LeadStatus.Booked
    ];

    const counts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<LeadStatus, number>);

    return statusOrder.map(status => ({
      name: status,
      leads: counts[status] || 0,
    }));
  }, [leads]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Sales Pipeline</h3>
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
            <Bar dataKey="leads" fill="#f19f21" name="Leads Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesPipelineChart;