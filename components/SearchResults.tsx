import React from 'react';
import type { Lead, User } from '../types';

interface SearchResultsProps {
    results: Lead[];
    users: User[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, users }) => {
    const userMap = new Map(users.map(user => [user.id, user.name]));

    return (
        <div className="absolute top-full mt-2 w-full max-h-80 overflow-y-auto bg-white border border-border-color rounded-lg shadow-lg z-10">
            {results.length > 0 ? (
                <ul>
                    {results.map(lead => (
                        <li key={lead.id} className="p-3 border-b border-border-color last:border-b-0 hover:bg-background cursor-pointer">
                            <p className="font-semibold text-text-primary">{lead.customerName}</p>
                            <p className="text-sm text-text-secondary">
                                Project: <span className="font-medium text-text-primary">{lead.interestedProject}</span>
                            </p>
                            <p className="text-xs text-text-secondary">
                                Assigned to: {userMap.get(lead.assignedSalespersonId) || 'N/A'}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="p-4 text-center text-text-secondary">
                    <p>No results found.</p>
                </div>
            )}
        </div>
    );
}

export default SearchResults;