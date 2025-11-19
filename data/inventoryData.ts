
export type InventoryStatus = 'Available' | 'Booked' | 'Hold' | 'Blocked';

export interface Unit {
    id: string;
    unitNumber: string;
    type: 'Plot' | 'Flat' | 'Villa';
    status: InventoryStatus;
    size: string; // e.g. "1200 sqft"
    price: string; // e.g. "15.5 Lac"
    facing?: string;
    floor?: string;
}

export interface Project {
    id: string;
    name: string;
    location: string;
    totalUnits: number;
    availableUnits: number;
    units: Unit[];
}

const generateUnits = (prefix: string, count: number, type: 'Plot' | 'Flat' | 'Villa'): Unit[] => {
    const units: Unit[] = [];
    const statuses: InventoryStatus[] = ['Available', 'Available', 'Available', 'Booked', 'Booked', 'Hold'];
    
    for (let i = 1; i <= count; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        units.push({
            id: `${prefix}-${i}`,
            unitNumber: `${prefix}-${i.toString().padStart(3, '0')}`,
            type,
            status,
            size: type === 'Plot' ? '1000 sqft' : '1250 sqft',
            price: type === 'Plot' ? `${(10 + Math.random() * 5).toFixed(1)} Lac` : `${(25 + Math.random() * 10).toFixed(1)} Lac`,
            facing: Math.random() > 0.5 ? 'East' : 'North',
            floor: type === 'Flat' ? `${Math.ceil(Math.random() * 5)}th` : undefined
        });
    }
    return units;
};

export const mockProjects: Project[] = [
    {
        id: 'p1',
        name: 'Sunrise City',
        location: 'Bhilai, Sector 4',
        totalUnits: 50,
        availableUnits: 32,
        units: generateUnits('A', 50, 'Plot')
    },
    {
        id: 'p2',
        name: 'Green Valley',
        location: 'Raipur, Ring Road',
        totalUnits: 40,
        availableUnits: 15,
        units: generateUnits('GV', 40, 'Villa')
    },
    {
        id: 'p3',
        name: 'Chouhan Heights',
        location: 'Durg, City Center',
        totalUnits: 100,
        availableUnits: 60,
        units: generateUnits('F', 100, 'Flat')
    }
];
