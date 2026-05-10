import { create } from 'zustand';
import { Supplier, Consumer, Iteration } from '@/types';

interface ExampleData {
  suppliers: Supplier[];
  consumers: Consumer[];
  transportCosts: number[][];
  blockedSuppliers?: boolean[];
}

interface AppState {
  suppliers: Supplier[];
  consumers: Consumer[];
  transportCosts: number[][]; // [supplierIndex][consumerIndex]
  blockedSuppliers: boolean[]; // [supplierIndex]
  
  iterations: Iteration[];
  currentIterationIndex: number;
  
  setSuppliers: (suppliers: Supplier[]) => void;
  setConsumers: (consumers: Consumer[]) => void;
  setTransportCosts: (costs: number[][]) => void;
  toggleSupplierBlock: (sIdx: number) => void;
  
  setIterations: (iterations: Iteration[]) => void;
  setCurrentIterationIndex: (index: number) => void;
  
  reset: () => void;
  loadExample: (example: ExampleData) => void;
}

const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Dostawca 1', supply: 100, purchasePrice: 10 },
  { id: 's2', name: 'Dostawca 2', supply: 200, purchasePrice: 12 },
];

const DEFAULT_CONSUMERS: Consumer[] = [
  { id: 'c1', name: 'Odbiorca 1', demand: 150, sellPrice: 25 },
  { id: 'c2', name: 'Odbiorca 2', demand: 150, sellPrice: 28 },
];

export const useStore = create<AppState>((set) => ({
  suppliers: DEFAULT_SUPPLIERS,
  consumers: DEFAULT_CONSUMERS,
  transportCosts: [[2, 4], [3, 1]],
  blockedSuppliers: [false, false],
  
  iterations: [],
  currentIterationIndex: 0,
  
  setSuppliers: (suppliers) => set((state) => ({ 
    suppliers,
    blockedSuppliers: suppliers.map((_, i) => state.blockedSuppliers[i] || false)
  })),
  setConsumers: (consumers) => set({ consumers }),
  setTransportCosts: (transportCosts) => set({ transportCosts }),
  
  toggleSupplierBlock: (sIdx) => set((state) => {
    const newBlocked = [...state.blockedSuppliers];
    newBlocked[sIdx] = !newBlocked[sIdx];
    return { blockedSuppliers: newBlocked };
  }),
  
  setIterations: (iterations) => set({ iterations, currentIterationIndex: 0 }),
  setCurrentIterationIndex: (currentIterationIndex) => set({ currentIterationIndex }),
  
  reset: () => set({
    iterations: [],
    currentIterationIndex: 0,
  }),
  
  loadExample: (example) => set({
    suppliers: example.suppliers,
    consumers: example.consumers,
    transportCosts: example.transportCosts,
    blockedSuppliers: example.blockedSuppliers || example.suppliers.map(() => false),
    iterations: [],
    currentIterationIndex: 0
  })
}));
