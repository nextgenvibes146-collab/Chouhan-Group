import React from 'react';
import type { Activity, User } from '../types';
import { ActivityType } from '../types';
import {
  HomeIcon,
  PhoneIcon,
  MailIcon,
  ChatBubbleIcon,
  DocumentTextIcon,
  UsersIcon,
} from './Icons';

interface ActivityFeedProps {
  activities: Activity[];
  users: User[];
  title?: string;
}

const getActivityIcon = (type: ActivityType) => {
    const iconClasses = "w-5 h-5";
    switch (type) {
        case ActivityType.Call:
            return <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><PhoneIcon className={iconClasses} /></div>;
        case ActivityType.Visit:
            return <div className="bg-green-100 text-green-600 p-2 rounded-full"><HomeIcon className={iconClasses} /></div>;
        case ActivityType.Email:
            return <div className="bg-purple-100 text-purple-600 p-2 rounded-full"><MailIcon className={iconClasses} /></div>;
        case ActivityType.WhatsApp:
            return <div className="bg-teal-100 text-teal-600 p-2 rounded-full"><ChatBubbleIcon className={iconClasses} /></div>;
        case ActivityType.Note:
            return <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full"><DocumentTextIcon className={iconClasses} /></div>;
        default:
            return <div className="bg-gray-100 text-gray-600 p-2 rounded-full"><UsersIcon className={iconClasses} /></div>;
    }
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, users, title = "Recent Activity" }) => {
  const userMap = new Map<string, User>(users.map(user => [user.id, user]));

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
      <div className="flow-root">
        <ul role="list" className="-mb-8 max-h-[400px] overflow-y-auto pr-2">
            {activities.length > 0 ? activities.map((activity, activityIdx) => {
            const user = userMap.get(activity.salespersonId);
            if (!user) return null;
            
            const durationText = activity.type === ActivityType.Call && activity.duration ? ` for ${activity.duration} min(s)` : '';

            return (
                <li key={activity.id}>
                    <div className="relative pb-8">
                        {activityIdx !== activities.length - 1 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3 items-start">
                            <div className="relative">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div>
                                    <div className="text-sm">
                                      <span className="font-semibold text-text-primary">{user.name}</span>
                                      {' '}{activity.type.toLowerCase()}
                                      {' '}<span className="font-semibold text-primary">{activity.customerName}</span>
                                      {durationText}
                                    </div>
                                    <p className="mt-0.5 text-xs text-text-secondary">
                                        {new Date(activity.date).toLocaleString()}
                                    </p>
                                </div>
                                <div className="mt-2 text-sm text-text-primary">
                                    <p className="italic bg-gray-100 p-2 rounded-md">"{activity.remarks}"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
             );
            }) : <p className="text-sm text-text-secondary text-center py-4">No activities to display.</p>}
        </ul>
      </div>
    </div>
  );
};

export default ActivityFeed;