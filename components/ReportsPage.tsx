import React from 'react';
import { ChartBarIcon } from './Icons';

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">Reporting</h2>
       <div className="bg-white p-6 rounded-xl shadow-md text-center">
         <div className="flex justify-center items-center mb-4">
            <ChartBarIcon className="w-16 h-16 text-brand-blue opacity-50" />
         </div>
        <p className="text-brand-gray">Advanced reporting tools to analyze sales performance, lead conversion rates, and team productivity will be built here.</p>
      </div>
    </div>
  );
};

export default ReportsPage;