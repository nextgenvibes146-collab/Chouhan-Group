import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Activity, User } from '../types';

interface FollowUpChartProps {
  activities: Activity[];
  users: User[];
}

const FollowUpChart: React.FC<FollowUpChartProps> = ({ activities, users }) => {
  const chartData = useMemo(() => {
    const userMap = new Map(users.map(user => [user.id, user.name]));
    const followUpCounts: { [key: string]: number } = {};

    activities.forEach(activity => {
      if (userMap.has(activity.salespersonId)) {
        followUpCounts[activity.salespersonId] = (followUpCounts[activity.salespersonId] || 0) + 1;
      }
    });

    return Object.entries(followUpCounts).map(([salespersonId, count]) => ({
      name: userMap.get(salespersonId) || 'Unknown',
      'Follow-ups': count,
    }));
  }, [activities, users]);

  return (
    <div>
      <h3 className="text-lg font-bold text-base-content mb-4">Follow-up Activity</h3>
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
            <Bar dataKey="Follow-ups" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FollowUpChart;