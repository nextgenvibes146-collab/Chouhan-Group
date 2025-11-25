
export type InventoryStatus = 'Available' | 'Booked' | 'Hold' | 'Blocked';

export interface Unit {
    id: string;
    unitNumber: string;
    type: 'Plot' | 'Flat' | 'Villa' | 'Bungalow' | 'Commercial' | 'Row House';
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

const generateUnits = (prefix: string, count: number, type: 'Plot' | 'Flat' | 'Villa' | 'Bungalow' | 'Commercial' | 'Row House', startNum: number = 1): Unit[] => {
    const units: Unit[] = [];
    const statuses: InventoryStatus[] = ['Available', 'Available', 'Available', 'Booked', 'Booked', 'Hold'];
    
    for (let i = startNum; i < startNum + count; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        let price = '0 Lac';
        let size = '0 sqft';

        switch(type) {
            case 'Plot':
                size = ['600', '800', '1000', '1200', '1500'][Math.floor(Math.random() * 5)] + ' sqft';
                price = `${(parseInt(size) * (1500 + Math.random() * 500) / 100000).toFixed(1)} Lac`;
                break;
            case 'Flat':
                size = ['2BHK (1100 sqft)', '3BHK (1500 sqft)'][Math.floor(Math.random() * 2)];
                price = size.includes('2BHK') ? '25.5 Lac' : '35.5 Lac';
                break;
            case 'Bungalow':
            case 'Villa':
            case 'Row House':
                size = ['3BHK', '4BHK'][Math.floor(Math.random() * 2)];
                price = type === 'Row House' ? '45.0 Lac' : '65.0 Lac';
                break;
            case 'Commercial':
                size = ['Shop (200 sqft)', 'Office (500 sqft)', 'Showroom (1000 sqft)'][Math.floor(Math.random() * 3)];
                price = `${(10 + Math.random() * 40).toFixed(1)} Lac`;
                break;
        }

        units.push({
            id: `${prefix}-${i}`,
            unitNumber: `${prefix}-${i.toString().padStart(3, '0')}`,
            type,
            status,
            size,
            price,
            facing: Math.random() > 0.5 ? 'East' : 'North',
            floor: (type === 'Flat' || type === 'Commercial') ? `${Math.ceil(Math.random() * 4)}th` : 'G+1'
        });
    }
    return units;
};

export const mockProjects: Project[] = [
    {
        id: 'p1',
        name: 'Chouhan Park View',
        location: 'Junwani',
        totalUnits: 60,
        availableUnits: 25,
        units: [
            ...generateUnits('B', 20, 'Bungalow'),
            ...generateUnits('F', 40, 'Flat', 21)
        ]
    },
    {
        id: 'p2',
        name: 'Chouhan Business Park P1',
        location: 'Khapri',
        totalUnits: 40,
        availableUnits: 12,
        units: generateUnits('C1', 40, 'Commercial')
    },
    {
        id: 'p3',
        name: 'Chouhan Business Park P2',
        location: 'Khapri',
        totalUnits: 30,
        availableUnits: 15,
        units: generateUnits('C2', 30, 'Commercial')
    },
    {
        id: 'p4',
        name: 'Chouhan Business Center P1 & P2',
        location: 'Dmart Junwani',
        totalUnits: 50,
        availableUnits: 20,
        units: generateUnits('CBC', 50, 'Commercial')
    },
    {
        id: 'p5',
        name: 'Chouhan Town',
        location: 'Junwani',
        totalUnits: 80,
        availableUnits: 30,
        units: [
            ...generateUnits('TB', 30, 'Bungalow'),
            ...generateUnits('TF', 50, 'Flat', 31)
        ]
    },
    {
        id: 'p6',
        name: 'Chouhan Green Valley P1',
        location: 'Junwani',
        totalUnits: 70,
        availableUnits: 22,
        units: [
            ...generateUnits('GVF', 50, 'Flat'),
            ...generateUnits('GVB', 20, 'Bungalow', 51)
        ]
    },
    {
        id: 'p7',
        name: 'Chouhan Green Valley P2',
        location: 'Junwani',
        totalUnits: 100,
        availableUnits: 45,
        units: generateUnits('P2', 100, 'Plot')
    },
    {
        id: 'p8',
        name: 'Chouhan Green Valley P3',
        location: 'Junwani',
        totalUnits: 120,
        availableUnits: 60,
        units: generateUnits('P3', 120, 'Plot')
    },
    {
        id: 'p9',
        name: 'Sunrise City',
        location: 'Sirsakhurd',
        totalUnits: 150,
        availableUnits: 80,
        units: [
            ...generateUnits('SP', 120, 'Plot'),
            ...generateUnits('SC', 30, 'Commercial', 121)
        ]
    },
    {
        id: 'p10',
        name: 'Singapore City P1',
        location: 'Junwani',
        totalUnits: 90,
        availableUnits: 10,
        units: generateUnits('SG1', 90, 'Plot')
    },
    {
        id: 'p11',
        name: 'Singapore City P2',
        location: 'Junwani',
        totalUnits: 80,
        availableUnits: 40,
        units: generateUnits('SG2', 80, 'Plot')
    },
    {
        id: 'p12',
        name: 'Singapore City P4',
        location: 'Kutelabhata',
        totalUnits: 100,
        availableUnits: 55,
        units: [
            ...generateUnits('SG4P', 70, 'Plot'),
            ...generateUnits('SG4RH', 30, 'Row House', 71)
        ]
    },
    {
        id: 'p13',
        name: 'Singapore City P3',
        location: 'Junwani',
        totalUnits: 40,
        availableUnits: 18,
        units: generateUnits('MALL', 40, 'Commercial')
    }
];
