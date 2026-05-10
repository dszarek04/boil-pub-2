export interface Supplier {
  id: string;
  name: string;
  supply: number;
  purchasePrice: number;
}

export interface Consumer {
  id: string;
  name: string;
  demand: number;
  sellPrice: number;
}

export interface Cell {
  amount: number;
  unitProfit: number;
  isBasis: boolean;
  delta?: number;
}

export interface Iteration {
  title: string;
  matrix: Cell[][];
  alfa: (number | null)[];
  beta: (number | null)[];
  totalProfit: number;
  isOptimal: boolean;
  enteringCell?: [number, number];
  leavingCell?: [number, number];
  cycle?: [number, number][];
}

export interface SolverData {
  suppliers: Supplier[];
  consumers: Consumer[];
  transportCosts: number[][];
  blockedSuppliers: boolean[];
}
