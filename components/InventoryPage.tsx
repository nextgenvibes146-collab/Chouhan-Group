
import React, { useState, useMemo } from 'react';
import { Project, Unit, InventoryStatus, InventoryType } from '../data/inventoryData';
import { BuildingOfficeIcon, PencilSquareIcon, CheckCircleIcon, PlusIcon, TrashIcon } from './Icons';
import type { User } from '../types';

interface InventoryPageProps {
    projects: Project[];
    onBookUnit: (unitId: string) => void;
    onUpdateUnit: (projectId: string, unit: Unit) => void;
    onAddUnit: (projectId: string, unit: Unit) => void;
    onDeleteUnit: (projectId: string, unitId: string) => void;
    currentUser: User;
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

const UnitCard: React.FC<{ 
    unit: Unit, 
    onClick: () => void, 
    onEdit?: (e: React.MouseEvent) => void,
    onDelete?: (e: React.MouseEvent) => void
}> = ({ unit, onClick, onEdit, onDelete }) => {
    const statusColors = {
        'Available': 'bg-white hover:border-green-400 border-gray-200 shadow-sm hover:shadow-md',
        'Booked': 'bg-red-50 border-red-100 opacity-75 cursor-not-allowed',
        'Hold': 'bg-yellow-50 border-yellow-200 hover:border-yellow-400',
        'Blocked': 'bg-gray-100 border-gray-200 opacity-60',
    };

    return (
        <div 
            onClick={() => unit.status !== 'Booked' && onClick()}
            className={`p-3 rounded-xl border transition-all duration-200 ${statusColors[unit.status]} flex flex-col justify-between h-28 relative overflow-hidden group cursor-pointer`}
        >
            <div className="flex justify-between items-start">
                <span className="font-bold text-lg text-gray-800">{unit.unitNumber}</span>
                <div className="flex items-center gap-1 z-10">
                    {onEdit && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(e);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                            title="Edit Unit"
                        >
                            <PencilSquareIcon className="w-4 h-4" />
                        </button>
                    )}
                    {onDelete && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(e);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                            title="Delete Unit"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {!onEdit && unit.status === 'Available' && <div className="h-2 w-2 rounded-full bg-green-500"></div>}
            </div>
            <div>
                <div className="flex justify-between items-baseline">
                    <p className="text-xs text-gray-500 font-medium">{unit.type}</p>
                    <p className="text-[10px] text-gray-400">{unit.size}</p>
                </div>
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

const EditUnitModal: React.FC<{ 
    unit: Unit; 
    onClose: () => void; 
    onSave: (updatedUnit: Unit) => void 
}> = ({ unit, onClose, onSave }) => {
    const [formData, setFormData] = useState<Unit>({ ...unit });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Edit Details: {unit.unitNumber}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-style">Unit Number</label>
                            <input type="text" name="unitNumber" value={formData.unitNumber} onChange={handleChange} className="input-style" />
                        </div>
                        <div>
                            <label className="label-style">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="input-style">
                                <option value="Available">Available</option>
                                <option value="Booked">Booked</option>
                                <option value="Hold">Hold</option>
                                <option value="Blocked">Blocked</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="label-style">Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="input-style">
                                <option value="Plot">Plot</option>
                                <option value="Flat">Flat</option>
                                <option value="Pent House">Pent House</option>
                                <option value="Villa">Villa</option>
                                <option value="Bungalow">Bungalow</option>
                                <option value="Row House">Row House</option>
                                <option value="Commercial">Commercial</option>
                            </select>
                        </div>
                         <div>
                            <label className="label-style">Price</label>
                            <input type="text" name="price" value={formData.price} onChange={handleChange} className="input-style" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-style">Size</label>
                            <input type="text" name="size" value={formData.size} onChange={handleChange} className="input-style" />
                        </div>
                        <div>
                            <label className="label-style">Facing</label>
                            <input type="text" name="facing" value={formData.facing || ''} onChange={handleChange} className="input-style" />
                        </div>
                    </div>
                     <div>
                        <label className="label-style">Floor</label>
                        <input type="text" name="floor" value={formData.floor || ''} onChange={handleChange} className="input-style" />
                    </div>
                </form>

                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="button-secondary !w-auto">Cancel</button>
                    <button type="button" onClick={handleSubmit} className="button-primary !w-auto">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const AddUnitModal: React.FC<{ 
    onClose: () => void; 
    onSave: (newUnit: Unit) => void 
}> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState<Unit>({ 
        id: `unit-${Date.now()}`,
        unitNumber: '',
        type: 'Plot',
        status: 'Available',
        size: '',
        price: '',
        facing: '',
        floor: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.unitNumber) return;
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Add New Unit</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-style">Unit Number <span className="text-red-500">*</span></label>
                            <input type="text" name="unitNumber" value={formData.unitNumber} onChange={handleChange} className="input-style" placeholder="e.g. A-101" required />
                        </div>
                        <div>
                            <label className="label-style">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="input-style">
                                <option value="Available">Available</option>
                                <option value="Booked">Booked</option>
                                <option value="Hold">Hold</option>
                                <option value="Blocked">Blocked</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="label-style">Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="input-style">
                                <option value="Plot">Plot</option>
                                <option value="Flat">Flat</option>
                                <option value="Pent House">Pent House</option>
                                <option value="Villa">Villa</option>
                                <option value="Bungalow">Bungalow</option>
                                <option value="Row House">Row House</option>
                                <option value="Commercial">Commercial</option>
                            </select>
                        </div>
                         <div>
                            <label className="label-style">Price</label>
                            <input type="text" name="price" value={formData.price} onChange={handleChange} className="input-style" placeholder="e.g. 25.0 Lac" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-style">Size</label>
                            <input type="text" name="size" value={formData.size} onChange={handleChange} className="input-style" placeholder="e.g. 1200 sqft" />
                        </div>
                        <div>
                            <label className="label-style">Facing</label>
                            <input type="text" name="facing" value={formData.facing || ''} onChange={handleChange} className="input-style" placeholder="e.g. East" />
                        </div>
                    </div>
                     <div>
                        <label className="label-style">Floor</label>
                        <input type="text" name="floor" value={formData.floor || ''} onChange={handleChange} className="input-style" placeholder="e.g. 1st Floor" />
                    </div>
                </form>

                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="button-secondary !w-auto">Cancel</button>
                    <button type="button" onClick={handleSubmit} className="button-primary !w-auto">Add Unit</button>
                </div>
            </div>
        </div>
    );
};

const InventoryPage: React.FC<InventoryPageProps> = ({ projects, onBookUnit, onUpdateUnit, onAddUnit, onDeleteUnit, currentUser }) => {
    const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<InventoryStatus | 'All'>('All');
    const [filterType, setFilterType] = useState<string>('All');

    const isAdmin = currentUser.role === 'Admin';
    const selectedProject = projects.find(p => p.id === selectedProjectId);

    const availableTypes = useMemo(() => {
        if (!selectedProject) return [];
        const types = new Set(selectedProject.units.map(u => u.type));
        return Array.from(types);
    }, [selectedProject]);

    const filteredUnits = useMemo(() => {
        if (!selectedProject) return [];
        return selectedProject.units.filter(u => {
            const statusMatch = filterStatus === 'All' || u.status === filterStatus;
            const typeMatch = filterType === 'All' || u.type === filterType;
            return statusMatch && typeMatch;
        });
    }, [selectedProject, filterStatus, filterType]);

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

    const handleSaveEdit = (updatedUnit: Unit) => {
        if (selectedProjectId) {
            onUpdateUnit(selectedProjectId, updatedUnit);
            setEditingUnit(null);
        }
    };

    const handleAdd = (newUnit: Unit) => {
        if (selectedProjectId) {
            onAddUnit(selectedProjectId, newUnit);
            setShowAddModal(false);
        }
    };

    const handleDelete = (unitId: string) => {
        if (selectedProjectId && window.confirm("Are you sure you want to delete this unit? This action cannot be undone.")) {
            onDeleteUnit(selectedProjectId, unitId);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-base-content">Inventory</h1>
                    <p className="text-sm text-muted-content mt-1">Manage plots, flats and bookings.</p>
                </div>
                <div className="w-full md:w-auto flex gap-2">
                    <select 
                        value={selectedProjectId} 
                        onChange={(e) => {
                            setSelectedProjectId(e.target.value);
                            setFilterType('All'); // Reset type filter on project change
                        }}
                        className="input-style font-semibold w-full md:w-64"
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    
                    {isAdmin && (
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-focus shadow-sm transition-colors whitespace-nowrap"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Add Unit
                        </button>
                    )}
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

            {/* Filters */}
            <div className="card p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                 <div className="flex flex-wrap gap-2">
                    {['All', 'Available', 'Booked', 'Hold'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilterStatus(f as any)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                filterStatus === f 
                                ? 'bg-gray-900 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-bold text-gray-500 uppercase">Type:</span>
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        className="input-style py-1.5 !w-auto text-sm"
                    >
                        <option value="All">All Types</option>
                        {availableTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Inventory Grid */}
            <div className="card p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {filteredUnits.map(unit => (
                        <UnitCard 
                            key={unit.id} 
                            unit={unit} 
                            onClick={() => setSelectedUnit(unit)}
                            onEdit={isAdmin ? (e) => setEditingUnit(unit) : undefined}
                            onDelete={isAdmin ? (e) => handleDelete(unit.id) : undefined}
                        />
                    ))}
                </div>
                
                {filteredUnits.length === 0 && (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">No units match the selected filters.</p>
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

            {editingUnit && (
                <EditUnitModal 
                    unit={editingUnit} 
                    onClose={() => setEditingUnit(null)} 
                    onSave={handleSaveEdit} 
                />
            )}

            {showAddModal && (
                <AddUnitModal
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAdd}
                />
            )}
        </div>
    );
};

export default InventoryPage;
