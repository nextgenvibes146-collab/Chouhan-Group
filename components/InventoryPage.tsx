
import React, { useState, useMemo } from 'react';
import { Project, Unit, InventoryStatus } from '../data/inventoryData';
import { BuildingOfficeIcon, InformationCircleIcon, CheckCircleIcon } from './Icons';

interface InventoryPageProps {
    projects: Project[];
    onBookUnit: (unitId: string) => void;
}

const StatusBadge: React.FC<{ status: InventoryStatus }> = ({ status }) => {
    const colors = {
        'Available': 'bg-green-100 text-green-800 border-green-200',
        'Booked': 'bg-red-100 text-red-800 border-red-200',
        'Hold': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Blocked': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return (
        <span className={`px-2 py-1 text-xs font-bold rounded-full border ${colors[status]}`}>
            {status.toUpperCase()}
        </span>
    );
};

const UnitCard: React.FC<{ unit: Unit, onClick: () => void }> = ({ unit, onClick }) => {
    const statusColors = {
        'Available': 'bg-white hover:border-green-400 border-gray-200 shadow-sm hover:shadow-md',
        'Booked': 'bg-red-50 border-red-100 opacity-75 cursor-not-allowed',
        'Hold': 'bg-yellow-50 border-yellow-200 hover:border-yellow-400',
        'Blocked': 'bg-gray-100 border-gray-200 opacity-60',
    };

    return (
        <div 
            onClick={() => unit.status !== 'Booked' && onClick()}
            className={`p-3 rounded-xl border transition-all duration-200 ${statusColors[unit.status]} flex flex-col justify-between h-28 relative overflow-hidden group`}
        >
            <div className="flex justify-between items-start">
                <span className="font-bold text-lg text-gray-800">{unit.unitNumber}</span>
                {unit.status === 'Available' && <div className="h-2 w-2 rounded-full bg-green-500"></div>}
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium">{unit.size}</p>
                <p className="text-sm font-bold text-primary mt-0.5">{unit.price}</p>
            </div>
            {unit.status === 'Available' && (
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            )}
        </div>
    );
};

const BookingModal: React.FC<{ unit: Unit; onClose: () => void; onConfirm: () => void }> = ({ unit, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm m-4">
                <div className="text-center mb-6">
                    <div className="bg-green-100 p-3 rounded-full inline-block mb-4">
                        <BuildingOfficeIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Book Unit {unit.unitNumber}</h3>
                    <p className="text-gray-500 text-sm mt-1">{unit.type} • {unit.size}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-2 border border-gray-100">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Base Price</span>
                        <span className="font-bold text-gray-900">{unit.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Facing</span>
                        <span className="font-bold text-gray-900">{unit.facing || 'N/A'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="button-secondary">Cancel</button>
                    <button onClick={onConfirm} className="button-primary">Confirm Booking</button>
                </div>
            </div>
        </div>
    );
};

const InventoryPage: React.FC<InventoryPageProps> = ({ projects, onBookUnit }) => {
    const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [filter, setFilter] = useState<InventoryStatus | 'All'>('All');

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    const filteredUnits = useMemo(() => {
        if (!selectedProject) return [];
        if (filter === 'All') return selectedProject.units;
        return selectedProject.units.filter(u => u.status === filter);
    }, [selectedProject, filter]);

    const stats = useMemo(() => {
        if (!selectedProject) return { total: 0, available: 0, booked: 0, hold: 0 };
        return {
            total: selectedProject.totalUnits,
            available: selectedProject.units.filter(u => u.status === 'Available').length,
            booked: selectedProject.units.filter(u => u.status === 'Booked').length,
            hold: selectedProject.units.filter(u => u.status === 'Hold').length
        };
    }, [selectedProject]);

    const handleBook = () => {
        if (selectedUnit) {
            onBookUnit(selectedUnit.id);
            setSelectedUnit(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-base-content">Inventory</h1>
                    <p className="text-sm text-muted-content mt-1">Manage plots, flats and bookings.</p>
                </div>
                <div className="w-full md:w-64">
                    <select 
                        value={selectedProjectId} 
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="input-style font-semibold"
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-4 border-t-4 border-blue-500">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Units</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="card p-4 border-t-4 border-green-500">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Available</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.available}</p>
                </div>
                <div className="card p-4 border-t-4 border-red-500">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Booked</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.booked}</p>
                </div>
                <div className="card p-4 border-t-4 border-yellow-500">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">On Hold</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.hold}</p>
                </div>
            </div>

            {/* Main Inventory Grid */}
            <div className="card p-6">
                <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-100">
                    {['All', 'Available', 'Booked', 'Hold'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                filter === f 
                                ? 'bg-gray-900 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {filteredUnits.map(unit => (
                        <UnitCard 
                            key={unit.id} 
                            unit={unit} 
                            onClick={() => setSelectedUnit(unit)}
                        />
                    ))}
                </div>
                
                {filteredUnits.length === 0 && (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">No units match the selected filter.</p>
                    </div>
                )}
            </div>

            {selectedUnit && (
                <BookingModal 
                    unit={selectedUnit} 
                    onClose={() => setSelectedUnit(null)} 
                    onConfirm={handleBook} 
                />
            )}
        </div>
    );
};

export default InventoryPage;
