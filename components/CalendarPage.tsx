import React, { useMemo } from 'react';
import { CalendarIcon, DocumentTextIcon, UsersIcon } from './Icons';
import type { Lead, Task } from '../types';

interface CalendarPageProps {
  leads: Lead[];
  tasks: Task[];
}

const CalendarPage: React.FC<CalendarPageProps> = ({ leads, tasks }) => {
  const calendarItems = useMemo(() => {
    const items: { date: Date; type: 'Follow-up' | 'Task'; title: string; details: string; }[] = [];

    leads.forEach(lead => {
      if (lead.nextFollowUpDate) {
        items.push({
          date: new Date(lead.nextFollowUpDate),
          type: 'Follow-up',
          title: `Follow up with ${lead.customerName}`,
          details: lead.lastRemark,
        });
      }
    });

    tasks.forEach(task => {
        if (!task.isCompleted) {
             items.push({
                date: new Date(task.dueDate),
                type: 'Task',
                title: task.title,
                details: `Task created by ${task.createdBy}`
            });
        }
    });

    return items
      .filter(item => item.date >= new Date(new Date().setDate(new Date().getDate() - 1))) // from yesterday onwards
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [leads, tasks]);

  const groupItemsByDate = () => {
    return calendarItems.reduce((acc, item) => {
        const dateKey = item.date.toDateString();
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(item);
        return acc;
    }, {} as Record<string, typeof calendarItems>);
  };

  const groupedItems = groupItemsByDate();
  const sortedDates = Object.keys(groupedItems).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">My Agenda</h2>
      <div className="bg-white p-6 rounded-xl shadow-md">
        {sortedDates.length > 0 ? (
          <div className="space-y-6">
            {sortedDates.map(dateKey => (
              <div key={dateKey}>
                <h3 className="text-lg font-semibold text-brand-blue pb-2 mb-3 border-b border-brand-border">
                    {new Date(dateKey).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
                <ul className="space-y-4">
                    {groupedItems[dateKey].map((item, index) => (
                        <li key={index} className="flex items-start space-x-4">
                            <div className={`mt-1 flex-shrink-0 rounded-full p-2 ${item.type === 'Task' ? 'bg-orange-100' : 'bg-purple-100'}`}>
                                {item.type === 'Task' ? <DocumentTextIcon className="w-5 h-5 text-orange-600" /> : <UsersIcon className="w-5 h-5 text-purple-600" />}
                            </div>
                            <div>
                                <p className="font-semibold text-brand-dark">{item.title}</p>
                                <p className="text-sm text-brand-gray">{item.details}</p>
                            </div>
                        </li>
                    ))}
                </ul>
              </div>  
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <CalendarIcon className="w-16 h-16 text-brand-blue opacity-50 mx-auto mb-4" />
            <p className="text-brand-gray">You have no upcoming tasks or follow-ups scheduled.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;