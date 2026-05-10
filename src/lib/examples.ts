export const examples = [
  {
    name: "1. Standardowy (wiele kroków)",
    suppliers: [
      { id: 's1', name: 'Dostawca 1', supply: 100, purchasePrice: 10 },
      { id: 's2', name: 'Dostawca 2', supply: 80, purchasePrice: 12 },
      { id: 's3', name: 'Dostawca 3', supply: 120, purchasePrice: 11 },
    ],
    consumers: [
      { id: 'c1', name: 'Odbiorca 1', demand: 90, sellPrice: 35 },
      { id: 'c2', name: 'Odbiorca 2', demand: 110, sellPrice: 38 },
      { id: 'c3', name: 'Odbiorca 3', demand: 100, sellPrice: 40 },
    ],
    transportCosts: [
      [8, 4, 12],
      [3, 10, 5],
      [15, 6, 2]
    ],
    blockedSuppliers: [false, false, false]
  },
  {
    name: "2. Tylko blokada dostawcy",
    suppliers: [
      { id: 's1', name: 'Dostawca 1', supply: 150, purchasePrice: 15 },
      { id: 's2', name: 'Dostawca 2', supply: 100, purchasePrice: 10 },
      { id: 's3', name: 'Dostawca 3', supply: 50, purchasePrice: 12 },
    ],
    consumers: [
      { id: 'c1', name: 'Odbiorca 1', demand: 100, sellPrice: 45 },
      { id: 'c2', name: 'Odbiorca 2', demand: 100, sellPrice: 45 },
      { id: 'c3', name: 'Odbiorca 3', demand: 100, sellPrice: 45 },
    ],
    transportCosts: [
      [20, 20, 20],
      [2, 5, 8],
      [5, 2, 4]
    ],
    blockedSuppliers: [true, false, false]
  },
  {
    name: "3. Tylko układ niezbilansowany",
    suppliers: [
      { id: 's1', name: 'Dostawca 1', supply: 200, purchasePrice: 10 },
      { id: 's2', name: 'Dostawca 2', supply: 300, purchasePrice: 10 },
      { id: 's3', name: 'Dostawca 3', supply: 250, purchasePrice: 10 },
    ],
    consumers: [
      { id: 'c1', name: 'Odbiorca 1', demand: 100, sellPrice: 30 },
      { id: 'c2', name: 'Odbiorca 2', demand: 150, sellPrice: 30 },
      { id: 'c3', name: 'Odbiorca 3', demand: 120, sellPrice: 30 },
    ],
    transportCosts: [
      [10, 2, 8],
      [1, 9, 4],
      [7, 5, 2]
    ],
    blockedSuppliers: [false, false, false]
  },
  {
    name: "4. Blokada + Niezbilansowany",
    suppliers: [
      { id: 's1', name: 'Dostawca 1', supply: 100, purchasePrice: 20 },
      { id: 's2', name: 'Dostawca 2', supply: 200, purchasePrice: 5 },
      { id: 's3', name: 'Dostawca 3', supply: 150, purchasePrice: 8 },
    ],
    consumers: [
      { id: 'c1', name: 'Odbiorca 1', demand: 250, sellPrice: 50 },
      { id: 'c2', name: 'Odbiorca 2', demand: 150, sellPrice: 55 },
      { id: 'c3', name: 'Odbiorca 3', demand: 200, sellPrice: 45 },
    ],
    transportCosts: [
      [15, 15, 15],
      [2, 10, 5],
      [8, 3, 12]
    ],
    blockedSuppliers: [true, false, false]
  }
];
