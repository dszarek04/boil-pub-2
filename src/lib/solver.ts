import { Supplier, Consumer, Iteration, Cell } from '@/types';

export function solveIntermediaryProblem(
  suppliers: Supplier[],
  consumers: Consumer[],
  transportCosts: number[][],
  blockedSuppliers: boolean[]
): Iteration[] {
  const iterations: Iteration[] = [];

  // 1. Calculate Unit Profits
  const rawProfits: number[][] = suppliers.map((s, i) =>
    consumers.map((c, j) => {
      return c.sellPrice - s.purchasePrice - transportCosts[i][j];
    })
  );

  // 2. Balancing (User logic: add both dummy nodes if unbalanced)
  const totalSupply = suppliers.reduce((sum, s) => sum + s.supply, 0);
  const totalDemand = consumers.reduce((sum, c) => sum + c.demand, 0);

  const balancedSuppliers = [...suppliers.map(s => ({ ...s }))];
  const balancedConsumers = [...consumers.map(c => ({ ...c }))];
  let balancedProfits = rawProfits.map(row => [...row]);

  let dummyConsumerIdx = -1;

  if (totalSupply !== totalDemand) {
    balancedConsumers.push({
      id: 'dummy_c',
      name: 'Odbiorca fikcyjny',
      demand: totalSupply,
      sellPrice: 0
    });
    dummyConsumerIdx = balancedConsumers.length - 1;
    balancedProfits.forEach(row => row.push(0));

    balancedSuppliers.push({
      id: 'dummy_s',
      name: 'Dostawca fikcyjny',
      supply: totalDemand,
      purchasePrice: 0
    });
    balancedProfits.push(new Array(balancedConsumers.length).fill(0));
  }

  if (dummyConsumerIdx !== -1) {
    suppliers.forEach((_, i) => {
      if (blockedSuppliers[i]) {
        balancedProfits[i][dummyConsumerIdx] = -1000000;
      }
    });
  }

  const rows = balancedSuppliers.length;
  const cols = balancedConsumers.length;

  // 3. Initial Solution: North-West Corner with Priority
  // We reorder the balancedSuppliers internally so that blocked ones are at the top (considered first).
  // This satisfies the "pierwsze rozpatrzony" requirement.
  const supplierIndices = Array.from({ length: rows }, (_, i) => i);
  supplierIndices.sort((a, b) => {
    const aBlocked = a < suppliers.length ? blockedSuppliers[a] : false;
    const bBlocked = b < suppliers.length ? blockedSuppliers[b] : false;
    if (aBlocked && !bBlocked) return -1;
    if (!aBlocked && bBlocked) return 1;
    return 0;
  });

  const reorderedSuppliers = supplierIndices.map(i => balancedSuppliers[i]);
  const reorderedProfits = supplierIndices.map(i => balancedProfits[i]);

  const currentMatrix: Cell[][] = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => ({
      amount: 0,
      unitProfit: reorderedProfits[i][j],
      isBasis: false
    }))
  );

  const sCopy = reorderedSuppliers.map(s => s.supply);
  const dCopy = balancedConsumers.map(c => c.demand);
  let r = 0, c = 0;
  while (r < rows && c < cols) {
    const val = Math.min(sCopy[r], dCopy[c]);
    currentMatrix[r][c].amount = val;
    currentMatrix[r][c].isBasis = true;
    sCopy[r] -= val;
    dCopy[c] -= val;
    if (sCopy[r] === 0 && r < rows - 1) r++;
    else c++;
  }

  // Map back to original order before optimization
  const mappedMatrix: Cell[][] = Array.from({ length: rows }, () => new Array(cols));
  supplierIndices.forEach((originalIdx, reorderedIdx) => {
    mappedMatrix[originalIdx] = currentMatrix[reorderedIdx].map(cell => ({
      ...cell,
      unitProfit: balancedProfits[originalIdx][Array.from({ length: cols }, (_, j) => j).indexOf(cell.unitProfit)] // placeholder, unitProfit is already correct
    }));
    // Actually, unitProfit is tied to the cell. We just need to move the assigned 'amount' and 'isBasis'
    for(let j=0; j<cols; j++) {
      mappedMatrix[originalIdx][j] = {
        amount: currentMatrix[reorderedIdx][j].amount,
        isBasis: currentMatrix[reorderedIdx][j].isBasis,
        unitProfit: balancedProfits[originalIdx][j]
      };
    }
  });

  fixDegeneracy(mappedMatrix, rows, cols);

  const calcTotalProfit = (m: Cell[][]) => 
    m.reduce((sum, row) => sum + row.reduce((s, cell) => {
      const p = cell.unitProfit <= -500000 ? 0 : cell.unitProfit;
      return s + cell.amount * p;
    }, 0), 0);

  let isOptimal = false;
  let safetyBreak = 0;
  
  let workingMatrix = mappedMatrix;

  while (!isOptimal && safetyBreak < 50) {
    safetyBreak++;
    const { alfa, beta } = calculatePotentials(workingMatrix, rows, cols);
    const { bestDelta, enterR, enterC } = calculateReducedCosts(workingMatrix, rows, cols, alfa, beta);

    iterations.push({
      title: iterations.length === 0 ? "Rozwiązanie początkowe" : `Iteracja ${iterations.length}`,
      matrix: workingMatrix.map(row => row.map(cell => ({ ...cell }))),
      alfa: [...alfa],
      beta: [...beta],
      totalProfit: calcTotalProfit(workingMatrix),
      isOptimal: bestDelta <= 0,
      enteringCell: bestDelta > 0 ? [enterR, enterC] : undefined
    });

    if (bestDelta <= 0) {
      isOptimal = true;
      break;
    }

    const cycle = findCycle(workingMatrix, rows, cols, enterR, enterC);
    if (!cycle) break;
    iterations[iterations.length - 1].cycle = cycle;

    let minVal = Infinity;
    let leaveIdx = -1;
    for (let i = 1; i < cycle.length; i += 2) {
      const [cr, cc] = cycle[i];
      if (workingMatrix[cr][cc].amount < minVal) {
        minVal = workingMatrix[cr][cc].amount;
        leaveIdx = i;
      }
    }

    for (let i = 0; i < cycle.length; i++) {
      const [cr, cc] = cycle[i];
      if (i % 2 === 0) {
        workingMatrix[cr][cc].amount += minVal;
        workingMatrix[cr][cc].isBasis = true;
      } else {
        workingMatrix[cr][cc].amount -= minVal;
        if (i === leaveIdx) {
          workingMatrix[cr][cc].isBasis = false;
          iterations[iterations.length - 1].leavingCell = [cr, cc];
        }
      }
    }
    fixDegeneracy(workingMatrix, rows, cols);
  }

  return iterations;
}

function calculatePotentials(matrix: Cell[][], rows: number, cols: number) {
  const alfa: (number | null)[] = new Array(rows).fill(null);
  const beta: (number | null)[] = new Array(cols).fill(null);
  alfa[0] = 0;

  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (matrix[i][j].isBasis) {
          if (alfa[i] !== null && beta[j] === null) {
            beta[j] = matrix[i][j].unitProfit - alfa[i]!;
            changed = true;
          } else if (beta[j] !== null && alfa[i] === null) {
            alfa[i] = matrix[i][j].unitProfit - beta[j]!;
            changed = true;
          }
        }
      }
    }
  }
  return { alfa, beta };
}

function calculateReducedCosts(matrix: Cell[][], rows: number, cols: number, alfa: (number | null)[], beta: (number | null)[]) {
  let bestDelta = -Infinity;
  let enterR = -1, enterC = -1;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (!matrix[i][j].isBasis) {
        let delta = matrix[i][j].unitProfit - ((alfa[i] || 0) + (beta[j] || 0));
        if (matrix[i][j].unitProfit <= -500000) {
          delta = -Infinity;
        }
        matrix[i][j].delta = delta;
        if (delta > bestDelta) {
          bestDelta = delta;
          enterR = i;
          enterC = j;
        }
      } else {
        matrix[i][j].delta = undefined;
      }
    }
  }
  return { bestDelta, enterR, enterC };
}

function findCycle(matrix: Cell[][], rows: number, cols: number, startR: number, startC: number) {
  const points: [number, number][] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j].isBasis || (i === startR && j === startC)) {
        points.push([i, j]);
      }
    }
  }

  function getPath(currentPath: [number, number][], horizontal: boolean): [number, number][] | null {
    const last = currentPath[currentPath.length - 1];
    if (currentPath.length > 3) {
      if (horizontal && last[0] === startR && last[1] !== startC) return currentPath;
      if (!horizontal && last[1] === startC && last[0] !== startR) return currentPath;
    }

    for (const p of points) {
      if (currentPath.some(cp => cp[0] === p[0] && cp[1] === p[1])) continue;
      if (horizontal && p[0] === last[0]) {
        const res = getPath([...currentPath, p], false);
        if (res) return res;
      } else if (!horizontal && p[1] === last[1]) {
        const res = getPath([...currentPath, p], true);
        if (res) return res;
      }
    }
    return null;
  }

  const path = getPath([[startR, startC]], true);
  return path;
}

function fixDegeneracy(matrix: Cell[][], rows: number, cols: number) {
  let basisCount = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j].isBasis) basisCount++;
    }
  }

  const target = rows + cols - 1;
  if (basisCount < target) {
    for (let i = 0; i < rows && basisCount < target; i++) {
      for (let j = 0; j < cols && basisCount < target; j++) {
        if (!matrix[i][j].isBasis) {
          if (!findCycle(matrix, rows, cols, i, j)) {
            matrix[i][j].isBasis = true;
            basisCount++;
          }
        }
      }
    }
  }
}
