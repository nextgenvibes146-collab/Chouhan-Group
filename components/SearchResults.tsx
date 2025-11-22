
import React from 'react';
import type { Lead, User } from '../types';

interface SearchResultsProps {
    results: Lead[];
    users: User[];
    onResultClick: (lead: Lead) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, users, onResultClick }) => {
    const userMap = new Map(users.map(user => [user.id, user.name]));

    return (
        <div className="absolute top-full mt-2 w-full max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
            {results.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                    {results.map(lead => (
                        <li 
                            key={lead.id} 
                            onClick={() => onResultClick(lead)}
                            className="p-3 hover:bg-blue-50 cursor-pointer transition-colors group"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-gray-900 group-hover:text-primary transition-colors text-sm">{lead.customerName}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">{lead.mobile}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    lead.status === 'New Lead' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {lead.status}
                                </span>
                            </div>
                            <div className="flex items-center mt-2 text-xs text-gray-400">
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 mr-2 font-medium">
                                    {lead.interestedProject || 'General'}
                                </span>
                                <span className="flex items-center truncate max-w-[150px]">
                                     Assigned to: {userMap.get(lead.assignedSalespersonId) || 'Admin'}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="p-8 text-center">
                    <p className="text-sm text-gray-500 font-medium">No matching leads found.</p>
                </div>
            )}
        </div>
    );
}

export default SearchResults;
