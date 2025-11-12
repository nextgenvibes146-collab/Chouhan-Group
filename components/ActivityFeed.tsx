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
    switch (type) {
        case ActivityType.Call:
            return <PhoneIcon className="w-5 h-5 text-blue-500" />;
        case ActivityType.Visit:
            return <HomeIcon className="w-5 h-5 text-green-500" />;
        case ActivityType.Email:
            return <MailIcon className="w-5 h-5 text-purple-500" />;
        case ActivityType.WhatsApp:
            return <ChatBubbleIcon className="w-5 h-5 text-teal-500" />;
        case ActivityType.Note:
            return <DocumentTextIcon className="w-5 h-5 text-yellow-500" />;
        default:
            return <UsersIcon className="w-5 h-5 text-gray-500" />;
    }
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, users, title = "Recent Activity" }) => {
  // FIX: Explicitly type the Map to ensure proper type inference for 'user'.
  const userMap = new Map<string, User>(users.map(user => [user.id, user]));

  return (
    <div>
      <h3 className="text-lg font-semibold text-brand-dark mb-4">{title}</h3>
      <ul className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
        {activities.length > 0 ? activities.map(activity => {
          const user = userMap.get(activity.salespersonId);
          if (!user) return null;

          return (
            <li key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1 bg-gray-100 rounded-full p-1.5">
                {getActivityIcon(activity.type)}
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-semibold text-brand-dark">{user.name}</span>
                  {' '}{activity.type.toLowerCase()}
                  {' '}<span className="font-semibold text-brand-blue">{activity.customerName}</span>
                </p>
                <p className="text-xs text-brand-gray">{new Date(activity.date).toLocaleString()}</p>
                <p className="text-sm text-brand-dark mt-1 italic">"{activity.remarks}"</p>
              </div>
            </li>
          );
        }) : <p className="text-sm text-brand-gray text-center py-4">No activities to display.</p>}
      </ul>
    </div>
  );
};

export default ActivityFeed;