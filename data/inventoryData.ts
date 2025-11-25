
export type InventoryStatus = 'Available' | 'Booked' | 'Hold' | 'Blocked';

export type InventoryType = 'Plot' | 'Flat' | 'Villa' | 'Bungalow' | 'Commercial' | 'Row House' | 'Pent House';

export interface Unit {
    id: string;
    unitNumber: string;
    type: InventoryType;
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

const generateUnits = (prefix: string, count: number, type: InventoryType, startNum: number = 1): Unit[] => {
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
            case 'Pent House':
                size = ['2BHK (1100 sqft)', '3BHK (1500 sqft)'][Math.floor(Math.random() * 2)];
                price = size.includes('2BHK') ? '25.5 Lac' : '35.5 Lac';
                if (type === 'Pent House') price = '45.5 Lac';
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

// Helper to generate specific unit lists for Chouhan Green Valley
const getGreenValleyUnits = (): Unit[] => {
    const units: Unit[] = [];
    
    const addUnits = (block: string, type: InventoryType, size: string, price: string, numbers: string[], floor?: string) => {
        numbers.forEach(num => {
            units.push({
                id: `GV-${block.replace(/\s/g, '')}-${num}`,
                unitNumber: `${block} ${num}`,
                type,
                status: 'Available',
                size,
                price,
                facing: Math.random() > 0.5 ? 'East' : 'North',
                floor: floor || (type === 'Pent House' ? 'Top Floor' : 'Standard')
            });
        });
    };

    const range = (start: number, end: number) => Array.from({length: end - start + 1}, (_, i) => String(start + i));

    // 3 BHK Pent Houses (Block B)
    const ph3Price = '42.0 Lac';
    const ph3Size = '3 BHK Pent House';
    addUnits('B-4', 'Pent House', ph3Size, ph3Price, ['23A', '24A']);
    addUnits('B-5', 'Pent House', ph3Size, ph3Price, ['22A', '23A']);
    addUnits('B-6', 'Pent House', ph3Size, ph3Price, ['22A', '23A']);
    addUnits('B-7', 'Pent House', ph3Size, ph3Price, ['23A']);
    addUnits('B-10', 'Pent House', ph3Size, ph3Price, ['21A', '22A']);
    addUnits('B-11', 'Pent House', ph3Size, ph3Price, ['24A']);
    addUnits('B-12', 'Pent House', ph3Size, ph3Price, ['21A', '24A']);
    addUnits('B-13', 'Pent House', ph3Size, ph3Price, ['21A', '24A']);
    addUnits('B-14', 'Pent House', ph3Size, ph3Price, ['21A', '24A']);
    addUnits('B-15', 'Pent House', ph3Size, ph3Price, ['22A', '23A']);
    addUnits('B-16', 'Pent House', ph3Size, ph3Price, ['22A', '23A']);
    addUnits('B-17', 'Pent House', ph3Size, ph3Price, ['23A', '24A']);
    
    // 3 BHK Flats (Generic)
    addUnits('Block B', 'Flat', '3 BHK', '35.0 Lac', ['19', '20', '23', '24']);

    // 2 BHK Pent Houses (Block D & E)
    const ph2Price = '32.0 Lac';
    const ph2Size = '2 BHK Pent House';
    
    addUnits('D-1', 'Pent House', ph2Size, ph2Price, ['41A', '42A']);
    addUnits('D-2', 'Pent House', ph2Size, ph2Price, ['41A', '42A', '43A']);
    addUnits('D-3', 'Pent House', ph2Size, ph2Price, ['41A', '42A', '43A', '44A']);
    addUnits('D-4', 'Pent House', ph2Size, ph2Price, ['42A', '43A', '44A']);
    addUnits('D-6', 'Pent House', ph2Size, ph2Price, ['45A', '46A', '47A', '48A']);
    addUnits('D-7', 'Pent House', ph2Size, ph2Price, ['45A', '46A', '47A', '48A']);
    addUnits('D-8', 'Pent House', ph2Size, ph2Price, ['45A', '46A', '47A']);
    addUnits('D-9', 'Pent House', ph2Size, ph2Price, ['45A', '46A', '48A']);
    addUnits('D-10', 'Pent House', ph2Size, ph2Price, ['45A', '46A', '47A']);
    addUnits('D-11', 'Pent House', ph2Size, ph2Price, ['41A', '42A', '43A', '44A']);
    addUnits('D-12', 'Pent House', ph2Size, ph2Price, ['41A', '42A', '43A', '44A']);
    
    addUnits('E-3', 'Pent House', ph2Size, ph2Price, ['42A', '43A']);
    addUnits('E-4', 'Pent House', ph2Size, ph2Price, ['42A']);
    addUnits('E-5', 'Pent House', ph2Size, ph2Price, ['42A', '43A', '44A']);
    addUnits('E-6', 'Pent House', ph2Size, ph2Price, ['41A', '42A', '43A', '44A']);

    // 2 BHK Flats (Block D & E)
    const flat2Price = '25.0 Lac';
    const flat2Size = '2 BHK Flat';
    
    addUnits('D-6', 'Flat', flat2Size, flat2Price, ['34', '42', '43', '46']);
    addUnits('D-8', 'Flat', flat2Size, flat2Price, ['42', '43', '46']);
    addUnits('D-9', 'Flat', flat2Size, flat2Price, ['41', '43']);
    addUnits('D-10', 'Flat', flat2Size, flat2Price, ['34', '36', '42', '43']);
    addUnits('D-11', 'Flat', flat2Size, flat2Price, ['34', '39', '42', '43', '46', '47', '48']);
    addUnits('D-12', 'Flat', flat2Size, flat2Price, ['6', '7', '10', '14', '15', '18', '19', '21', '22', '23', '24', '25', '26', '27', '29', '30', '31', '32', ...range(33, 48)]);
    
    addUnits('E-5', 'Flat', flat2Size, flat2Price, ['34', '42', '46', '47']);
    addUnits('E-6', 'Flat', flat2Size, flat2Price, ['2', '6', '7', '10', '11', '15', '18', '19', '22', '23', '26', '27', '30', '31', '34', '35', '38', '39', '42', '43', '46', '47']);

    // Bungalows
    addUnits('Aster', 'Bungalow', '4 BHK', '85.0 Lac', ['91', '92', '93', '94', '95', '114', '115', ...range(118, 128), ...range(150, 159)]);
    addUnits('Iris', 'Bungalow', '5 BHK', '1.10 Cr', [...range(1, 10), '16', '17', '23', '56', '57']);
    addUnits('Orchid', 'Bungalow', '5 BHK', '1.25 Cr', ['12', '23', '24', '25', '30', '33', '36', '37']);
    addUnits('Lavender', 'Bungalow', '5 BHK', '1.30 Cr', ['2', '3']);
    addUnits('Marigold', 'Bungalow', '4 BHK', '90.0 Lac', ['40']);

    return units;
};

// Helper to generate specific unit lists for Chouhan Town
const getChouhanTownUnits = (): Unit[] => {
    const units: Unit[] = [];
    
    const addUnits = (block: string, type: InventoryType, size: string, price: string, numbers: string[]) => {
        numbers.forEach(num => {
             units.push({
                id: `CT-${block}-${num.replace(/\s/g, '')}`,
                unitNumber: `${block}-${num}`,
                type,
                status: 'Available',
                size,
                price,
                facing: Math.random() > 0.5 ? 'East' : 'West',
                floor: type === 'Pent House' ? 'Top Floor' : (type === 'Bungalow' ? 'G+1' : 'Standard')
            });
        });
    };

    const range = (start: number, end: number) => Array.from({length: end - start + 1}, (_, i) => String(start + i));

    // B Blocks - 3 BHK Pent Houses
    const ph3Price = '45.0 Lac';
    ['B-1', 'B-2', 'B-3'].forEach(block => {
        addUnits(block, 'Pent House', '3 BHK', ph3Price, ['23A', '24A']);
    });

    // D-1
    addUnits('D-1', 'Flat', '3 BHK', '35.0 Lac', ['45']);
    addUnits('D-1', 'Pent House', '3 BHK', ph3Price, ['41A', '44A']);
    addUnits('D-1', 'Pent House', '2 BHK', '32.0 Lac', ['42A', '43A']);

    // D-2
    addUnits('D-2', 'Pent House', '3 BHK', ph3Price, ['41A', '44A']);
    addUnits('D-2', 'Pent House', '2 BHK', '32.0 Lac', ['42A', '43A']);

    // E Blocks
    addUnits('E-5', 'Pent House', '3 BHK', ph3Price, ['21A', '22A']);
    addUnits('E-6', 'Pent House', '3 BHK', ph3Price, ['21A', '22A']);
    addUnits('E-8', 'Pent House', '3 BHK', ph3Price, ['24A']);
    addUnits('E-9', 'Pent House', '3 BHK', ph3Price, ['21A']);

    // E-10
    addUnits('E-10', 'Flat', '3 BHK', '35.0 Lac', range(1, 4));
    addUnits('E-10', 'Flat', '3 BHK', '35.0 Lac', ['5', '6']);
    addUnits('E-10', 'Flat', '3 BHK', '35.0 Lac', ['9', '10']);
    addUnits('E-10', 'Flat', '3 BHK', '35.0 Lac', ['13', '14', '15']);
    addUnits('E-10', 'Flat', '3 BHK', '35.0 Lac', range(17, 20));
    addUnits('E-10', 'Flat', '3 BHK', '35.0 Lac', range(21, 24));
    addUnits('E-10', 'Pent House', '3 BHK', ph3Price, ['23A', '24A']);

    // Bungalows (Block B & D)
    const bung4Price = '85.0 Lac';
    addUnits('Block B', 'Bungalow', '4 BHK', bung4Price, ['21']);
    addUnits('Block D', 'Bungalow', '4 BHK', bung4Price, ['51', '58', '59', ...range(63, 71), '73']);

    return units;
};

// Helper to generate specific unit lists for Chouhan Park View
const getChouhanParkViewUnits = (): Unit[] => {
    const units: Unit[] = [];
    const range = (start: number, end: number) => Array.from({length: end - start + 1}, (_, i) => String(start + i));

    const addUnit = (type: InventoryType, number: string, size: string, price: string, floor?: string) => {
         units.push({
            id: `CPV-${type.replace(/\s/g, '')}-${number.replace(/\s/g, '')}`,
            unitNumber: number,
            type,
            status: 'Available',
            size,
            price,
            facing: Math.random() > 0.5 ? 'East' : 'North',
            floor: floor || 'Standard'
        });
    }

    // 1. Flats
    ['06', '07', '08', '15', '16', '24', '32', '40', '48'].forEach(num => 
        addUnit('Flat', `Flat ${num}`, '2 BHK', '25.0 Lac', `${Math.ceil(Math.random() * 4)}th Floor`)
    );

    // 2. Pent House
    ['49', '50'].forEach(num => 
        addUnit('Pent House', `PH ${num}`, '3 BHK Pent House', '45.0 Lac', 'Top Floor')
    );

    // 3. Bungalow A-Type
    ['A-2', 'A-6'].forEach(num => 
        addUnit('Bungalow', num, 'Bungalow A-Type', '75.0 Lac', 'G+1')
    );

    // 4. Bungalow B-Type
    const bTypeNums = [...range(8, 21), ...range(29, 35)].map(n => `B-${n}`);
    bTypeNums.forEach(num => 
        addUnit('Bungalow', num, 'Bungalow B-Type', '65.0 Lac', 'G+1')
    );

    // 5. Plot A-Type
    range(7, 9).map(n => `A-${n}`).forEach(num => 
        addUnit('Plot', num, 'Plot A-Type', '22.0 Lac')
    );

    // 6. Plot B-Type
    range(22, 28).map(n => `B-${n}`).forEach(num => 
        addUnit('Plot', num, 'Plot B-Type', '18.0 Lac')
    );

    return units;
};

// Helper for Sunrise City
const getSunriseCityUnits = (): Unit[] => {
    const units: Unit[] = [];
    const range = (start: number, end: number) => Array.from({length: end - start + 1}, (_, i) => String(start + i));

    const addUnit = (block: string, number: string, size: string, price: string) => {
         units.push({
            id: `SC-${block}-${number}`,
            unitNumber: `${block}-${number}`,
            type: 'Plot',
            status: 'Available',
            size,
            price,
            facing: Math.random() > 0.5 ? 'East' : 'West',
        });
    }

    // A-Type: A-2 to A-20 (Quantity 19)
    range(2, 20).forEach(num => addUnit('A', num, '1500 sqft', '22.5 Lac'));

    // B-Type: B-16 to B-25, 29, 44 to 55 (Quantity 23)
    range(16, 25).forEach(num => addUnit('B', num, '1200 sqft', '18.0 Lac'));
    addUnit('B', '29', '1200 sqft', '18.0 Lac');
    range(44, 55).forEach(num => addUnit('B', num, '1200 sqft', '18.0 Lac'));

    // C-Type: C-8 to 21, 24, 25, 32, 33, 35, 37 to 52, 54 to 57, 59 to 114 (Quantity 95)
    range(8, 21).forEach(num => addUnit('C', num, '1000 sqft', '15.0 Lac'));
    ['24', '25', '32', '33', '35'].forEach(num => addUnit('C', num, '1000 sqft', '15.0 Lac'));
    range(37, 52).forEach(num => addUnit('C', num, '1000 sqft', '15.0 Lac'));
    range(54, 57).forEach(num => addUnit('C', num, '1000 sqft', '15.0 Lac'));
    range(59, 114).forEach(num => addUnit('C', num, '1000 sqft', '15.0 Lac'));

    return units;
};

// Helper for Green Valley Phase 3
const getGreenValleyPhase3Units = (): Unit[] => {
    const units: Unit[] = [];
    const range = (start: number, end: number) => Array.from({length: end - start + 1}, (_, i) => String(start + i));

    const addUnit = (type: string, block: string, number: string, size: string, price: string) => {
         units.push({
            id: `GVP3-${block}-${number}`,
            unitNumber: `${block}-${number}`,
            type: 'Plot',
            status: 'Available',
            size,
            price,
            facing: Math.random() > 0.5 ? 'East' : 'West',
        });
    }

    // A-Type
    // A-1 to 4, 6 to 17, A-19 to 21, 54, 55, A-58 to 64, 68
    const aNums = [
        ...range(1, 4), ...range(6, 17), ...range(19, 21), 
        '54', '55', ...range(58, 64), '68'
    ];
    aNums.forEach(num => addUnit('A-Type', 'A', num, '1500 sqft', '25.0 Lac'));

    // B-Type
    // B-1 to 48, 51 to 60, 75 to 93, 135, 137 to 145, 147 to 148, 150, 151, 154 to 159, 171, 176
    const bNums = [
        ...range(1, 48), ...range(51, 60), ...range(75, 93),
        '135', ...range(137, 145), ...range(147, 148),
        '150', '151', ...range(154, 159), '171', '176'
    ];
    bNums.forEach(num => addUnit('B-Type', 'B', num, '1200 sqft', '20.0 Lac'));

    // C-Type
    // C-1 to 8, 10 to 49, 52
    const cNums = [
        ...range(1, 8), ...range(10, 49), '52'
    ];
    cNums.forEach(num => addUnit('C-Type', 'C', num, '1000 sqft', '16.0 Lac'));

    return units;
};

// Helper for Singapore City Phase 1
const getSingaporeCityPhase1Units = (): Unit[] => {
    const units: Unit[] = [];
    const range = (start: number, end: number) => Array.from({length: end - start + 1}, (_, i) => String(start + i));

    const addUnit = (block: string, number: string, size: string, price: string) => {
         units.push({
            id: `SCP1-${block}-${number}`,
            unitNumber: `${block}-${number}`,
            type: 'Plot',
            status: 'Available',
            size,
            price,
            facing: Math.random() > 0.5 ? 'East' : 'West',
        });
    }

    // A-Type (10)
    ['4', '5', ...range(6, 9), ...range(15, 18)].forEach(num => addUnit('A', num, '1500 sqft', '22.5 Lac'));

    // B-Type (11)
    ['6', '8', ...range(14, 18), '27', '28', '31', '35'].forEach(num => addUnit('B', num, '1200 sqft', '18.0 Lac'));

    // C-Type (5)
    ['7', '8', '26', '28', '30'].forEach(num => addUnit('C', num, '1000 sqft', '15.0 Lac'));

    // D-Type (39)
    const dNums = [
        ...range(5, 9), ...range(11, 13), ...range(17, 28),
        '34', '42', ...range(49, 53), ...range(57, 65), '71'
    ];
    dNums.forEach(num => addUnit('D', num, '1000 sqft', '15.0 Lac'));

    // F-Type (6)
    range(1, 6).forEach(num => addUnit('F', num, '1200 sqft', '20.0 Lac'));

    // L-Type (20)
    [...range(3, 8), ...range(13, 26)].forEach(num => addUnit('L', num, '1200 sqft', '18.0 Lac'));

    return units;
};


export const mockProjects: Project[] = [
    {
        id: 'p1',
        name: 'Chouhan Park View',
        location: 'Junwani, Bhilai',
        totalUnits: 100,
        availableUnits: 44,
        units: getChouhanParkViewUnits()
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
        availableUnits: 55, // Updated approximate count
        units: getChouhanTownUnits()
    },
    {
        id: 'p6',
        name: 'Chouhan Green Valley',
        location: 'Junwani',
        totalUnits: 250,
        availableUnits: 176, 
        units: getGreenValleyUnits()
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
        totalUnits: 250,
        availableUnits: 187,
        units: getGreenValleyPhase3Units()
    },
    {
        id: 'p9',
        name: 'Sunrise City',
        location: 'Sirsakhurd',
        totalUnits: 200, // Estimated total
        availableUnits: 137, // Exact count from helper
        units: getSunriseCityUnits()
    },
    {
        id: 'p10',
        name: 'Singapore City P1',
        location: 'Junwani',
        totalUnits: 150,
        availableUnits: 91,
        units: getSingaporeCityPhase1Units()
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
