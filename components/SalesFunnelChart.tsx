

import React, { useMemo } from 'react';
import { ResponsiveContainer, FunnelChart, Funnel, Tooltip, LabelList, Cell } from 'recharts';
import type { Lead } from '../types';
import { LeadStatus } from '../types';

interface SalesFunnelChartProps {
  leads: Lead[];
}

const COLORS = ['#fbe5bf', '#f9d79f', '#f7c980', '#f5bb60', '#f3ad40', '#f19f21'];

const SalesFunnelChart: React.FC<SalesFunnelChartProps> = ({ leads }) => {
  const chartData = useMemo(() => {
    const pipelineOrder: LeadStatus[] = [
        LeadStatus.New,
        LeadStatus.Contacted,
        // Fix: Corrected enum member access from 'VisitScheduled' to 'SiteVisitScheduled'.
        LeadStatus.SiteVisitScheduled,
        // Fix: Corrected enum member access from 'VisitDone' to 'SiteVisitDone'.
        LeadStatus.SiteVisitDone,
        LeadStatus.Negotiation,
        LeadStatus.Booked
    ];

    const counts = pipelineOrder.reduce((acc, status) => {
        acc[status] = 0;
        return acc;
    }, {} as Record<string, number>);

    leads.forEach(lead => {
        if (counts.hasOwnProperty(lead.status)) {
            counts[lead.status]++;
        }
    });

    const funnelData: { name: string; value: number; }[] = [];
    let cumulativeValue = 0;
    
    // Iterate backwards to accumulate values
    for (let i = pipelineOrder.length - 1; i >= 0; i--) {
        const status = pipelineOrder[i];
        cumulativeValue += counts[status] || 0;
        funnelData.unshift({ // Add to the beginning of the array to maintain order
            name: status,
            value: cumulativeValue,
        });
    }
    
    // Filter out stages with 0 leads to not clutter the chart
    return funnelData.filter(d => d.value > 0);
  }, [leads]);

  if (!chartData || chartData.length === 0) {
      return (
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Sales Funnel</h3>
          <p className="text-text-secondary text-center py-10">Not enough data to display funnel.</p>
        </div>
      );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Sales Funnel</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <FunnelChart>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px'
              }}
            />
            <Funnel
              dataKey="value"
              data={chartData}
              isAnimationActive
            >
              <LabelList position="right" fill="#5f6368" stroke="none" dataKey="name" fontSize={12} />
              {
                chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
              }
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesFunnelChart;