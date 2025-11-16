import React from 'react';
import AttendanceCard from './AttendanceCard';

const AttendancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Attendance Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
           <AttendanceCard />
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Attendance History</h3>
          <p className="text-text-secondary">A detailed log of attendance records for the sales team will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;