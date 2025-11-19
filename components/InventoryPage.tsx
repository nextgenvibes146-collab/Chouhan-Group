
import React, { useState, useMemo } from 'react';
import { mockProjects, Project, Unit, InventoryStatus } from '../data/inventoryData';
import { BuildingOfficeIcon, InformationCircleIcon } from './Icons';

const StatusBadge: React.FC<{ status: InventoryStatus }> = ({ status }) => {
    const colors = {
        'Available': 'bg-green-100 text-green-800 border-green-200',
        'Booked': 'bg-red-100 text-red-800 border-red-200',
        'Hold': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Blocked': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[status]}`}>
            {status}
        </span>
    );
};

const UnitCard: React.FC<{ unit: Unit, onClick: () => void }> = ({ unit, onClick }) => {
    const statusColors = {
        'Available': 'bg-green-50 hover:bg-green-100 border-green-200',
        'Booked': 'bg-red-50 hover:bg-red-100 border-red-200 opacity-75',
        'Hold': 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
        'Blocked': 'bg-gray-100 border-gray-200 opacity-50',
    };

    return (
        <div 
            onClick={onClick}
            className={`cursor-pointer p-3 rounded-lg border transition-all duration-200 ${statusColors[unit.status]} shadow-sm hover:shadow-md flex flex-col justify-center items-center text-center h-24`}
        >
            <span className="font-bold text-base-content">{unit.unitNumber}</span>
            <span className="text-xs text-muted-content mt-1">{unit.size}</span>
            <span className={`text-xs font-semibold mt-1 ${unit.status === 'Available' ? 'text-green-700' : 'text-gray-500'}`}>
                {unit.status === 'Available' ? unit.price : unit.status}
            </span>
        </div>
    );
};

const UnitDetailModal: React.FC<{ unit: Unit | null, onClose: () => void }> = ({ unit, onClose }) => {
    if (!unit) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-base-content">Unit {unit.unitNumber}</h3>
                        <p className="text-sm text-muted-content">{unit.type}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-base-200 p-3 rounded-lg">
                            <p className="text-xs text-muted-content">Status</p>
                            <StatusBadge status={unit.status} />
                        </div>
                        <div className="bg-base-200 p-3 rounded-lg">
                            <p className="text-xs text-muted-content">Price</p>
                            <p className="font-semibold text-base-content">{unit.price}</p>
                        </div>
                        <div className="bg-base-200 p-3 rounded-lg">
                            <p className="text-xs text-muted-content">Size</p>
                            <p className="font-semibold text-base-content">{unit.size}</p>
                        </div>
                        <div className="bg-base-200 p-3 rounded-lg">
                            <p className="text-xs text-muted-content">Facing</p>
                            <p className="font-semibold text-base-content">{unit.facing || 'N/A'}</p>
                        </div>
                        {unit.floor && (
                            <div className="bg-base-200 p-3 rounded-lg">
                                <p className="text-xs text-muted-content">Floor</p>
                                <p className="font-semibold text-base-content">{unit.floor}</p>
                            </div>
                        )}
                    </div>

                    {unit.status === 'Available' && (
                        <button className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-focus transition-colors">
                            Book this Unit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const InventoryPage: React.FC = () => {
    const [selectedProjectId, setSelectedProjectId] = useState(mockProjects[0].id);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [filter, setFilter] = useState<InventoryStatus | 'All'>('All');

    const selectedProject = mockProjects.find(p => p.id === selectedProjectId);

    const filteredUnits = useMemo(() => {
        if (!selectedProject) return [];
        if (filter === 'All') return selectedProject.units;
        return selectedProject.units.filter(u => u.status === filter);
    }, [selectedProject, filter]);

    const stats = useMemo(() => {
        if (!selectedProject) return { total: 0, available: 0, booked: 0 };
        return {
            total: selectedProject.totalUnits,
            available: selectedProject.units.filter(u => u.status === 'Available').length,
            booked: selectedProject.units.filter(u => u.status === 'Booked').length,
            hold: selectedProject.units.filter(u => u.status === 'Hold').length
        };
    }, [selectedProject]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-base-content">Inventory Management</h1>
                    <p className="text-sm text-muted-content mt-1">Real-time availability of plots and flats</p>
                </div>
                <select 
                    value={selectedProjectId} 
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full md:w-64 p-2 border border-border-color rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                >
                    {mockProjects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4 border-l-4 border-blue-500">
                    <p className="text-xs text-muted-content uppercase font-bold">Total Units</p>
                    <p className="text-2xl font-bold text-base-content">{stats.total}</p>
                </div>
                <div className="card p-4 border-l-4 border-green-500">
                    <p className="text-xs text-muted-content uppercase font-bold">Available</p>
                    <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                </div>
                <div className="card p-4 border-l-4 border-red-500">
                    <p className="text-xs text-muted-content uppercase font-bold">Booked</p>
                    <p className="text-2xl font-bold text-red-600">{stats.booked}</p>
                </div>
                <div className="card p-4 border-l-4 border-yellow-500">
                    <p className="text-xs text-muted-content uppercase font-bold">On Hold</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.hold}</p>
                </div>
            </div>

            {/* Filters & Grid */}
            <div className="card p-6">
                <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-border-color">
                    {['All', 'Available', 'Booked', 'Hold'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                                filter === f 
                                ? 'bg-primary text-white shadow-md' 
                                : 'bg-base-200 text-muted-content hover:bg-base-300'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {filteredUnits.map(unit => (
                        <UnitCard 
                            key={unit.id} 
                            unit={unit} 
                            onClick={() => setSelectedUnit(unit)}
                        />
                    ))}
                </div>
                
                {filteredUnits.length === 0 && (
                    <div className="text-center py-12 text-muted-content">
                        <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No units found matching this filter.</p>
                    </div>
                )}
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-content bg-blue-50 p-3 rounded-lg">
                <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5" />
                <p>Tip: Click on any unit to view detailed pricing, facing, and floor plan information. Use the top dropdown to switch between different projects.</p>
            </div>

            <UnitDetailModal unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
        </div>
    );
};

export default InventoryPage;
