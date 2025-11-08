import React from 'react';
import type { Lead, User } from '../types';

interface SearchResultsProps {
    results: Lead[];
    users: User[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, users }) => {
    const userMap = new Map(users.map(user => [user.id, user.name]));

    return (
        <div className="absolute top-full mt-2 w-full max-h-80 overflow-y-auto bg-white border border-brand-border rounded-lg shadow-lg z-10">
            {results.length > 0 ? (
                <ul>
                    {results.map(lead => (
                        <li key={lead.id} className="p-3 border-b border-brand-border last:border-b-0 hover:bg-brand-light cursor-pointer">
                            <p className="font-semibold text-brand-dark">{lead.customerName}</p>
                            <p className="text-sm text-brand-gray">
                                Project: <span className="font-medium text-brand-dark">{lead.interestedProject}</span>
                            </p>
                            <p className="text-xs text-brand-gray">
                                Assigned to: {userMap.get(lead.assignedSalespersonId) || 'N/A'}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="p-4 text-center text-brand-gray">
                    <p>No results found.</p>
                </div>
            )}
        </div>
    );
}

export default SearchResults;
